from pydantic import BaseModel
from typing import Optional, Dict, Any

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: str | None = None

class LoginRequest(BaseModel):
    username: str
    password: str
    device_fingerprint: Optional[Dict[str, Any]] = None

class UserCredentials(BaseModel):
    user_id: int
    username: str
    role: str

class TokenRequest(BaseModel):
    user_id: int
    username: str
    role: str