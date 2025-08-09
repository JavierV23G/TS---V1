from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
from sqlalchemy import inspect, text

sys.path.append("/app")

from database.connection import engine, Base
from database.models import Staff, Patient, CertificationPeriod, Document, Signature
from auth import auth_router
from routes import create_router, search_router, update_router, delete_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], 
)

# Security system enabled without WebSocket notifications
NOTIFICATIONS_ENABLED = False
print("🔐 [MAIN] Security System Active (WebSocket disabled)")

@app.on_event("startup")
async def startup():
    try:
        with engine.connect() as conn:
            conn.execute(text("SET search_path TO public;"))
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas o ya existentes.")
        
        # Security system active (WebSocket notifications disabled)
        print("🔐 [STARTUP] Security system ready - WebSocket notifications disabled")
            
    except Exception as e:
        print(f"Error during startup: {e}")

app.include_router(create_router)
app.include_router(search_router)
app.include_router(update_router)
app.include_router(delete_router)
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

@app.get("/")
async def root():
    return {"message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
