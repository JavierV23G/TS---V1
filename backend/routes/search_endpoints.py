from fastapi import APIRouter, HTTPException, Depends, Query
import os, json, re
from datetime import date
from fastapi.responses import FileResponse, HTMLResponse
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from database.connection import get_db
from database.models import (
    Staff, StaffAssignment,
    Patient, 
    Exercise, PatientExerciseAssignment, 
    Visit, VisitNote,
    CertificationPeriod,
    Document,
    NoteSection, NoteTemplate, NoteTemplateSection)
from schemas import (
    StaffResponse, StaffAssignmentResponse,
    PatientResponse,
    ExerciseResponse, PatientExerciseAssignmentResponse,
    VisitResponse,
    VisitNoteResponse,
    NoteSectionResponse,
    CertificationPeriodResponse,
    DocumentResponse,
    NoteTemplateWithSectionsResponse)

router = APIRouter()

#====================== UTILITY FUNCTIONS ======================#

def format_phone_number(phone_str):
    if not phone_str:
        return ''
    
    cleaned = re.sub(r'\D', '', str(phone_str))
    
    if len(cleaned) < 10:
        return phone_str 
    
    match = re.match(r'^(\d{3})(\d{3})(\d{4})$', cleaned)
    if match:
        return f"({match.group(1)}) {match.group(2)}-{match.group(3)}"
    
    return phone_str

def get_primary_phone_number(contact_info):
    if not contact_info:
        return ''
    
    phone_number = ''
    
    if isinstance(contact_info, dict):
        phone_number = contact_info.get('primary#') or contact_info.get('primary') or contact_info.get('secondary')
        
        if not phone_number:
            other_contacts = {k: v for k, v in contact_info.items() 
                            if k not in ['primary#', 'primary', 'secondary']}
            if other_contacts:
                first_contact = next(iter(other_contacts.values()))
                if isinstance(first_contact, str) and '|' in first_contact:
                    phone_number = first_contact.split('|')[0]
                elif isinstance(first_contact, dict):
                    phone_number = first_contact.get('phone', '')
                else:
                    phone_number = str(first_contact)
    
    elif isinstance(contact_info, str):
        try:
            parsed = json.loads(contact_info)
            if isinstance(parsed, list) and parsed:
                phone_number = parsed[0].get('phone', '') if isinstance(parsed[0], dict) else str(parsed[0])
            else:
                phone_number = contact_info
        except json.JSONDecodeError:
            phone_number = contact_info
    
    # Return formatted number
    return format_phone_number(phone_number) if phone_number else ''

#====================== STAFF ======================#

@router.get("/staff/", response_model=List[StaffResponse])
def get_active_staff(db: Session = Depends(get_db)):
    staff_list = db.query(Staff).filter(Staff.is_active == True).all()
    return [StaffResponse.model_validate(staff) for staff in staff_list]

@router.get("/patient/{patient_id}/assigned-staff")
def get_assigned_staff(patient_id: int, cert_period_id: Optional[int] = Query(None), db: Session = Depends(get_db)):
    """Get assigned staff with frequencies from selected cert period"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if not cert_period_id:
        cert_period = db.query(CertificationPeriod).filter(
            CertificationPeriod.patient_id == patient_id,
            CertificationPeriod.is_active == True
        ).first()
        if not cert_period:
            raise HTTPException(status_code=404, detail="No active certification period found")
        cert_period_id = cert_period.id
    else:
        cert_period = db.query(CertificationPeriod).filter(
            CertificationPeriod.id == cert_period_id
        ).first()
        if not cert_period:
            raise HTTPException(status_code=404, detail="Certification period not found")
    
    assignments = db.query(StaffAssignment).options(joinedload(StaffAssignment.staff)).filter(
        StaffAssignment.patient_id == patient_id
    ).all()
    
    all_staff = db.query(Staff).filter(Staff.is_active == True).all()
    
    disciplines = {
        'PT': {
            'available_staff': [
                {'id': s.id, 'name': s.name, 'role': s.role}
                for s in all_staff if s.role.upper() in ['PT', 'PTA']
            ],
            'assigned_pt': None,   
            'assigned_pta': None,  
            'frequency': cert_period.pt_frequency,
            'is_active': False
        },
        'OT': {
            'available_staff': [
                {'id': s.id, 'name': s.name, 'role': s.role}
                for s in all_staff if s.role.upper() in ['OT', 'COTA']
            ],
            'assigned_ot': None,  
            'assigned_cota': None,
            'frequency': cert_period.ot_frequency,
            'is_active': False
        },
        'ST': {
            'available_staff': [
                {'id': s.id, 'name': s.name, 'role': s.role}
                for s in all_staff if s.role.upper() in ['ST', 'STA']
            ],
            'assigned_st': None,  
            'assigned_sta': None, 
            'frequency': cert_period.st_frequency,
            'is_active': False
        }
    }
    
    for assignment in assignments:
        role = assignment.assigned_role.upper()
        staff_data = {
            'id': assignment.staff.id,  
            'name': assignment.staff.name,
            'role': assignment.staff.role
        }
        
        if role == 'PT':
            disciplines['PT']['assigned_pt'] = staff_data
            disciplines['PT']['is_active'] = True
        elif role == 'PTA':
            disciplines['PT']['assigned_pta'] = staff_data
            disciplines['PT']['is_active'] = True
        elif role == 'OT':
            disciplines['OT']['assigned_ot'] = staff_data
            disciplines['OT']['is_active'] = True
        elif role == 'COTA':
            disciplines['OT']['assigned_cota'] = staff_data
            disciplines['OT']['is_active'] = True
        elif role == 'ST':
            disciplines['ST']['assigned_st'] = staff_data
            disciplines['ST']['is_active'] = True
        elif role == 'STA':
            disciplines['ST']['assigned_sta'] = staff_data
            disciplines['ST']['is_active'] = True
    
    return {
        'patient_id': patient_id,
        'cert_period_id': cert_period_id,
        'disciplines': disciplines
    }

#====================== PATIENTS ======================#

@router.get("/patients/", response_model=List[PatientResponse])
def get_all_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    
    response_patients = []
    today = date.today()

    for patient in patients:
        agency_name = None
        if patient.agency_id:
            agency = db.query(Staff).filter(Staff.id == patient.agency_id).first()
            if agency:
                agency_name = agency.name
        
        current_cert = (
            db.query(CertificationPeriod)
            .filter(
                CertificationPeriod.patient_id == patient.id,
                CertificationPeriod.start_date <= today,
                CertificationPeriod.end_date >= today
            )
            .order_by(CertificationPeriod.start_date.desc())
            .first()
        )

        patient_data = patient.__dict__.copy()
        patient_data['agency_name'] = agency_name
        patient_data['primary_phone'] = get_primary_phone_number(patient.contact_info)
        patient_data['cert_start_date'] = current_cert.start_date if current_cert else None
        patient_data['cert_end_date'] = current_cert.end_date if current_cert else None
        
        response_patients.append(PatientResponse(**patient_data))

    return response_patients

@router.get("/patients/{patient_id}", response_model=PatientResponse)
def get_patient_by_id(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    today = date.today()

    current_cert = (
        db.query(CertificationPeriod)
        .filter(
            CertificationPeriod.patient_id == patient_id,
            CertificationPeriod.start_date <= today,
            CertificationPeriod.end_date >= today
        )
        .order_by(CertificationPeriod.start_date.desc())
        .first()
    )

    agency_name = None
    if patient.agency_id:
        agency = db.query(Staff).filter(Staff.id == patient.agency_id).first()
        if agency:
            agency_name = agency.name

    response_data = {
        "id": patient.id,
        "full_name": patient.full_name,
        "birthday": patient.birthday,
        "gender": patient.gender,
        "address": patient.address,
        "contact_info": patient.contact_info,
        "primary_phone": get_primary_phone_number(patient.contact_info),
        "insurance": patient.insurance,
        "physician": patient.physician,
        "agency_name": agency_name,
        "nursing_diagnosis": patient.nursing_diagnosis,
        "urgency_level": patient.urgency_level,
        "prior_level_of_function": patient.prior_level_of_function,
        "homebound_status": patient.homebound_status,
        "weight_bearing_status": patient.weight_bearing_status,
        "referral_reason": patient.referral_reason,
        "weight": patient.weight,
        "height": patient.height,
        "past_medical_history": patient.past_medical_history,
        "clinical_grouping": patient.clinical_grouping,
        "required_disciplines": patient.required_disciplines,
        "is_active": patient.is_active,
        "cert_start_date": current_cert.start_date if current_cert else None,
        "cert_end_date": current_cert.end_date if current_cert else None,
    }

    return PatientResponse(**response_data)

@router.get("/staff/{staff_id}/assigned-patients", response_model=List[PatientResponse])
def get_assigned_patients(staff_id: int, db: Session = Depends(get_db)):
    assignments = db.query(StaffAssignment).filter(StaffAssignment.staff_id == staff_id).all()
    patients = [a.patient for a in assignments if a.patient.is_active]
    return patients

#====================== EXERCISES ======================#

@router.get("/exercises/", response_model=List[ExerciseResponse])
def get_exercises(discipline: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Exercise)
    if discipline:
        query = query.filter(Exercise.discipline == discipline)
    return query.all()

@router.get("/patients/{patient_id}/exercises/", response_model=List[PatientExerciseAssignmentResponse])
def get_exercises_of_patient(patient_id: int, db: Session = Depends(get_db)):
    return db.query(PatientExerciseAssignment).filter(PatientExerciseAssignment.patient_id == patient_id).all()

#====================== VISITS ======================#

@router.get("/visits/certperiod/{cert_id}", response_model=List[VisitResponse])
def get_visits_by_certification_period(cert_id: int, db: Session = Depends(get_db)):
    visits = db.query(Visit).filter(
        Visit.certification_period_id == cert_id,
        Visit.is_hidden == False
    ).all()
    
    visit_responses = []
    for visit in visits:
        note = db.query(VisitNote).filter(VisitNote.visit_id == visit.id).first()
        
        final_status = visit.status
        if note and visit.status == "Scheduled":
            # If visit has a note and is still "Scheduled", update to "Completed"
            final_status = "Completed"
        elif note and note.status == "Completed":
            # If note exists and is completed, ensure visit is marked as completed
            final_status = "Completed"
        
        # Create response with note information
        visit_response = VisitResponse(
            id=visit.id,
            patient_id=visit.patient_id,
            staff_id=visit.staff_id,
            certification_period_id=visit.certification_period_id,
            visit_date=visit.visit_date,
            visit_type=visit.visit_type,
            therapy_type=visit.therapy_type,
            status=final_status,
            scheduled_time=visit.scheduled_time,
            note_id=note.id if note else None
        )
        
        visit_responses.append(visit_response)
    
    return visit_responses

@router.get("/visits/certperiod/{cert_id}/deleted", response_model=List[VisitResponse])
def get_deleted_visits(cert_id: int, db: Session = Depends(get_db)):
    return db.query(Visit).filter(
        Visit.certification_period_id == cert_id,
        Visit.is_hidden == True
    ).all()

@router.get("/visits/{visit_id}/complete-data")
def get_visit_complete_data(visit_id: int, db: Session = Depends(get_db)):
    
    visit = db.query(Visit).options(
        joinedload(Visit.patient),
        joinedload(Visit.staff),
        joinedload(Visit.certification_period)
    ).filter(Visit.id == visit_id).first()
    
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    
    note = db.query(VisitNote).filter(VisitNote.visit_id == visit_id).first()
    note_id = note.id if note else None
    
    visit_response = VisitResponse(
        id=visit.id,
        patient_id=visit.patient_id,
        staff_id=visit.staff_id,
        certification_period_id=visit.certification_period_id,
        visit_date=visit.visit_date,
        visit_type=visit.visit_type,
        therapy_type=visit.therapy_type,  
        status=visit.status,
        scheduled_time=visit.scheduled_time,
        note_id=note_id
    )
    
    patient = visit.patient
    agency_name = None
    if patient.agency_id:
        agency = db.query(Staff).filter(Staff.id == patient.agency_id).first()
        if agency:
            agency_name = agency.name
    
    today = date.today()
    current_cert = db.query(CertificationPeriod).filter(
        CertificationPeriod.patient_id == patient.id,
        CertificationPeriod.start_date <= today,
        CertificationPeriod.end_date >= today
    ).order_by(CertificationPeriod.start_date.desc()).first()
    
    patient_response = PatientResponse(
        id=patient.id,
        full_name=patient.full_name,
        birthday=patient.birthday,
        gender=patient.gender,
        address=patient.address,
        contact_info=patient.contact_info,
        primary_phone=get_primary_phone_number(patient.contact_info),
        insurance=patient.insurance,
        physician=patient.physician,
        agency_name=agency_name,
        nursing_diagnosis=patient.nursing_diagnosis,
        urgency_level=patient.urgency_level,
        prior_level_of_function=patient.prior_level_of_function,
        homebound_status=patient.homebound_status,
        weight_bearing_status=patient.weight_bearing_status,
        referral_reason=patient.referral_reason,
        weight=patient.weight,
        height=patient.height,
        past_medical_history=patient.past_medical_history,
        clinical_grouping=patient.clinical_grouping,
        required_disciplines=patient.required_disciplines,
        is_active=patient.is_active,
        cert_start_date=current_cert.start_date if current_cert else None,
        cert_end_date=current_cert.end_date if current_cert else None
    )
    
    assigned_therapist = None
    if visit.staff:
        assigned_therapist = StaffResponse(
            id=visit.staff.id,
            name=visit.staff.name,
            birthday=visit.staff.birthday,
            gender=visit.staff.gender,
            postal_code=visit.staff.postal_code,
            email=visit.staff.email,
            phone=visit.staff.phone,
            alt_phone=visit.staff.alt_phone,
            username=visit.staff.username,
            role=visit.staff.role,
            is_active=visit.staff.is_active
        )
    
    therapy_roles = ['PT', 'OT', 'ST', 'PTA', 'COTA', 'STA']
    available_therapists_query = db.query(Staff).filter(
        Staff.role.in_(therapy_roles),
        Staff.is_active == True
    ).all()
    
    available_therapists = [
        StaffResponse(
            id=therapist.id,
            name=therapist.name,
            birthday=therapist.birthday,
            gender=therapist.gender,
            postal_code=therapist.postal_code,
            email=therapist.email,
            phone=therapist.phone,
            alt_phone=therapist.alt_phone,
            username=therapist.username,
            role=therapist.role,
            is_active=therapist.is_active
        ) for therapist in available_therapists_query
    ]
    
    return {
        "visit": visit_response,
        "patient": patient_response,
        "assigned_therapist": assigned_therapist,
        "available_therapists": available_therapists
    }

#====================== VISIT NOTES ======================#

@router.get("/visit-notes/{visit_id}", response_model=VisitNoteResponse)
def get_visit_note(visit_id: int, db: Session = Depends(get_db)):
    note = db.query(VisitNote).filter(VisitNote.visit_id == visit_id).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    return VisitNoteResponse(
        id=note.id,
        visit_id=note.visit_id,
        status=note.status,
        sections_data=note.sections_data or {},
        therapist_name=note.therapist_name,
    )

@router.get("/templates/{discipline}/{visit_type}", response_model=NoteTemplateWithSectionsResponse)
def get_specific_template(discipline: str, visit_type: str, db: Session = Depends(get_db)):
    template = db.query(NoteTemplate).filter(
        NoteTemplate.discipline == discipline,
        NoteTemplate.note_type == visit_type
    ).first()

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    template_sections = (
        db.query(NoteTemplateSection, NoteSection)
        .join(NoteSection, NoteTemplateSection.section_id == NoteSection.id)
        .filter(NoteTemplateSection.template_id == template.id)
        .all()
    )

    sections_with_details = []
    for template_section, section in template_sections:
        section_data = {
            "id": section.id,
            "section_name": section.section_name,
            "description": section.description,
            "is_required": section.is_required,
            "has_static_image": section.has_static_image,
            "static_image_url": section.static_image_url,
            "form_schema": section.form_schema
        }
        sections_with_details.append(section_data)

    return NoteTemplateWithSectionsResponse(
        id=template.id,
        discipline=template.discipline,
        note_type=template.note_type,
        is_active=template.is_active,
        sections=sections_with_details
    )

@router.get("/note-sections", response_model=List[NoteSectionResponse])
def get_all_sections(db: Session = Depends(get_db)):
    return db.query(NoteSection).all()

#====================== DOCUMENTS ======================#

@router.get("/documents/", response_model=List[DocumentResponse])
def get_documents_by_entity(
    patient_id: Optional[int] = Query(None),
    staff_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    if patient_id and staff_id:
        raise HTTPException(status_code=400, detail="Provide only patient_id or staff_id, not both.")
    if not patient_id and not staff_id:
        raise HTTPException(status_code=400, detail="You must specify either patient_id or staff_id.")

    if patient_id:
        return db.query(Document).filter(Document.patient_id == patient_id).all()

    return db.query(Document).filter(Document.staff_id == staff_id).all()

@router.get("/documents/{doc_id}/preview")
def preview_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if not os.path.isfile(doc.file_path):
        raise HTTPException(status_code=404, detail="Physical file not found")

    return FileResponse(
        path=doc.file_path,
        media_type="application/pdf",
        filename=doc.file_name,
        headers={
            "Content-Disposition": f'inline; filename="{doc.file_name}"',
            "X-Frame-Options": "SAMEORIGIN"
        }
    )

#====================== CERTIFICATION PERIODS ======================#

@router.get("/patient/{patient_id}/cert-periods", response_model=List[CertificationPeriodResponse])
def get_cert_periods_by_patient(patient_id: int, db: Session = Depends(get_db)):
    return db.query(CertificationPeriod).filter(
        CertificationPeriod.patient_id == patient_id
    ).order_by(CertificationPeriod.start_date.desc()).all()