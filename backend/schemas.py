from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, date

#========================= STAFF =========================#

class StaffCreate(BaseModel):
    name: str
    birthday: Optional[date] = None
    gender: Optional[str] = None
    postal_code: Optional[str] = None
    email: str
    phone: Optional[str] = None
    alt_phone: Optional[str] = None
    username: str
    password: str
    role: str
    is_active: bool

class StaffResponse(BaseModel):
    id: int
    name: str
    birthday: Optional[date] = None
    gender: Optional[str] = None
    postal_code: Optional[str] = None
    email: str
    phone: Optional[str] = None
    alt_phone: Optional[str] = None
    username: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class StaffAssignmentResponse(BaseModel):
    id: int
    assigned_at: datetime
    assigned_role: str
    staff: StaffResponse

    class Config:
        from_attributes = True

#========================= PATIENTS =========================#

class PatientCreate(BaseModel):
    full_name: str
    birthday: date
    gender: str
    address: str
    contact_info: Optional[Dict[str, str]] = None  
    insurance: Optional[str] = None
    physician: Optional[str] = None
    nurse: Optional[str] = None
    agency_id: int
    nursing_diagnosis: Optional[str] = None
    urgency_level: Optional[str] = None
    prior_level_of_function: Optional[str] = None
    homebound_status: Optional[str] = None
    weight_bearing_status: Optional[str] = None
    referral_reason: Optional[str] = None
    weight: Optional[str] = None
    height: Optional[str] = None
    past_medical_history: Optional[str] = None
    clinical_grouping: Optional[str] = None
    required_disciplines: Optional[str] = None 
    is_active: Optional[bool] = True
    initial_cert_start_date: date

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    birthday: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    contact_info: Optional[Dict[str, str]] = None
    insurance: Optional[str] = None
    physician: Optional[str] = None
    nurse: Optional[str] = None
    agency_id: Optional[int] = None
    nursing_diagnosis: Optional[str] = None
    urgency_level: Optional[str] = None
    prior_level_of_function: Optional[str] = None
    homebound_status: Optional[str] = None
    weight_bearing_status: Optional[str] = None
    referral_reason: Optional[str] = None
    weight: Optional[str] = None
    height: Optional[str] = None
    past_medical_history: Optional[str] = None
    clinical_grouping: Optional[str] = None
    required_disciplines: Optional[str] = None
    is_active: Optional[bool] = None

    class Config:
        extra = "forbid"

class PatientResponse(BaseModel):
    id: int
    full_name: str
    birthday: Optional[date]
    gender: str
    address: str
    contact_info: Optional[Dict[str, str]]
    primary_phone: Optional[str] = None 
    insurance: Optional[str] = None
    physician: Optional[str]
    nurse: Optional[str] = None
    agency_name: Optional[str] = None
    nursing_diagnosis: Optional[str]
    urgency_level: Optional[str]
    prior_level_of_function: Optional[str]
    homebound_status: Optional[str]
    weight_bearing_status: Optional[str]
    referral_reason: Optional[str]
    weight: Optional[str]
    height: Optional[str]
    past_medical_history: Optional[str]
    clinical_grouping: Optional[str]
    required_disciplines: Optional[str]
    is_active: Optional[bool] = True

    cert_start_date: Optional[date] = None
    cert_end_date: Optional[date] = None

    class Config:
        from_attributes = True

#========================= DOCUMENTS =========================#

class DocumentResponse(BaseModel):
    id: int
    patient_id: Optional[int] = None
    staff_id: Optional[int] = None
    file_name: str
    file_path: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

#========================= EXERCISES =========================#

class ExerciseCreate(BaseModel):
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    default_sets: Optional[int] = None
    default_reps: Optional[int] = None
    default_sessions_per_day: Optional[int] = None
    hep_required: Optional[bool] = True
    discipline: str  
    focus_area: Optional[str] = None
    is_active: Optional[bool] = True

class ExerciseResponse(ExerciseCreate):
    id: int

    class Config:
        from_attributes = True

class PatientExerciseAssignmentCreate(BaseModel):
    patient_id: int
    exercise_id: int
    sets: Optional[int] = None
    reps: Optional[int] = None
    sessions_per_day: Optional[int] = None
    hep_required: Optional[bool] = True

class PatientExerciseAssignmentResponse(PatientExerciseAssignmentCreate):
    id: int

    class Config:
        from_attributes = True

#========================= VISITS =========================#

class VisitCreate(BaseModel):
    patient_id: int
    staff_id: int
    visit_date: date
    visit_type: str
    status: Optional[str] = "Scheduled"
    scheduled_time: Optional[str] = None

class VisitUpdate(BaseModel):
    patient_id: Optional[int] = None
    staff_id: Optional[int] = None
    certification_period_id: Optional[int] = None
    visit_date: Optional[date] = None
    visit_type: Optional[str] = None
    therapy_type: Optional[str] = None
    status: Optional[str] = None
    scheduled_time: Optional[str] = None

    class Config:
        from_attributes = True

class VisitResponse(BaseModel):
    id: int
    patient_id: int
    staff_id: int
    certification_period_id: int
    visit_date: date
    visit_type: str
    therapy_type: str
    status: Optional[str]
    scheduled_time: Optional[str]
    note_id: Optional[int] = None

    class Config:
        from_attributes = True

#========================= CERTIFICATION PERIODS =========================#

class CertificationPeriodResponse(BaseModel):
    id: int
    patient_id: int
    start_date: date
    end_date: date
    is_active: bool
    pt_frequency: str
    ot_frequency: str
    st_frequency: str
    pt_approved_visits: int
    ot_approved_visits: int
    st_approved_visits: int

    class Config:
        from_attributes = True

class CertificationPeriodUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    pt_frequency: Optional[str] = None
    ot_frequency: Optional[str] = None
    st_frequency: Optional[str] = None
    pt_approved_visits: Optional[int] = None
    ot_approved_visits: Optional[int] = None
    st_approved_visits: Optional[int] = None

    class Config:
        from_attributes = True

#========================= NOTESECTIONS =========================#

class NoteSectionCreate(BaseModel):
    section_name: str
    description: Optional[str] = None
    is_required: Optional[bool] = False
    has_static_image: Optional[bool] = False
    static_image_url: Optional[str] = None
    form_schema: Optional[Dict] = None 

class NoteSectionUpdate(BaseModel):
    section_name: Optional[str] = None
    description: Optional[str] = None
    is_required: Optional[bool] = None
    has_static_image: Optional[bool] = None
    static_image_url: Optional[str] = None
    form_schema: Optional[Dict] = None

    class Config:
        from_attributes = True

class NoteSectionResponse(NoteSectionCreate):
    id: int

    class Config:
        from_attributes = True

#========================= NOTES =========================#

class VisitNoteCreate(BaseModel):
    visit_id: int
    status: Optional[str] = "Pending"
    sections_data: Optional[dict] = None

class VisitNoteUpdate(BaseModel):
    status: Optional[str] = None
    sections_data: Optional[dict] = None

class VisitNoteResponse(BaseModel):
    id: int
    visit_id: int
    status: str
    sections_data: Optional[dict] = None
    therapist_name: str

    class Config:
        from_attributes = True

#========================= NOTETEMPLATES =========================#

class NoteTemplateCreate(BaseModel):
    discipline: str
    note_type: str
    is_active: bool = True
    section_ids: List[int]

class NoteTemplateUpdate(BaseModel):
    discipline: Optional[str] = None
    note_type: Optional[str] = None
    is_active: Optional[bool] = None
    replace_section_ids: Optional[List[int]] = None
    add_section_ids: Optional[List[int]] = None
    remove_section_ids: Optional[List[int]] = None

    class Config:
        from_attributes = True

class NoteTemplateResponse(BaseModel):
    id: int
    discipline: str
    note_type: str
    is_active: bool

    class Config:
        from_attributes = True

class NoteTemplateWithSectionsResponse(BaseModel):
    id: int
    discipline: str
    note_type: str
    is_active: bool
    sections: List[NoteSectionResponse]

    class Config:
        from_attributes = True

#========================= COMMUNICATION RECORDS =========================#

class CommunicationRecordCreate(BaseModel):
    certification_period_id: int
    title: str
    content: str

class CommunicationRecordUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

    class Config:
        from_attributes = True

class CommunicationRecordResponse(BaseModel):
    id: int
    certification_period_id: int
    title: str
    content: str
    created_by: int
    created_at: datetime
    staff_name: Optional[str] = None

    class Config:
        from_attributes = True
