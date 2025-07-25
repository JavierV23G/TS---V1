from fastapi import APIRouter, HTTPException, Depends, Query
import os, json
from datetime import date
from fastapi.responses import FileResponse
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

#====================== STAFF ======================#

@router.get("/staff/", response_model=List[StaffResponse])
def get_active_staff(db: Session = Depends(get_db)):
    staff_list = db.query(Staff).filter(Staff.is_active == True).all()
    return [StaffResponse.model_validate(staff) for staff in staff_list]

@router.get("/patient/{patient_id}/assigned-staff", response_model=List[StaffAssignmentResponse])
def get_assigned_staff(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    assignments = db.query(StaffAssignment).options(joinedload(StaffAssignment.staff)).filter(StaffAssignment.patient_id == patient_id).all()
    
    return [
        StaffAssignmentResponse(
            id=assignment.id,
            assigned_at=assignment.assigned_at,
            assigned_role=assignment.assigned_role,
            staff=StaffResponse.model_validate(assignment.staff)
        )
        for assignment in assignments
    ]

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
    
    # Process each visit to include note information
    visit_responses = []
    for visit in visits:
        # Check if visit has a note
        note = db.query(VisitNote).filter(VisitNote.visit_id == visit.id).first()
        
        # Determine status based on note existence
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

    # Get template sections with their full section details
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
        headers={"Content-Disposition": f'inline; filename="{doc.file_name}"'}
    )

#====================== CERTIFICATION PERIODS ======================#

@router.get("/patient/{patient_id}/cert-periods", response_model=List[CertificationPeriodResponse])
def get_cert_periods_by_patient(patient_id: int, db: Session = Depends(get_db)):
    return db.query(CertificationPeriod).filter(
        CertificationPeriod.patient_id == patient_id
    ).order_by(CertificationPeriod.start_date.desc()).all()