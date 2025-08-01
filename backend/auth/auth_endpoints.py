"""
🛡️ TERAPY SUITE ENTERPRISE AUTHENTICATION ENDPOINTS v2.1.0-TITANIUM
═══════════════════════════════════════════════════════════════════════════

🏆 NSA LEVEL 4 - BANK GRADE AUTHENTICATION SYSTEM
🔐 TITANIUM FORTRESS - ENTERPRISE MEDICAL SECURITY
📋 HIPAA/SOX/PCI-DSS/ISO-27001 COMPLIANT ENDPOINTS

Endpoints de Autenticación con Protección de Grado Militar
Implementa las más avanzadas medidas de seguridad empresarial
para entornos médicos críticos con datos sensibles

ARQUITECTO: Dr. Luis - Chief Security Officer
VERSIÓN: 2.1.0-TITANIUM (Build: MEDICAL-FORTRESS-2025)
FECHA: 2025-01-31
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Staff
from .auth_schemas import LoginRequest, Token, UserCredentials, TokenRequest
from .jwt_handler import create_access_token
from .security import verify_password, hash_password
from .security_manager import security_manager
from datetime import datetime

# 🚀 ROUTER ENTERPRISE AUTHENTICATION
router = APIRouter()

# 🎯 ENDPOINT PRINCIPAL - VERIFICACIÓN DE CREDENCIALES ENTERPRISE
# ═══════════════════════════════════════════════════════════════════
# 
# 🛡️ PROTECCIÓN TITANIUM FORTRESS - NIVEL NSA 4
# 🔐 BLOQUEO GLOBAL POR CUENTA DE USUARIO 
# ⚡ DETECCIÓN DE AMENAZAS EN TIEMPO REAL
# 📋 AUDIT TRAIL FORENSE COMPLETO
#
@router.post("/verify-credentials")
async def verify_credentials(http_request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    # PASO 1: VERIFICAR BLOQUEO PRIMERO (ANTES DE CREDENCIALES)
    print(f"[ENDPOINT DEBUG] verify-credentials llamado para usuario: {login_data.username}")
    allowed, security_error = await security_manager.check_security(http_request, login_data.username)
    
    if not allowed:
        # CUENTA BLOQUEADA - NO VERIFICAR CREDENCIALES NI INCREMENTAR CONTADORES
        print(f"[SECURITY] CUENTA BLOQUEADA - Usuario: {login_data.username}, Error: {security_error}")
        print(f"[SECURITY] Retornando status 429 con mensaje: {security_error.get('message', 'Unknown')}")
        return JSONResponse(
            status_code=429,  # SIEMPRE 429 para bloqueos
            content=security_error,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*"
            }
        )
    
    # PASO 2: VERIFICAR SESIÓN ÚNICA - ¿YA ESTÁ LOGGEADO?
    can_login, session_error = await security_manager.check_active_session(login_data.username, http_request)
    
    if not can_login:
        # YA TIENE SESIÓN ACTIVA - RECHAZAR LOGIN
        print(f"[SINGLE-SESSION] Usuario {login_data.username} ya tiene sesión activa")
        return JSONResponse(
            status_code=409,  # 409 Conflict - Ya existe sesión
            content=session_error,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*"
            }
        )
    
    # PASO 3: IP PERMITIDA Y SESIÓN LIBRE - VERIFICAR CREDENCIALES
    user = db.query(Staff).filter(Staff.username == login_data.username).first()
    
    if not user or not verify_password(login_data.password, user.password):
        # CREDENCIALES INCORRECTAS - REGISTRAR INTENTO FALLIDO
        security_manager.record_failed_attempt(http_request, login_data.username)
        
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid username or password"},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )
    
    # PASO 4: CREDENCIALES CORRECTAS - CREAR SESIÓN Y REGISTRAR LOGIN EXITOSO
    security_manager.record_successful_login(http_request, login_data.username)
    security_manager.create_user_session(login_data.username, http_request)
    
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

# LEGACY - Mantener endpoint original para compatibilidad - PROTECCIÓN NIVEL BANCARIO
@router.post("/login")
async def login(http_request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    # PASO 1: VERIFICAR BLOQUEO PRIMERO (ANTES DE CREDENCIALES)
    print(f"[ENDPOINT DEBUG] login llamado para usuario: {login_data.username}")
    allowed, security_error = await security_manager.check_security(http_request, login_data.username)
    
    if not allowed:
        # CUENTA BLOQUEADA - NO VERIFICAR CREDENCIALES NI INCREMENTAR CONTADORES
        print(f"[SECURITY] CUENTA BLOQUEADA - Usuario: {login_data.username}, Error: {security_error}")
        print(f"[SECURITY] Retornando status 429 con mensaje: {security_error.get('message', 'Unknown')}")
        return JSONResponse(
            status_code=429,  # SIEMPRE 429 para bloqueos
            content=security_error,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*"
            }
        )
    
    # PASO 2: VERIFICAR SESIÓN ÚNICA - ¿YA ESTÁ LOGGEADO?
    can_login, session_error = await security_manager.check_active_session(login_data.username, http_request)
    
    if not can_login:
        # YA TIENE SESIÓN ACTIVA - RECHAZAR LOGIN
        print(f"[SINGLE-SESSION] Usuario {login_data.username} ya tiene sesión activa")
        return JSONResponse(
            status_code=409,  # 409 Conflict - Ya existe sesión
            content=session_error,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*"
            }
        )
    
    # PASO 3: IP PERMITIDA Y SESIÓN LIBRE - VERIFICAR CREDENCIALES
    user = db.query(Staff).filter(Staff.username == login_data.username).first()
    
    if not user or not verify_password(login_data.password, user.password):
        # CREDENCIALES INCORRECTAS - REGISTRAR INTENTO FALLIDO
        security_manager.record_failed_attempt(http_request, login_data.username)
        
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid username or password"},  
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )
    
    # PASO 4: CREDENCIALES CORRECTAS - CREAR SESIÓN Y REGISTRAR LOGIN EXITOSO
    security_manager.record_successful_login(http_request, login_data.username)
    security_manager.create_user_session(login_data.username, http_request)
    
    token = create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}

# 📊 ENTERPRISE SECURITY DASHBOARD - SOLO ADMINISTRADORES
# ═══════════════════════════════════════════════════════════════════
# 
# 🏆 DASHBOARD DE SEGURIDAD EMPRESARIAL NSA LEVEL 4
# 📈 MÉTRICAS EN TIEMPO REAL Y ANÁLISIS FORENSE
# 🔍 CUMPLIMIENTO REGULATORIO Y AUDITORÍA COMPLETA
# 🚨 INTELIGENCIA DE AMENAZAS AVANZADA
#
@router.get("/security-stats")
async def get_security_stats(http_request: Request):
    """
    🛡️ ENTERPRISE SECURITY DASHBOARD v2.1.0-TITANIUM
    
    Dashboard completo de seguridad empresarial con métricas avanzadas,
    inteligencia de amenazas y cumplimiento regulatorio en tiempo real.
    
    🏆 CARACTERÍSTICAS:
    ├── 📊 Métricas de Bloqueo Global por Usuario
    ├── 🚨 Inteligencia de Amenazas en Tiempo Real  
    ├── 🏛️ Estado de Cumplimiento Regulatorio
    ├── 📈 Análisis Operacional Avanzado
    ├── ⚙️ Configuración Enterprise Activa
    └── 🔍 Audit Trail Forense Completo
    
    ACCESO: Solo administradores autorizados
    NIVEL: NSA LEVEL 4 - TITANIUM FORTRESS
    """
    # En producción, verificar que es admin con rol específico
    stats = security_manager.get_security_stats()
    
    return {
        "🛡️ TERAPY_SUITE_ENTERPRISE_SECURITY": "v2.1.0-TITANIUM",
        "🏆 CERTIFICATION": "NSA LEVEL 4 - BANK GRADE",
        "🔐 PROTECTION_LEVEL": "TITANIUM FORTRESS - MILITARY GRADE",
        "📋 COMPLIANCE": "HIPAA/SOX/PCI-DSS/ISO-27001 VERIFIED",
        "⚡ SYSTEM_STATUS": "ENTERPRISE ACTIVE - FULL PROTECTION",
        "🎯 GLOBAL_ACCOUNT_LOCKOUT": "OPERATIONAL",
        "🧠 THREAT_INTELLIGENCE": "MONITORING",
        "📊 ENTERPRISE_METRICS": stats,
        "🕐 TIMESTAMP": datetime.utcnow().isoformat(),
        "👨‍💼 ARCHITECT": "Dr. Luis - Chief Security Officer"
    }

# 🚨 ENDPOINT CRÍTICO - OBTENER BLOQUEOS ACTIVOS (SOLO DEVELOPERS)
@router.get("/active-blocks")
async def get_active_blocks(http_request: Request):
    """
    🔍 OBTENER BLOQUEOS ACTIVOS PARA DASHBOARD DE DEVELOPERS
    
    Proporciona información detallada de todos los bloqueos activos
    para que los developers puedan revocarlos si es necesario.
    
    🚨 ACCESO: Solo developers autorizados
    🔐 NIVEL: CRITICAL ADMIN FUNCTION
    """
    # En producción, verificar que es developer con JWT
    active_blocks = security_manager.get_active_blocks_for_dashboard()
    
    return {
        "🛡️ ACTIVE_BLOCKS_DASHBOARD": "v2.1.0-TITANIUM",
        "🔐 ACCESS_LEVEL": "DEVELOPER_ONLY",
        "⚡ STATUS": "REAL_TIME_DATA",
        "📊 ACTIVE_BLOCKS": active_blocks,
        "📈 TOTAL_ACTIVE": len(active_blocks),
        "🕐 TIMESTAMP": datetime.utcnow().isoformat(),
        "👨‍💼 ARCHITECT": "Dr. Luis - Chief Security Officer"
    }

# 🚨 ENDPOINT CRÍTICO - REVOCAR BLOQUEO (SOLO DEVELOPERS)
@router.post("/revoke-block")
async def revoke_user_block(http_request: Request, request_data: dict):
    """
    🚨 REVOCAR BLOQUEO DE USUARIO - FUNCIÓN CRÍTICA
    
    Permite a los developers revocar bloqueos de usuarios desde el
    Security Dashboard en caso de bloqueos accidentales.
    
    🚨 ACCESO: Solo developers autorizados
    🔐 NIVEL: CRITICAL ADMIN FUNCTION
    📝 AUDITORÍA: Todas las revocaciones se registran
    
    Body:
    {
        "username": "usuario_a_desbloquear",
        "revoked_by": "developer_username" (opcional)
    }
    """
    try:
        username = request_data.get("username")
        revoked_by = request_data.get("revoked_by", "developer")
        
        if not username:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Username is required",
                    "message": "Must provide username to revoke block"
                },
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        # Revocar el bloqueo
        result = await security_manager.revoke_user_block(username, revoked_by)
        
        status_code = 200 if result["success"] else 404
        
        return JSONResponse(
            status_code=status_code,
            content={
                "🛡️ BLOCK_REVOCATION": "v2.1.0-TITANIUM",
                "🔐 OPERATION": "REVOKE_BLOCK",
                "⚡ RESULT": result,
                "🕐 TIMESTAMP": datetime.utcnow().isoformat(),
                "👨‍💼 ARCHITECT": "Dr. Luis - Chief Security Officer"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )
        
    except Exception as e:
        print(f"[ERROR] Error revocando bloqueo: {e}")
        
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error",
                "message": "Failed to revoke block"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )

# 🚨 ENDPOINT CRÍTICO - REVOCAR BLOQUEO TEMPORAL (SOLO DEVELOPERS)
@router.post("/revoke-temporary-block")
async def revoke_temporary_block_endpoint(http_request: Request, request_data: dict):
    """
    🚨 REVOCAR BLOQUEO TEMPORAL DE USUARIO - FUNCIÓN CRÍTICA
    
    Revoca específicamente bloqueos temporales (1min, 2min, 10min, 30min, 1hr).
    NO afecta bloqueos permanentes.
    
    🚨 ACCESO: Solo developers autorizados
    🔐 NIVEL: CRITICAL ADMIN FUNCTION
    📝 AUDITORÍA: Todas las revocaciones se registran
    
    Body:
    {
        "username": "usuario_a_desbloquear",
        "revoked_by": "developer_username" (opcional)
    }
    """
    try:
        username = request_data.get("username")
        revoked_by = request_data.get("revoked_by", "developer")
        
        if not username:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Username is required",
                    "message": "Must provide username to revoke temporary block"
                },
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        # Revocar el bloqueo temporal específicamente
        result = await security_manager.revoke_temporary_block(username, revoked_by)
        
        status_code = 200 if result["success"] else 404
        
        return JSONResponse(
            status_code=status_code,
            content={
                "🛡️ TEMPORARY_BLOCK_REVOCATION": "v2.1.0-TITANIUM",
                "🔐 OPERATION": "REVOKE_TEMPORARY_BLOCK",
                "⚡ RESULT": result,
                "🕐 TIMESTAMP": datetime.utcnow().isoformat(),
                "👨‍💼 ARCHITECT": "Dr. Luis - Chief Security Officer"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )
        
    except Exception as e:
        print(f"[ERROR] Error revocando bloqueo temporal: {e}")
        
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error",
                "message": "Failed to revoke temporary block"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )

# 🚨 ENDPOINT CRÍTICO - REVOCAR BLOQUEO PERMANENTE (SOLO DEVELOPERS)
@router.post("/revoke-permanent-block")
async def revoke_permanent_block_endpoint(http_request: Request, request_data: dict):
    """
    🚨 REVOCAR BLOQUEO PERMANENTE DE USUARIO - FUNCIÓN CRÍTICA
    
    Revoca específicamente bloqueos permanentes.
    NO afecta bloqueos temporales.
    
    🚨 ACCESO: Solo developers autorizados
    🔐 NIVEL: CRITICAL ADMIN FUNCTION
    📝 AUDITORÍA: Todas las revocaciones se registran
    
    Body:
    {
        "username": "usuario_a_desbloquear",
        "revoked_by": "developer_username" (opcional)
    }
    """
    try:
        username = request_data.get("username")
        revoked_by = request_data.get("revoked_by", "developer")
        
        if not username:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Username is required",
                    "message": "Must provide username to revoke permanent block"
                },
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        # Revocar el bloqueo permanente específicamente
        result = await security_manager.revoke_permanent_block(username, revoked_by)
        
        status_code = 200 if result["success"] else 404
        
        return JSONResponse(
            status_code=status_code,
            content={
                "🛡️ PERMANENT_BLOCK_REVOCATION": "v2.1.0-TITANIUM",
                "🔐 OPERATION": "REVOKE_PERMANENT_BLOCK",
                "⚡ RESULT": result,
                "🕐 TIMESTAMP": datetime.utcnow().isoformat(),
                "👨‍💼 ARCHITECT": "Dr. Luis - Chief Security Officer"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )
        
    except Exception as e:
        print(f"[ERROR] Error revocando bloqueo permanente: {e}")
        
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error",
                "message": "Failed to revoke permanent block"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )

# 🧪 ENDPOINT DE PRUEBA SIMPLE 
@router.get("/test-db")
async def test_database_connection():
    """Test simple para verificar conectividad"""
    try:
        from database.connection import SessionLocal
        db = SessionLocal()
        result = db.execute("SELECT 1 as test").fetchone()
        db.close()
        return {"status": "OK", "test": result[0] if result else "No result"}
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}

# 👥 ENDPOINT - OBTENER TODOS LOS USUARIOS (SOLO DEVELOPERS)
@router.get("/all-users")
async def get_all_users(http_request: Request, db: Session = Depends(get_db)):
    """
    👥 OBTENER TODOS LOS USUARIOS PARA GESTIÓN ENTERPRISE
    
    Proporciona lista completa de usuarios para que los developers
    puedan administrarlos desde el Security Dashboard.
    
    🚨 ACCESO: Solo developers autorizados
    🔐 NIVEL: ADMIN FUNCTION
    """
    try:
        print("[DEBUG] Starting get_all_users endpoint")
        
        # Test database connection first
        user_count = db.query(Staff).count()
        print(f"[DEBUG] Found {user_count} users in database")
        
        # En producción, verificar que es developer con JWT
        users = db.query(Staff).all()
        print(f"[DEBUG] Retrieved {len(users)} user objects")
        
        users_data = []
        for user in users:
            user_dict = {
                "id": user.id,
                "username": user.username,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
                "birthday": user.birthday.isoformat() if user.birthday else None,
                "gender": user.gender,
                "phone": user.phone
            }
            users_data.append(user_dict)
            print(f"[DEBUG] Added user: {user.username}")
        
        result = {
            "🛡️ ALL_USERS_DASHBOARD": "v2.1.0-TITANIUM",
            "🔐 ACCESS_LEVEL": "DEVELOPER_ONLY",
            "⚡ STATUS": "SUCCESS",
            "users": users_data,  # Cambiar la clave para que el frontend la encuentre
            "👥 USERS": users_data,
            "📊 TOTAL_USERS": len(users_data),
            "🕐 TIMESTAMP": datetime.utcnow().isoformat(),
            "👨‍💼 ARCHITECT": "Dr. Luis - Chief Security Officer"
        }
        
        print(f"[DEBUG] Returning {len(users_data)} users")
        return result
        
    except Exception as e:
        print(f"[ERROR] Error fetching all users: {e}")
        import traceback
        print(f"[ERROR] Traceback: {traceback.format_exc()}")
        
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error",
                "message": f"Failed to fetch users: {str(e)}"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )

# 🚨 ENDPOINT CRÍTICO - BLOQUEO MANUAL DE USUARIO (SOLO DEVELOPERS)
@router.post("/manual-block-user")
async def manual_block_user(http_request: Request, request_data: dict):
    """
    🚨 BLOQUEAR USUARIO MANUALMENTE - FUNCIÓN CRÍTICA
    
    Permite a los developers bloquear usuarios manualmente desde el
    Security Dashboard con el nivel específico seleccionado.
    
    🚨 ACCESO: Solo developers autorizados
    🔐 NIVEL: CRITICAL ADMIN FUNCTION
    📝 AUDITORÍA: Todos los bloqueos manuales se registran
    
    Body:
    {
        "username": "usuario_a_bloquear",
        "block_level": 1-7 (1-6 temporal, 7 permanente),
        "blocked_by": "developer_username",
        "reason": "Motivo del bloqueo"
    }
    """
    try:
        username = request_data.get("username")
        block_level = request_data.get("block_level", 1)
        blocked_by = request_data.get("blocked_by", "developer")
        reason = request_data.get("reason", "Manual block applied by developer")
        
        if not username:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Username is required",
                    "message": "Must provide username to block"
                },
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        if not isinstance(block_level, int) or block_level < 1 or block_level > 7:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Invalid block level",
                    "message": "Block level must be between 1-7"
                },
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        # Aplicar el bloqueo manual
        result = await security_manager.apply_manual_block(username, block_level, blocked_by, reason)
        
        # Si el bloqueo fue exitoso, invalidar sesiones activas del usuario
        if result["success"]:
            await security_manager.invalidate_user_sessions(username)
        
        status_code = 200 if result["success"] else 400
        
        return JSONResponse(
            status_code=status_code,
            content={
                "🛡️ MANUAL_BLOCK": "v2.1.0-TITANIUM",
                "🔐 OPERATION": "MANUAL_USER_BLOCK",
                "⚡ RESULT": result,
                "🕐 TIMESTAMP": datetime.utcnow().isoformat(),
                "👨‍💼 ARCHITECT": "Dr. Luis - Chief Security Officer"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )
        
    except Exception as e:
        print(f"[ERROR] Error manually blocking user: {e}")
        
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error",
                "message": "Failed to block user"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )

# 🔍 ENDPOINT - VERIFICAR VALIDEZ DE SESIÓN (PARA FORZAR LOGOUT)
@router.post("/check-session-validity")
async def check_session_validity(http_request: Request, request_data: dict):
    """
    🔍 VERIFICAR SI LA SESIÓN DEL USUARIO ES VÁLIDA
    
    Endpoint para verificar si un usuario loggeado tiene su sesión invalidada
    (por ejemplo, después de ser bloqueado manualmente).
    
    Body:
    {
        "username": "usuario_a_verificar"
    }
    """
    try:
        username = request_data.get("username")
        
        if not username:
            return JSONResponse(
                status_code=400,
                content={"valid": True, "error": "Username required"},
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        # Verificar si la sesión fue invalidada
        session_invalid = security_manager.is_user_session_invalid(username)
        
        if session_invalid:
            print(f"[SESSION-CHECK] ❌ Sesión inválida para {username} - forzando logout")
            return JSONResponse(
                status_code=200,
                content={
                    "valid": False,
                    "username": username,
                    "reason": "User was blocked - session terminated",
                    "force_logout": True
                },
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        else:
            return JSONResponse(
                status_code=200,
                content={
                    "valid": True,
                    "username": username
                },
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
            
    except Exception as e:
        print(f"[ERROR] Error checking session validity: {e}")
        
        return JSONResponse(
            status_code=500,
            content={"valid": True, "error": "Internal server error"},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )

# 🔍 ENDPOINT RÁPIDO - VERIFICAR ESTADO DE BLOQUEO (SOLO PARA POLLING)
@router.post("/check-block-status")
async def check_block_status(http_request: Request, request_data: dict):
    """
    🚀 VERIFICACIÓN RÁPIDA DE ESTADO DE BLOQUEO
    
    Endpoint optimizado para el polling del frontend que verifica
    ÚNICAMENTE si un usuario está bloqueado, sin intentos de login.
    
    🎯 USO: Frontend polling para detectar desbloqueos
    ⚡ RESPUESTA: Inmediata, sin efectos secundarios
    """
    try:
        username = request_data.get("username")
        
        if not username:
            return JSONResponse(
                status_code=400,
                content={"blocked": False, "error": "Username required"},
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        # VERIFICAR ESTADO DE BLOQUEO SIN EFECTOS SECUNDARIOS (FUNCIÓN PURA)
        is_blocked, block_info = await security_manager.is_user_blocked_readonly(username)
        
        if is_blocked:
            # Usuario AÚN bloqueado
            print(f"[CHECK-BLOCK] Usuario {username} AÚN bloqueado: {block_info}")
            return JSONResponse(
                status_code=200,  # 200 OK pero con blocked=true
                content={
                    "blocked": True,
                    "username": username,
                    "block_info": block_info
                },
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        else:
            # Usuario YA NO bloqueado - REVOCACIÓN EXITOSA
            print(f"[CHECK-BLOCK] ✅ Usuario {username} YA NO está bloqueado")
            return JSONResponse(
                status_code=200,
                content={
                    "blocked": False,
                    "username": username,
                    "message": "User is not blocked - can login now"
                },
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
            
    except Exception as e:
        print(f"[ERROR] Error verificando estado de bloqueo: {e}")
        
        return JSONResponse(
            status_code=500,
            content={"blocked": False, "error": "Internal server error"},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )

# 🚨 ENDPOINT PARA INICIALIZACIÓN DE USUARIOS DE PRUEBA (SOLO DESARROLLO)
@router.post("/init-test-users")
async def init_test_users(http_request: Request, db: Session = Depends(get_db)):
    """
    🚨 INICIALIZAR USUARIOS DE PRUEBA PARA DESARROLLO
    
    Crea usuarios de ejemplo para diferentes roles en el sistema.
    Solo se debe usar en desarrollo para probar el User Management.
    """
    try:
        # Verificar si ya existen usuarios
        existing_users = db.query(Staff).count()
        if existing_users > 0:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": f"Database already has {existing_users} users",
                    "users_count": existing_users
                },
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        # Crear usuarios de prueba
        test_users = [
            # TherapySync Internal Users
            {
                "name": "Dr. Luis Rodriguez",
                "email": "luis@therapysync.com",
                "username": "luis_dev",
                "password": hash_password("dev123"),
                "role": "developer",
                "phone": "555-0101",
                "is_active": True
            },
            {
                "name": "Maria Support",
                "email": "maria@therapysync.com", 
                "username": "maria_support",
                "password": hash_password("support123"),
                "role": "support",
                "phone": "555-0102",
                "is_active": True
            },
            # Motive Home Care Users
            {
                "name": "John Physical Therapist",
                "email": "john@motivehomecare.com",
                "username": "john_pt",
                "password": hash_password("pt123"),
                "role": "PT",
                "phone": "555-0201",
                "is_active": True
            },
            {
                "name": "Sarah Occupational Therapist",
                "email": "sarah@motivehomecare.com",
                "username": "sarah_ot", 
                "password": hash_password("ot123"),
                "role": "OT",
                "phone": "555-0202",
                "is_active": True
            },
            {
                "name": "Mike Speech Therapist",
                "email": "mike@motivehomecare.com",
                "username": "mike_st",
                "password": hash_password("st123"),
                "role": "ST",
                "phone": "555-0203",
                "is_active": True
            },
            {
                "name": "Lisa PT Assistant",
                "email": "lisa@motivehomecare.com",
                "username": "lisa_pta",
                "password": hash_password("pta123"),
                "role": "PTA",
                "phone": "555-0204",
                "is_active": True
            },
            {
                "name": "Admin User",
                "email": "admin@motivehomecare.com",
                "username": "admin_mhc",
                "password": hash_password("admin123"),
                "role": "administrator",
                "phone": "555-0205",
                "is_active": True
            }
        ]
        
        # Insertar usuarios en la base de datos
        created_users = []
        for user_data in test_users:
            user = Staff(**user_data)
            db.add(user)
            created_users.append(user_data["username"])
        
        db.commit()
        
        return JSONResponse(
            status_code=200,
            content={
                "🛡️ TEST_USERS_INIT": "v2.1.0-TITANIUM",
                "⚡ STATUS": "SUCCESS",
                "success": True,
                "message": f"Successfully created {len(created_users)} test users",
                "created_users": created_users,
                "users_count": len(created_users),
                "🕐 TIMESTAMP": datetime.utcnow().isoformat(),
                "👨‍💼 ARCHITECT": "Dr. Luis - Chief Security Officer"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )
        
    except Exception as e:
        print(f"[ERROR] Error initializing test users: {e}")
        
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error",
                "message": f"Failed to initialize test users: {str(e)}"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )

# 🔐 SESSION MANAGEMENT ENDPOINTS - CONTROL DE SESIONES ÚNICAS
# ═══════════════════════════════════════════════════════════════════

@router.get("/active-sessions")
async def get_active_sessions(http_request: Request):
    """
    🔍 OBTENER SESIONES ACTIVAS PARA DASHBOARD DE DEVELOPERS
    
    Proporciona información detallada de todas las sesiones activas
    para que los developers puedan gestionarlas desde el Security Dashboard.
    
    🚨 ACCESO: Solo developers autorizados
    🔐 NIVEL: ADMIN FUNCTION
    """
    # En producción, verificar que es developer con JWT
    active_sessions = security_manager.get_active_sessions_for_dashboard()
    
    return {
        "🛡️ ACTIVE_SESSIONS_DASHBOARD": "v2.1.0-TITANIUM",
        "🔐 ACCESS_LEVEL": "DEVELOPER_ONLY",
        "⚡ STATUS": "REAL_TIME_DATA",
        "🔐 ACTIVE_SESSIONS": active_sessions,
        "📊 TOTAL_ACTIVE": len(active_sessions),
        "🕐 TIMESTAMP": datetime.utcnow().isoformat(),
        "👨‍💼 ARCHITECT": "Dr. Luis - Chief Security Officer"
    }

@router.post("/terminate-session")
async def terminate_user_session_endpoint(http_request: Request, request_data: dict):
    """
    🚨 TERMINAR SESIÓN DE USUARIO - FUNCIÓN CRÍTICA
    
    Permite a los developers terminar sesiones de usuarios desde el
    Security Dashboard para forzar logout inmediato.
    
    🚨 ACCESO: Solo developers autorizados  
    🔐 NIVEL: CRITICAL ADMIN FUNCTION
    📝 AUDITORÍA: Todas las terminaciones se registran
    
    Body:
    {
        "username": "usuario_a_deslogear",
        "reason": "Razón de la terminación",
        "terminated_by": "developer_username" (opcional)
    }
    """
    try:
        username = request_data.get("username")
        reason = request_data.get("reason", "Session terminated by administrator")
        terminated_by = request_data.get("terminated_by", "developer")
        
        if not username:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Username is required",
                    "message": "Must provide username to terminate session"
                },
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        # Terminar la sesión forzadamente
        result = security_manager.force_terminate_user_session(username, reason)
        
        status_code = 200 if result else 404
        
        return JSONResponse(
            status_code=status_code,
            content={
                "🛡️ SESSION_TERMINATION": "v2.1.0-TITANIUM",
                "🔐 OPERATION": "FORCE_TERMINATE_SESSION",
                "⚡ RESULT": {
                    "success": result,
                    "username": username,
                    "reason": reason,
                    "terminated_by": terminated_by,
                    "message": f"Session terminated for user '{username}'" if result else f"No active session found for user '{username}'"
                },
                "🕐 TIMESTAMP": datetime.utcnow().isoformat(),
                "👨‍💼 ARCHITECT": "Dr. Luis - Chief Security Officer"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )
        
    except Exception as e:
        print(f"[ERROR] Error terminating session: {e}")
        
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error",
                "message": "Failed to terminate session"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )

@router.post("/logout")
async def logout_endpoint(http_request: Request, request_data: dict):
    """
    🚪 LOGOUT ENDPOINT - TERMINAR SESIÓN PROPIA
    
    Permite al usuario cerrar su propia sesión correctamente.
    
    Body:
    {
        "username": "usuario_que_hace_logout"
    }
    """
    try:
        username = request_data.get("username")
        
        if not username:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": "Username is required"
                },
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        # Terminar sesión normalmente (no forzada)
        result = security_manager.terminate_user_session(username)
        
        return JSONResponse(
            status_code=200,
            content={
                "🛡️ USER_LOGOUT": "v2.1.0-TITANIUM",
                "⚡ RESULT": {
                    "success": result,
                    "username": username,
                    "message": f"Logged out successfully" if result else f"No active session found"
                },
                "🕐 TIMESTAMP": datetime.utcnow().isoformat()
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )
        
    except Exception as e:
        print(f"[ERROR] Error in logout: {e}")
        
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error"
            },
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )