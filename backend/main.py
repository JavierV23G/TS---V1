from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
from sqlalchemy import inspect, text

sys.path.append("/app")

from database.connection import engine, Base
from database.models import Staff, Patient, CertificationPeriod, Document
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

@app.on_event("startup")
async def startup():
    try:
        with engine.connect() as conn:
            conn.execute(text("SET search_path TO public;"))
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas o ya existentes.")
        
        # Initialize test users if none exist
        from sqlalchemy.orm import sessionmaker
        from auth.security import hash_password
        
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        try:
            user_count = db.query(Staff).count()
            if user_count == 0:
                print("🔧 Inicializando usuarios de prueba...")
                
                test_users = [
                    Staff(
                        name="Dr. Luis Rodriguez",
                        email="luis@therapysync.com",
                        username="luis_dev",
                        password=hash_password("dev123"),
                        role="developer",
                        phone="555-0101",
                        is_active=True
                    ),
                    Staff(
                        name="Maria Support",
                        email="maria@therapysync.com",
                        username="maria_support",
                        password=hash_password("support123"),
                        role="support",
                        phone="555-0102",
                        is_active=True
                    ),
                    Staff(
                        name="John Physical Therapist",
                        email="john@motivehomecare.com",
                        username="john_pt",
                        password=hash_password("pt123"),
                        role="PT",
                        phone="555-0201",
                        is_active=True
                    ),
                    Staff(
                        name="Sarah Occupational Therapist",
                        email="sarah@motivehomecare.com",
                        username="sarah_ot",
                        password=hash_password("ot123"),
                        role="OT",
                        phone="555-0202",
                        is_active=True
                    ),
                    Staff(
                        name="Mike Speech Therapist",
                        email="mike@motivehomecare.com",
                        username="mike_st",
                        password=hash_password("st123"),
                        role="ST",
                        phone="555-0203",
                        is_active=True
                    ),
                    Staff(
                        name="Admin User",
                        email="admin@motivehomecare.com",
                        username="admin_mhc",
                        password=hash_password("admin123"),
                        role="administrator",
                        phone="555-0205",
                        is_active=True
                    )
                ]
                
                for user in test_users:
                    db.add(user)
                
                db.commit()
                print(f"✅ Creados {len(test_users)} usuarios de prueba")
            else:
                print(f"✅ Base de datos ya tiene {user_count} usuarios")
                
        except Exception as e:
            print(f"❌ Error inicializando usuarios: {e}")
            db.rollback()
        finally:
            db.close()
            
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
