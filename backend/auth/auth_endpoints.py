from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Staff
from .auth_schemas import LoginRequest, Token, UserCredentials, TokenRequest
from .jwt_handler import create_access_token
from .security import verify_password

router = APIRouter()

# SLAVE - Verificar credenciales (READ operation)
@router.post("/verify-credentials", response_model=UserCredentials)
def verify_credentials(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Staff).filter(Staff.username == request.username).first()

    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return UserCredentials(
        user_id=user.id,
        username=user.username,
        role=user.role
    )

# MAIN - Crear token (WRITE operation)
@router.post("/create-token", response_model=Token)
def create_token(request: TokenRequest):
    token = create_access_token(data={
        "sub": request.username,
        "user_id": request.user_id,
        "role": request.role
    })
    return {"access_token": token, "token_type": "bearer"}

# LEGACY - Mantener endpoint original para compatibilidad
@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Staff).filter(Staff.username == request.username).first()

    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}