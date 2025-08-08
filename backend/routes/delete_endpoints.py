from fastapi import APIRouter, HTTPException, Depends
import os
from sqlalchemy.orm import Session
from database.connection import get_db
from database.models import ( 
    Staff, 
    Patient, 
    Exercise, 
    CertificationPeriod,
    PatientExerciseAssignment,
    Document,
    NoteSection,
    NoteTemplateSection,
    Visit,
    VisitNote,
    CommunicationRecord)

router = APIRouter()

#///////////////////////// STAFF //////////////////////////#

@router.delete("/staff/{staff_id}", status_code=204)
def delete_staff(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found.")
    db.delete(staff)
    db.commit()
    return

@router.delete("/unassign-staff")
def unassign_staff_from_patient(patient_id: int, discipline: str, db: Session = Depends(get_db)):
    from database.models import StaffAssignment
    
    # If discipline is a specific role (PT, PTA, etc), unassign only that role
    # If discipline is a general discipline, unassign all roles in that discipline (legacy support)
    specific_roles = ['PT', 'PTA', 'OT', 'COTA', 'ST', 'STA']
    
    if discipline.upper() in specific_roles:
        # Unassign only the specific role
        roles_to_remove = [discipline.upper()]
    else:
        # Legacy: Map discipline to all roles in that discipline  
        discipline_roles = {
            'PT': ['PT', 'PTA'],
            'OT': ['OT', 'COTA'], 
            'ST': ['ST', 'STA']
        }
        roles_to_remove = discipline_roles.get(discipline.upper(), [discipline.upper()])
    
    assignments = db.query(StaffAssignment).filter(
        StaffAssignment.patient_id == patient_id,
        StaffAssignment.assigned_role.in_(roles_to_remove)
    ).all()
    
    if not assignments:
        raise HTTPException(status_code=404, detail=f"No staff assignments found for role(s): {', '.join(roles_to_remove)}")
    
    for assignment in assignments:
        db.delete(assignment)
    
    db.commit()
    return {"message": f"Staff unassigned from {', '.join(roles_to_remove)} role(s)"}

#///////////////////////// VISITS //////////////////////////#

@router.delete("/visits/{id}")
def delete_visit(id: int, db: Session = Depends(get_db)):
    visit = db.query(Visit).filter(Visit.id == id).first()
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    note = visit.note
    if note:
        has_content = bool(note.sections_data and len(note.sections_data) > 0)
        
        if has_content:
            visit.is_hidden = True
            db.commit()
            return {"msg": "Visit has note content and was hidden instead of deleted."}
        else:
            db.delete(note)

    db.delete(visit)
    db.commit()
    return {"msg": "Visit deleted successfully."}

#////////////////////////// NOTAS //////////////////////////#

@router.delete("/visit-notes/{note_id}")
def delete_visit_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(VisitNote).filter(VisitNote.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    visit = note.visit
    has_content = bool(note.sections_data and len(note.sections_data) > 0)

    if not has_content:
        db.delete(note)
        if visit:
            db.delete(visit)
        db.commit()
        return {"detail": "Visit note and visit deleted (empty note)"}
    else:
        if visit:
            visit.is_hidden = True
            db.commit()
        return {"detail": "Visit contains information. Visit was hidden instead of deleted."}

@router.delete("/note-sections/{section_id}")
def delete_section(section_id: int, db: Session = Depends(get_db)):
    section = db.query(NoteSection).filter(NoteSection.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    template_sections = db.query(NoteTemplateSection).filter(
        NoteTemplateSection.section_id == section_id
    ).all()
    
    if template_sections:
        for template_section in template_sections:
            db.delete(template_section)
        
        db.commit()
    
    db.delete(section)
    db.commit()
    return {"detail": "Section deleted"}

#///////////////////////// PATIENTS //////////////////////////#

#///////////////////////// CERT PERIODS //////////////////////////#

@router.delete("/cert-periods/{cert_id}")
def delete_certification_period(cert_id: int, db: Session = Depends(get_db)):
    cert = db.query(CertificationPeriod).filter(CertificationPeriod.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification period not found.")

    if cert.visits:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete certification period with existing visits."
        )

    db.delete(cert)
    db.commit()
    return {"detail": "Certification period deleted successfully."}

#///////////////////////// DOCUMENTOS //////////////////////////#

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")

    if doc.file_path and os.path.isfile(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete physical file: {str(e)}"
            )

    db.delete(doc)
    db.commit()
    return {"detail": "Document deleted successfully."}

#///////////////////////// EXERCISES //////////////////////////#

@router.delete("/exercises/{exercise_id}")
def deactivate_or_delete_exercise(exercise_id: int, db: Session = Depends(get_db)):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found.")

    assigned = db.query(PatientExerciseAssignment).filter(
        PatientExerciseAssignment.exercise_id == exercise_id
    ).first()

    if assigned:
        exercise.is_active = False
        db.commit()
        return {"detail": "Exercise deactivated because it is assigned to patients."}
    else:
        db.delete(exercise)
        db.commit()
        return {"detail": "Exercise permanently deleted (not assigned)."}

@router.delete("/assigned-exercises/{assignment_id}")
def delete_assigned_exercise(assignment_id: int, db: Session = Depends(get_db)):
    assignment = db.query(PatientExerciseAssignment).filter(
        PatientExerciseAssignment.id == assignment_id
    ).first()

    if not assignment:
        raise HTTPException(status_code=404, detail="Exercise assignment not found.")

    db.delete(assignment)
    db.commit()
    return {"detail": "Exercise assignment deleted successfully."}

@router.delete("/communication-records/{record_id}", status_code=204)
def delete_communication_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(CommunicationRecord).filter(CommunicationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Communication record not found")
    
    db.delete(record)
    db.commit()
    return