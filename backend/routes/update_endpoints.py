from fastapi import APIRouter, HTTPException, Depends, Body, Query
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List, Dict
from datetime import date, datetime, timedelta
import json, os
from database.connection import get_db
from database.models import (
    Staff, 
    Patient, 
    CertificationPeriod, 
    Exercise, 
    NoteSection, NoteTemplate, NoteTemplateSection,
    Visit, VisitNote,
    CommunicationRecord, Signature)
from schemas import (
    VisitCreate, VisitResponse, VisitUpdate,
    CertificationPeriodUpdate, CertificationPeriodResponse,
    ExerciseResponse, PatientUpdate,
    NoteSectionResponse, NoteSectionUpdate,
    NoteTemplateUpdate, NoteTemplateResponse,
    VisitNoteResponse, VisitNoteUpdate,
    CommunicationRecordUpdate, CommunicationRecordResponse,
    SignatureUpdate, SignatureResponse)
from auth.security import hash_password
from auth.auth_middleware import role_required, get_current_user
from .create_endpoints import determine_note_status

router = APIRouter()

#====================== STAFF ======================#

@router.put("/staff/{staff_id}")
def update_staff_info(
    staff_id: int,
    name: Optional[str] = None,
    birthday: Optional[str] = None, 
    gender: Optional[str] = None,
    postal_code: Optional[str] = None,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    alt_phone: Optional[str] = None,
    username: Optional[str] = None,
    password: Optional[str] = None,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found.")

    if email:
        existing_email = db.query(Staff).filter(Staff.email == email, Staff.id != staff_id).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered.")

    if username:
        existing_username = db.query(Staff).filter(Staff.username == username, Staff.id != staff_id).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already registered.")

    update_data = {
        "name": name,
        "birthday": birthday,
        "gender": gender,
        "postal_code": postal_code,
        "email": email,
        "phone": phone,
        "alt_phone": alt_phone,
        "username": username,
        "role": role,
        "is_active": is_active
    }

    for key, value in update_data.items():
        if value is not None:
            setattr(staff, key, value)

    if password is not None:
        if password.strip() == "":
            raise HTTPException(status_code=400, detail="Password cannot be empty.")
        from auth.security import hash_password
        staff.password = hash_password(password)

    db.commit()
    db.refresh(staff)

    return {"message": "Staff updated successfully.", "staff_id": staff.id}

#====================== PATIENTS ======================#

@router.put("/patients/{patient_id}")
def update_patient_info(
    patient_id: int,
    full_name: Optional[str] = None,
    birthday: Optional[str] = None,
    gender: Optional[str] = None,
    address: Optional[str] = None,
    contact_info: Optional[str] = None,
    insurance: Optional[str] = None,
    physician: Optional[str] = None,
    nurse: Optional[str] = None,
    agency_id: Optional[int] = None,
    nursing_diagnosis: Optional[str] = None,
    urgency_level: Optional[str] = None,
    prior_level_of_function: Optional[str] = None,
    homebound_status: Optional[str] = None,
    weight_bearing_status: Optional[str] = None,
    referral_reason: Optional[str] = None,
    weight: Optional[str] = None,
    height: Optional[str] = None,
    past_medical_history: Optional[str] = None,
    clinical_grouping: Optional[str] = None,
    required_disciplines: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    if agency_id is not None:
        agency = db.query(Staff).filter(Staff.id == agency_id).first()
        if not agency:
            raise HTTPException(status_code=404, detail="Agency does not exist.")
        if agency.role.lower() != "agency":
            raise HTTPException(status_code=400, detail="Provided ID does not belong to a valid agency.")

    processed_contact_info = None
    if contact_info is not None:
        try:
            import json
            processed_contact_info = json.loads(contact_info)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid contact_info JSON format.")

    update_data = {
        "full_name": full_name,
        "birthday": birthday,
        "gender": gender,
        "address": address,
        "contact_info": processed_contact_info,
        "insurance": insurance,
        "physician": physician,
        "nurse": nurse,
        "agency_id": agency_id,
        "nursing_diagnosis": nursing_diagnosis,
        "urgency_level": urgency_level,
        "prior_level_of_function": prior_level_of_function,
        "homebound_status": homebound_status,
        "weight_bearing_status": weight_bearing_status,
        "referral_reason": referral_reason,
        "weight": weight,
        "height": height,
        "past_medical_history": past_medical_history,
        "clinical_grouping": clinical_grouping,
        "required_disciplines": required_disciplines,
        "is_active": is_active
    }

    for key, value in update_data.items():
        if value is not None:
            setattr(patient, key, value)

    # Si se está actualizando is_active, manejar certification periods
    if is_active is not None:
        from datetime import datetime
        today = datetime.utcnow().date()
        cert_periods = db.query(CertificationPeriod).filter(CertificationPeriod.patient_id == patient_id).all()
        
        if is_active:
            # Activando paciente: activar períodos de certificación válidos para hoy
            for cert in cert_periods:
                if cert.start_date <= today <= cert.end_date:
                    cert.is_active = True
                else:
                    cert.is_active = False
        else:
            # Desactivando paciente: desactivar todos los períodos de certificación activos
            for cert in cert_periods:
                if cert.is_active:
                    cert.is_active = False

    db.commit()
    db.refresh(patient)

    return {"message": "Patient updated successfully.", "patient_id": patient.id}


#====================== VISITS ======================#

@router.put("/visits/{id}", response_model=VisitResponse)
def update_visit(
    id: int,
    patient_id: Optional[int] = Query(None),
    staff_id: Optional[int] = Query(None),
    certification_period_id: Optional[int] = Query(None),
    visit_date: Optional[date] = Query(None),
    visit_type: Optional[str] = Query(None),
    therapy_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    scheduled_time: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    visit = db.query(Visit).filter(Visit.id == id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    original_visit_type = visit.visit_type

    update_fields = {
        "patient_id": patient_id,
        "staff_id": staff_id,
        "certification_period_id": certification_period_id,
        "visit_date": visit_date,
        "visit_type": visit_type,
        "therapy_type": therapy_type,
        "status": status,
        "scheduled_time": scheduled_time,
    }

    for field, value in update_fields.items():
        if value is not None:
            setattr(visit, field, value)

    db.commit()
    db.refresh(visit)

    if visit_type and visit_type != original_visit_type:
        existing_note = visit.note

        if existing_note:
            is_note_empty = (
                not existing_note.therapist_signature and
                not existing_note.patient_signature and
                not existing_note.visit_date_signature and
                not any(
                    s.get("content") for s in (existing_note.sections_data or [])
                    if isinstance(s, dict)
                )
            )

            if is_note_empty:
                existing_note.note_type = visit_type
                db.commit()
                db.refresh(existing_note)
            else:
                matching_template = db.query(NoteTemplate).filter_by(
                    discipline=visit.staff.rol,
                    note_type=visit_type,
                    is_active=True
                ).first()

                if not matching_template:
                    raise HTTPException(status_code=404, detail="No matching template found")

                template_sections = db.query(NoteTemplateSection)\
                    .filter(NoteTemplateSection.template_id == matching_template.id)\
                    .order_by(NoteTemplateSection.position.asc()).all()

                sections_data = [{"section_id": s.section_id, "content": {}} for s in template_sections]

                new_note = VisitNote(
                    visit_id=visit.id,
                    discipline=visit.staff.rol,
                    note_type=visit_type,
                    sections_data=sections_data
                )
                db.add(new_note)
                db.commit()
                db.refresh(new_note)

    db.refresh(visit)
    return visit

@router.put("/visits/{visit_id}/restore", response_model=VisitResponse)
def restore_hidden_visit(visit_id: int, db: Session = Depends(get_db)):
    visit = db.query(Visit).filter(Visit.id == visit_id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found.")
    if not visit.is_hidden:
        raise HTTPException(status_code=400, detail="Visit is already visible.")

    visit.is_hidden = False
    db.commit()
    db.refresh(visit)
    return visit

#====================== NOTES ======================#

@router.put("/note-sections/{section_id}", response_model=NoteSectionResponse)
def update_section(section_id: int, data: NoteSectionUpdate, db: Session = Depends(get_db)):
    section = db.query(NoteSection).filter(NoteSection.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(section, field, value)

    db.commit()
    db.refresh(section)
    return section

@router.put("/note-templates/{template_id}", response_model=NoteTemplateResponse)
def update_template(
    template_id: int,
    discipline: Optional[str] = Query(None),
    note_type: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    replace_section_ids: Optional[List[int]] = Query(None),
    add_section_ids: Optional[List[int]] = Query(None),
    remove_section_ids: Optional[List[int]] = Query(None),
    db: Session = Depends(get_db)
):
    template = db.query(NoteTemplate).filter_by(id=template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found.")

    if discipline is not None:
        template.discipline = discipline
    if note_type is not None:
        template.note_type = note_type
    if is_active is not None:
        template.is_active = is_active

    if replace_section_ids is not None:
        db.query(NoteTemplateSection).filter_by(template_id=template.id).delete()
        for i, sid in enumerate(replace_section_ids):
            db.add(NoteTemplateSection(template_id=template.id, section_id=sid, position=i))

    if add_section_ids is not None:
        existing_ids = {s.section_id for s in template.sections}
        current_max = len(template.sections)
        for i, sid in enumerate(add_section_ids):
            if sid not in existing_ids:
                db.add(NoteTemplateSection(template_id=template.id, section_id=sid, position=current_max + i))

    if remove_section_ids is not None:
        db.query(NoteTemplateSection).filter(
            NoteTemplateSection.template_id == template.id,
            NoteTemplateSection.section_id.in_(remove_section_ids)
        ).delete(synchronize_session=False)

    db.commit()
    db.refresh(template)
    return template

@router.put("/visit-notes/{note_id}", response_model=VisitNoteResponse)
def update_visit_note(note_id: int, data: VisitNoteUpdate, db: Session = Depends(get_db)):
    
    note = db.query(VisitNote).filter(VisitNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Visit note not found")

    if data.status is not None:
        note.status = data.status
        if data.status.lower() == "completed":
            visit = db.query(Visit).filter(Visit.id == note.visit_id).first()
            if visit:
                visit.status = "Completed"

    if data.sections_data is not None:
        note.sections_data = data.sections_data
        
        visit = db.query(Visit).filter(Visit.id == note.visit_id).first()
        if visit:
            staff = db.query(Staff).filter(Staff.id == visit.staff_id).first()
            if staff:
                note.therapist_name = staff.name
            
            template = db.query(NoteTemplate).filter_by(
                discipline=visit.therapy_type.upper(),
                note_type=visit.visit_type,
                is_active=True
            ).first()
            
            if template:
                auto_status = determine_note_status(data.sections_data, template, db)
                note.status = auto_status
                visit.status = auto_status

    db.commit()
    db.refresh(note)
    
    
    return note

#====================== CERTIFICATION PERIODS ======================#

@router.put("/cert-periods/{cert_id}", response_model=CertificationPeriodResponse)
def update_certification_period(cert_id: int, cert_update: CertificationPeriodUpdate, db: Session = Depends(get_db)):
    cert = (
        db.query(CertificationPeriod)
        .options(joinedload(CertificationPeriod.patient))
        .filter(CertificationPeriod.id == cert_id)
        .first()
    )

    if not cert:
        raise HTTPException(status_code=404, detail="Certification period not found.")

    if not cert.patient:
        cert.patient = db.query(Patient).filter(Patient.id == cert.patient_id).first()

    update_data = cert_update.dict(exclude_unset=True)

    if "start_date" in update_data:
        cert.start_date = update_data["start_date"]

    if "end_date" in update_data:
        cert.end_date = update_data["end_date"]
    elif "start_date" in update_data:
        cert.end_date = cert.start_date + timedelta(days=60)

    # Update frequencies if provided
    if "pt_frequency" in update_data:
        cert.pt_frequency = update_data["pt_frequency"]
    
    if "ot_frequency" in update_data:
        cert.ot_frequency = update_data["ot_frequency"]
    
    if "st_frequency" in update_data:
        cert.st_frequency = update_data["st_frequency"]
    
    # Update approved visits if provided
    if "pt_approved_visits" in update_data:
        cert.pt_approved_visits = update_data["pt_approved_visits"]
    
    if "ot_approved_visits" in update_data:
        cert.ot_approved_visits = update_data["ot_approved_visits"]
    
    if "st_approved_visits" in update_data:
        cert.st_approved_visits = update_data["st_approved_visits"]

    today = date.today()
    patient_active = cert.patient.is_active if cert.patient else False
    cert.is_active = patient_active and (cert.start_date <= today <= cert.end_date)

    db.commit()
    db.refresh(cert)
    return cert

#====================== EXERCISES ======================#

@router.put("/exercises/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(
    exercise_id: int,
    name: Optional[str] = None,
    description: Optional[str] = None,
    image_url: Optional[str] = None,
    default_sets: Optional[int] = None,
    default_reps: Optional[int] = None,
    default_sessions_per_day: Optional[int] = None,
    hep_required: Optional[bool] = None,
    discipline: Optional[str] = None,
    focus_area: Optional[str] = None,
    db: Session = Depends(get_db)
):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found.")

    if name is not None: exercise.name = name
    if description is not None: exercise.description = description
    if image_url is not None: exercise.image_url = image_url
    if default_sets is not None: exercise.default_sets = default_sets
    if default_reps is not None: exercise.default_reps = default_reps
    if default_sessions_per_day is not None: exercise.default_sessions_per_day = default_sessions_per_day
    if hep_required is not None: exercise.hep_required = hep_required
    if discipline is not None: exercise.discipline = discipline
    if focus_area is not None: exercise.focus_area = focus_area

    db.commit()
    db.refresh(exercise)
    return exercise

@router.put("/communication-records/{record_id}", response_model=CommunicationRecordResponse)
def update_communication_record(record_id: int, data: CommunicationRecordUpdate, db: Session = Depends(get_db)):
    record = db.query(CommunicationRecord).filter(CommunicationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Communication record not found")
    
    if data.title is not None:
        record.title = data.title
    if data.content is not None:
        record.content = data.content
    
    db.commit()
    db.refresh(record)
    
    staff = db.query(Staff).filter(Staff.id == record.created_by).first()
    response_data = record.__dict__.copy()
    response_data["staff_name"] = staff.name if staff else None
    
    return response_data

#====================== SIGNATURES ======================#

@router.put("/signatures/{signature_id}", response_model=SignatureResponse)
def update_signature(
    signature_id: int,
    signature_update: SignatureUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update signature (metadata and SVG preview only)"""
    
    signature = db.query(Signature).filter(Signature.id == signature_id).first()
    if not signature:
        raise HTTPException(status_code=404, detail="Signature not found")
    
    try:
        # Update fields
        if signature_update.entity_name is not None:
            signature.entity_name = signature_update.entity_name
        
        if signature_update.signature_metadata is not None:
            signature.signature_metadata = signature_update.signature_metadata
            
            # Regenerate SVG from new strokes data
            from .create_endpoints import generate_svg_from_strokes
            new_svg = generate_svg_from_strokes(signature_update.signature_metadata)
            signature.svg_preview = new_svg
            
            # Update JSON file
            json_path = f"{signature.file_path}.json"
            if os.path.exists(json_path):
                with open(json_path, 'w', encoding='utf-8') as f:
                    json.dump(signature_update.signature_metadata, f, indent=2, ensure_ascii=False)
            
            # Update SVG file
            svg_path = f"{signature.file_path}.svg"
            if new_svg:
                with open(svg_path, 'w', encoding='utf-8') as f:
                    f.write(new_svg)
        
        if signature_update.svg_preview is not None:
            signature.svg_preview = signature_update.svg_preview
            
            # Update SVG file
            svg_path = f"{signature.file_path}.svg"
            with open(svg_path, 'w', encoding='utf-8') as f:
                f.write(signature_update.svg_preview)
        
        signature.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(signature)
        
        return signature
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating signature: {str(e)}")