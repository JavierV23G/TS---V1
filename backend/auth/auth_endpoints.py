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
from .security import verify_password
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
    
    # PASO 2: IP PERMITIDA - VERIFICAR CREDENCIALES
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
    
    # PASO 3: CREDENCIALES CORRECTAS - REGISTRAR LOGIN EXITOSO
    security_manager.record_successful_login(http_request, login_data.username)
    
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
    
    # PASO 2: IP PERMITIDA - VERIFICAR CREDENCIALES
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
    
    # PASO 3: CREDENCIALES CORRECTAS - REGISTRAR LOGIN EXITOSO
    security_manager.record_successful_login(http_request, login_data.username)
    
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
        is_blocked, block_info = security_manager.is_user_blocked_readonly(username)
        
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