import os, shutil, re
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from datetime import datetime, timedelta, date
from database.connection import get_db
from database.models import (
    Staff, StaffAssignment, 
    Patient, 
    CertificationPeriod, 
    Document, 
    PatientExerciseAssignment, Exercise,
    Visit,
    NoteSection, VisitNote,
    NoteTemplate, NoteTemplateSection)
from schemas import (
    StaffCreate, StaffResponse, StaffAssignmentResponse,
    PatientCreate, PatientResponse,
    CertificationPeriodResponse,
    DocumentResponse, 
    ExerciseCreate, ExerciseResponse, PatientExerciseAssignmentCreate, 
    VisitCreate, VisitResponse,
    VisitNoteCreate, VisitNoteResponse,
    NoteSectionCreate, NoteSectionResponse,
    NoteTemplateCreate, NoteTemplateResponse)
from auth.security import hash_password
from auth.auth_middleware import role_required, get_current_user

router = APIRouter()

def determine_note_status(sections_data, template, db):
    if not sections_data or len(sections_data) == 0:
        return "Scheduled"
    
    template_sections = db.query(NoteTemplateSection).filter(
        NoteTemplateSection.template_id == template.id
    ).all()
    
    total_sections = len(template_sections)
    sections_with_data = 0
    
    for ts in template_sections:
        section = db.query(NoteSection).filter(NoteSection.id == ts.section_id).first()
        if section and section.section_name in sections_data:
            section_data = sections_data[section.section_name]
            
            if section_data and isinstance(section_data, dict):
                has_data = False
                for key, value in section_data.items():
                    if value is not None:
                        if isinstance(value, str) and value.strip():
                            has_data = True
                            break
                        elif isinstance(value, (int, float)) and value > 0:
                            has_data = True
                            break
                        elif isinstance(value, bool) and value:
                            has_data = True
                            break
                        elif isinstance(value, list) and len(value) > 0:
                            has_data = True
                            break
                        elif isinstance(value, dict) and any(v for v in value.values() if v):
                            has_data = True
                            break
                
                if has_data:
                    sections_with_data += 1
    
    if sections_with_data == 0:
        return "Scheduled"
    elif sections_with_data == total_sections:
        return "Completed"
    else:
        return "Pending"

BASE_STORAGE_PATH = "/app/storage/docs"

#====================== STAFF ======================#

@router.post("/staff/", response_model=StaffResponse)
def create_staff(staff: StaffCreate, db: Session = Depends(get_db)):
    existing_email = db.query(Staff).filter(Staff.email == staff.email).first()
    existing_username = db.query(Staff).filter(Staff.username == staff.username).first()

    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered.")
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already registered.")

    hashed_password = hash_password(staff.password)
    staff_data = staff.dict()
    staff_data["password"] = hashed_password

    new_staff = Staff(**staff_data)
    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)

    return StaffResponse.model_validate(new_staff)

@router.post("/assign-staff", response_model=StaffAssignmentResponse)
def assign_staff_to_patient(patient_id: int, staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found.")

    assigned_role = staff.role.upper()
    discipline_groups = {
        'PT': ['PT'], 'PTA': ['PTA'], 'OT': ['OT'], 
        'COTA': ['COTA'], 'ST': ['ST'], 'STA': ['STA']
    }
    roles_to_replace = discipline_groups.get(assigned_role, [assigned_role])
    
    existing_assignment = db.query(StaffAssignment).options(joinedload(StaffAssignment.staff)).filter(
        StaffAssignment.patient_id == patient_id,
        StaffAssignment.assigned_role.in_(roles_to_replace)
    ).first()

    if existing_assignment and existing_assignment.staff_id == staff_id:
        return StaffAssignmentResponse(
            id=existing_assignment.id,
            assigned_at=existing_assignment.assigned_at,
            assigned_role=existing_assignment.assigned_role,
            staff=StaffResponse.model_validate(existing_assignment.staff)
        )

    if existing_assignment:
        existing_assignment.staff_id = staff_id
        existing_assignment.assigned_role = assigned_role
        existing_assignment.assigned_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_assignment)
        return StaffAssignmentResponse(
            id=existing_assignment.id,
            assigned_at=existing_assignment.assigned_at,
            assigned_role=existing_assignment.assigned_role,
            staff=StaffResponse.model_validate(staff)
        )

    new_assignment = StaffAssignment(
        patient_id=patient_id,
        staff_id=staff_id,
        assigned_role=assigned_role,
        assigned_at=datetime.utcnow()
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    
    return StaffAssignmentResponse(
        id=new_assignment.id,
        assigned_at=new_assignment.assigned_at,
        assigned_role=new_assignment.assigned_role,
        staff=StaffResponse.model_validate(staff)
    )

#====================== PATIENTS ======================#

@router.post("/patients/", response_model=PatientResponse)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    existing = db.query(Patient).filter(
        Patient.full_name == patient.full_name,
        Patient.birthday == patient.birthday
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Patient already registered.")

    agency = db.query(Staff).filter(Staff.id == patient.agency_id).first()
    if not agency:
        raise HTTPException(status_code=404, detail="Agency does not exist.")
    if agency.role.lower() != "agency":
        raise HTTPException(status_code=400, detail="Provided ID does not belong to a valid agency.")

    new_patient = Patient(**patient.dict(exclude={"initial_cert_start_date"}))
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    cert_start = patient.initial_cert_start_date
    cert_end = cert_start + timedelta(days=60)
    cert_period = CertificationPeriod(
        patient_id=new_patient.id,
        start_date=cert_start,
        end_date=cert_end,
        is_active=True
    )
    db.add(cert_period)
    db.commit()

    return PatientResponse.model_validate(new_patient)

#====================== DOCUMENTS ======================#

def sanitize_filename(filename: str) -> str:
    name, ext = os.path.splitext(filename)
    name = re.sub(r'[^\w\d-]', '_', name)
    return f"{name}{ext.lower()}"

@router.post("/documents/upload", response_model=DocumentResponse)
def upload_document(
    file: UploadFile = File(...),
    patient_id: int = Form(None),
    staff_id: int = Form(None),
    db: Session = Depends(get_db)
):
    if patient_id and staff_id:
        raise HTTPException(status_code=400, detail="Provide only patient_id or staff_id, not both.")
    if not patient_id and not staff_id:
        raise HTTPException(status_code=400, detail="You must specify either patient_id or staff_id.")
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    clean_name = sanitize_filename(file.filename)
    entity = "patients" if patient_id else "staff"
    entity_id = patient_id or staff_id
    folder_path = os.path.join(BASE_STORAGE_PATH, entity, str(entity_id))
    os.makedirs(folder_path, exist_ok=True)
    file_path = os.path.join(folder_path, clean_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_doc = Document(
        patient_id=patient_id,
        staff_id=staff_id,
        file_name=clean_name,
        file_path=file_path,
        uploaded_at=datetime.utcnow()
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc

#====================== EXERCISES ======================#

@router.post("/exercises/", response_model=ExerciseResponse)
def create_exercise(exercise: ExerciseCreate, db: Session = Depends(get_db)):
    new_exercise = Exercise(**exercise.dict())
    db.add(new_exercise)
    db.commit()
    db.refresh(new_exercise)
    return new_exercise

@router.post("/patients/exercises/")
def assign_exercises_to_patient(assignments: List[PatientExerciseAssignmentCreate], db: Session = Depends(get_db)):
    for assignment in assignments:
        db.add(PatientExerciseAssignment(**assignment.dict()))
    db.commit()
    return {"message": "Exercises assigned successfully."}

#====================== CERTIFICATION PERIODS ======================#

@router.post("/patients/{patient_id}/certification-period", response_model=CertificationPeriodResponse)
def create_certification_period(patient_id: int, start_date: date, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    end_date = start_date + timedelta(days=60)
    today = date.today()
    is_active = patient.is_active and (start_date <= today <= end_date)

    new_cert = CertificationPeriod(
        patient_id=patient_id,
        start_date=start_date,
        end_date=end_date,
        is_active=is_active
    )
    db.add(new_cert)
    db.commit()
    db.refresh(new_cert)
    return new_cert

#====================== VISITS ======================#

@router.post("/visits/assign", response_model=VisitResponse)
def create_visit(data: VisitCreate, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.id == data.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    cert = db.query(CertificationPeriod).filter(
        CertificationPeriod.patient_id == data.patient_id,
        CertificationPeriod.start_date <= data.visit_date,
        CertificationPeriod.end_date >= data.visit_date
    ).first()
    if not cert:
        raise HTTPException(status_code=404, detail="No certification period found for given date")

    # Validate approved visit limits
    therapy_type = staff.role.upper()
    discipline_map = {
        'PT': 'pt_approved_visits',
        'PTA': 'pt_approved_visits',
        'OT': 'ot_approved_visits', 
        'COTA': 'ot_approved_visits',
        'ST': 'st_approved_visits',
        'STA': 'st_approved_visits'
    }
    
    approved_field = discipline_map.get(therapy_type)
    if approved_field:
        approved_limit = getattr(cert, approved_field, 0)
        if approved_limit > 0:
            # Count existing visits for this discipline in the certification period
            existing_visits = db.query(Visit).filter(
                Visit.certification_period_id == cert.id,
                Visit.therapy_type.in_(['PT', 'PTA'] if therapy_type in ['PT', 'PTA'] 
                                     else ['OT', 'COTA'] if therapy_type in ['OT', 'COTA']
                                     else ['ST', 'STA'])
            ).count()
            
            if existing_visits >= approved_limit:
                discipline_name = 'PT' if therapy_type in ['PT', 'PTA'] else 'OT' if therapy_type in ['OT', 'COTA'] else 'ST'
                raise HTTPException(
                    status_code=400, 
                    detail=f"Cannot schedule visit: {discipline_name} approved visits limit ({approved_limit}) reached. Current visits: {existing_visits}"
                )

    visit = Visit(
        patient_id=data.patient_id,
        staff_id=data.staff_id,
        certification_period_id=cert.id,
        visit_date=data.visit_date,
        visit_type=data.visit_type,
        therapy_type=staff.role.upper(),
        status=data.status,
        scheduled_time=data.scheduled_time
    )
    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit

@router.post("/visit-notes/", response_model=VisitNoteResponse)
def create_visit_note(note_data: VisitNoteCreate, db: Session = Depends(get_db)):
    
    visit = db.query(Visit).filter(Visit.id == note_data.visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    existing_note = db.query(VisitNote).filter(VisitNote.visit_id == note_data.visit_id).first()
    if existing_note:
        raise HTTPException(status_code=400, detail="Note already exists for this visit")
    
    template = db.query(NoteTemplate).filter_by(
        discipline=visit.therapy_type.upper(),
        note_type=visit.visit_type,
        is_active=True
    ).first()
    
    if not template:
        raise HTTPException(
            status_code=404, 
            detail=f"No active template found for discipline '{visit.therapy_type}' and note type '{visit.visit_type}'"
        )
    
    # Process sections_data to ensure we use section names, not IDs
    sections_data = note_data.sections_data
    if not sections_data or len(sections_data) == 0:
        # Create empty sections with names when no data provided
        sections = db.query(NoteTemplateSection).filter(
            NoteTemplateSection.template_id == template.id
        ).order_by(NoteTemplateSection.position.asc()).all()
        sections_data = {}
        for s in sections:
            section = db.query(NoteSection).filter(NoteSection.id == s.section_id).first()
            if section:
                sections_data[section.section_name] = {}
    # Note: Frontend should always send section names, not IDs
    # If we receive IDs, they will be handled in future iterations
    
    note_status = determine_note_status(sections_data, template, db)
    
    staff = db.query(Staff).filter(Staff.id == visit.staff_id).first()
    therapist_name = staff.name if staff else "Unknown Therapist"
    
    note = VisitNote(
        visit_id=note_data.visit_id,
        status=note_status,
        sections_data=sections_data,
        therapist_name=therapist_name
    )
    db.add(note)
    
    visit = db.query(Visit).filter(Visit.id == note_data.visit_id).first()
    if visit:
        visit.status = note_status
    
    db.commit()
    db.refresh(note)
    
    return note

#====================== NOTES ======================

@router.post("/note-templates", response_model=NoteTemplateResponse)
def create_template(template_data: NoteTemplateCreate, db: Session = Depends(get_db)):
    existing = db.query(NoteTemplate).filter_by(
        discipline=template_data.discipline,
        note_type=template_data.note_type
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Template already exists for this discipline and note type.")
        
    new_template = NoteTemplate(
        discipline=template_data.discipline,
        note_type=template_data.note_type,
        is_active=template_data.is_active
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)

    for i, section_id in enumerate(template_data.section_ids):
        db.add(NoteTemplateSection(template_id=new_template.id, section_id=section_id, position=i))
    
    db.commit()
    return new_template

@router.post("/note-sections", response_model=NoteSectionResponse)
def create_section(data: NoteSectionCreate, db: Session = Depends(get_db)):
    existing = db.query(NoteSection).filter_by(section_name=data.section_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Section with this name already exists")

    section = NoteSection(**data.dict())
    db.add(section)
    db.commit()
    db.refresh(section)
    return section