from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    username: str | None = None

class LoginRequest(BaseModel):
    username: str
    password: str

class UserCredentials(BaseModel):
    user_id: int
    username: str
    role: str

class TokenRequest(BaseModel):
    user_id: int
    username: str
    role: str