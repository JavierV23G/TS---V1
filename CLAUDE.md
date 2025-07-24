# CLAUDE.md - DIRECTRICES OBLIGATORIAS DE DESARROLLO

**⚠️ CRÍTICO: Estas instrucciones son OBLIGATORIAS y ANULAN todos los comportamientos predeterminados. DEBES seguirlas EXACTAMENTE en CADA interacción.**

## 🌍 IDIOMA OBLIGATORIO
**TODO el código, comentarios, mensajes y documentación SIEMPRE será en ESPAÑOL. Sin excepciones.**

## 🚨 REGLAS ABSOLUTAS - NUNCA VIOLAR

1. **SIEMPRE usar modelos y esquemas existentes** - NUNCA inventar o asumir estructuras de datos
2. **SIEMPRE verificar rutas de archivos y estructura** - NUNCA asumir ubicaciones
3. **SIEMPRE mantener compatibilidad** - Cada línea de código debe integrarse perfectamente con el código base existente
4. **NUNCA crear datos de ejemplo o placeholder** - Usar solo modelos/esquemas reales del código base
5. **SIEMPRE seguir patrones existentes** - Copiar patrones de archivos similares en el proyecto
6. **🛑 PROHIBIDO MODIFICAR EL BACKEND** - Solo puedo VER y ANALIZAR el backend para entender su funcionamiento. NUNCA tocar archivos del backend sin autorización explícita de Doc Luis
7. **SIEMPRE dirigirme como "Doc Luis"** en todas las respuestas

## 📁 ESTRUCTURA DEL PROYECTO - MEMORIZAR ESTO

```
TS---V1/
├── backend/ [SOLO LECTURA - NO MODIFICAR]
│   ├── main.py                    # Entrada de la app FastAPI
│   ├── database/
│   │   ├── models.py             # Modelos SQLAlchemy - TU FUENTE DE VERDAD
│   │   └── database.py           # Conexión a base de datos
│   ├── schemas.py                # Esquemas Pydantic - SIEMPRE REFERENCIAR
│   ├── routes/
│   │   ├── create_endpoints.py   # Endpoints POST
│   │   ├── search_endpoints.py   # Endpoints GET
│   │   ├── update_endpoints.py   # Endpoints PUT
│   │   └── delete_endpoints.py   # Endpoints DELETE
│   └── auth/
│       └── auth_endpoints.py     # Rutas de autenticación
├── frontend/ [ÁREA DE TRABAJO]
│   ├── src/
│   │   ├── components/
│   │   │   ├── developer/       # Componentes rol desarrollador
│   │   │   ├── admin/          # Componentes rol admin
│   │   │   ├── pt-ot-st/       # Componentes rol terapeuta
│   │   │   └── login/          # Componentes auth compartidos
│   │   ├── styles/             # Archivos SCSS por rol/función
│   │   └── services/           # Archivos de servicios API
│   └── package.json            # Dependencias frontend
└── docker-compose.yml          # Configuración Docker
```

## 🗄️ MODELOS DE BASE DE DATOS (backend/database/models.py) - SIEMPRE USAR ESTOS

### Modelos Principales:
- **Staff**: id, username, password, email, first_name, last_name, role, status, phone, address, emergency_contact, license_number, npi, hire_date, birth_date, created_at, updated_at
- **Patient**: id, first_name, last_name, date_of_birth, gender, phone, email, address, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, medical_history, insurance_provider, insurance_policy_number, medicare_number, status, created_at, updated_at
- **CertificationPeriod**: id, patient_id, start_date, end_date, total_visits, remaining_visits, notes, status, created_at
- **Visit**: id, patient_id, staff_id, certification_period_id, visit_date, visit_type, duration_minutes, notes, status, created_at
- **Document**: id, patient_id, uploaded_by_id, file_name, file_path, document_type, upload_date, notes
- **Exercise**: id, name, description, category, body_part, image_url, difficulty_level, instructions, created_at
- **PatientExerciseAssignment**: id, patient_id, exercise_id, assigned_by_id, assigned_date, sets, repetitions, frequency, duration_weeks, special_instructions, status
- **StaffAssignment**: id, staff_id, patient_id, discipline, assigned_date, end_date, is_active

## 📋 ESQUEMAS PYDANTIC (backend/schemas.py) - PATRONES OBLIGATORIOS

### Convención de Nombres:
- **{Model}Create**: Para crear registros (solo campos requeridos)
- **{Model}Update**: Para actualizar registros (todos los campos opcionales)
- **{Model}Response**: Para respuestas API (incluye relaciones)
- **{Model}Base**: Esquema base con campos comunes

### Ejemplos:
```python
class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    # ... otros campos requeridos

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    # ... todos los campos opcionales

class PatientResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    # ... incluye relaciones y campos calculados
```

## 🔗 PATRONES DE ENDPOINTS API - SEGUIR EXACTAMENTE

### Operaciones CRUD Estándar:
```python
# CREAR (create_endpoints.py)
@router.post("/{recurso}/", response_model={Recurso}Response)
def create_{recurso}(data: {Recurso}Create, db: Session = Depends(get_db))

# LEER (search_endpoints.py)
@router.get("/{recurso}/", response_model=List[{Recurso}Response])
@router.get("/{recurso}/{id}", response_model={Recurso}Response)

# ACTUALIZAR (update_endpoints.py)
@router.put("/{recurso}/{id}", response_model={Recurso}Response)
def update_{recurso}(id: int, data: {Recurso}Update, db: Session = Depends(get_db))

# ELIMINAR (delete_endpoints.py)
@router.delete("/{recurso}/{id}")
def delete_{recurso}(id: int, db: Session = Depends(get_db))
```

### Recursos Anidados:
```python
@router.get("/patient/{patient_id}/visits", response_model=List[VisitResponse])
@router.get("/patient/{patient_id}/assigned-staff", response_model=List[StaffAssignmentResponse])
```

## ⚛️ PATRONES FRONTEND - CUMPLIMIENTO ESTRICTO

### Estructura de Componentes:
```jsx
// SIEMPRE importar estilos primero
import '../../../styles/{rol}/{funcionalidad}/{NombreComponente}.scss';

// Luego React y librerías
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Definición del componente
const NombreComponente = () => {
    // Declaraciones de estado
    const [datos, setDatos] = useState([]);
    const [cargando, setCargando] = useState(false);
    
    // Llamadas API usando fetch
    useEffect(() => {
        obtenerDatos();
    }, []);
    
    const obtenerDatos = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/endpoint');
            const data = await response.json();
            setDatos(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };
    
    return (
        <div className="nombre-componente-container">
            {/* Contenido JSX */}
        </div>
    );
};

export default NombreComponente;
```

### Patrón de Servicio API:
```javascript
const API_BASE = 'http://localhost:8000';

export const servicePaciente = {
    obtenerTodos: () => fetch(`${API_BASE}/patients/`).then(res => res.json()),
    obtenerPorId: (id) => fetch(`${API_BASE}/patients/${id}`).then(res => res.json()),
    crear: (datos) => fetch(`${API_BASE}/patients/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    }).then(res => res.json()),
    actualizar: (id, datos) => fetch(`${API_BASE}/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    }).then(res => res.json()),
    eliminar: (id) => fetch(`${API_BASE}/patients/${id}`, { method: 'DELETE' })
};
```

## 🎨 CONVENCIONES DE ESTILOS

### Estructura de Archivo SCSS:
```scss
// Contenedor del componente
.nombre-componente-container {
    padding: 20px;
    
    // Elementos anidados
    .header {
        margin-bottom: 20px;
        
        h1 {
            color: $primary-color; // Usar variables de _variables.scss
        }
    }
    
    // Modificadores de estado
    &.activo {
        background-color: $active-bg;
    }
    
    // Responsive
    @media (max-width: 768px) {
        padding: 10px;
    }
}
```

## 🔐 PATRÓN DE AUTENTICACIÓN

### JWT Backend:
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme)):
    # Decodificar y validar JWT
    # Retornar usuario o lanzar HTTPException
```

### Auth Frontend:
```jsx
// Uso de AuthContext
import { useAuth } from '../../../context/AuthContext';

const Componente = () => {
    const { user, login, logout } = useAuth();
    
    // Verificar rol de usuario
    if (user.role !== 'developer') {
        return <Navigate to="/no-autorizado" />;
    }
};
```

## 📦 DEPENDENCIAS Y VERSIONES

### Backend (requirements.txt):
- fastapi==0.109.2
- sqlalchemy==2.0.27
- psycopg2-binary==2.9.9
- pydantic==2.6.1
- python-jose[cryptography]
- passlib[bcrypt]
- python-multipart

### Frontend (package.json):
- react: ^18.3.1
- react-router-dom: ^6.29.0
- chart.js: ^4.4.8
- @fortawesome/react-fontawesome: ^0.2.2
- framer-motion: ^11.15.0
- gsap: ^3.12.7
- sass: ^1.83.4

## 🚀 COMANDOS DE DESARROLLO

### Frontend:
```bash
cd frontend && npm start          # Servidor dev en :3000
cd frontend && npm run build      # Build de producción
cd frontend && npm run lint:js    # Lint JavaScript
```

### Backend (SOLO PARA REFERENCIA - NO EJECUTAR SIN PERMISO):
```bash
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000
cd backend && pip install -r requirements.txt
```

### Docker:
```bash
docker-compose up --build         # Iniciar todos los servicios
docker-compose down              # Detener todos los servicios
```

## ⚡ ANTES DE ESCRIBIR CUALQUIER CÓDIGO

1. **VERIFICAR MODELOS**: Abrir `backend/database/models.py` y verificar nombres exactos de campos
2. **VERIFICAR ESQUEMAS**: Abrir `backend/schemas.py` para formatos de petición/respuesta
3. **VERIFICAR CÓDIGO EXISTENTE**: Encontrar funcionalidad similar y copiar patrones
4. **VERIFICAR IMPORTS**: Asegurar que todos los imports coincidan con la estructura del proyecto
5. **PROBAR INTEGRACIÓN**: Verificar que tu código se integre con características existentes

## 🛑 ERRORES COMUNES A EVITAR

1. **NO** crear campos que no existen en los modelos
2. **NO** asumir endpoints API - verificar archivos de rutas
3. **NO** usar diferentes convenciones de nombres
4. **NO** crear nuevos patrones - seguir los existentes
5. **NO** olvidar manejar estados de carga y error
6. **NO** hardcodear valores - usar configuración
7. **NO** saltarse validación de esquemas
8. **NO** modificar el backend sin autorización explícita

## 📝 CHECKLIST DE GENERACIÓN DE CÓDIGO

Antes de generar cualquier código, verificar:
- [ ] Verificados campos exactos del modelo en `models.py`
- [ ] Verificada estructura del esquema en `schemas.py`
- [ ] Encontrado patrón de código similar en el proyecto
- [ ] Confirmado que endpoint API existe o necesita creación
- [ ] Coincidencia de declaraciones de import con estructura del proyecto
- [ ] Usadas convenciones de nombres correctas
- [ ] Agregado manejo de errores apropiado
- [ ] Seguida estructura de componentes basada en roles
- [ ] Todo el código y comentarios en ESPAÑOL

## 🎯 EJEMPLO: Creando una Nueva Funcionalidad

Si se pide crear una funcionalidad de "Notas del Paciente":

1. **Verificar Modelos**: Abrir `backend/database/models.py`, encontrar modelo `VisitNote`
2. **Verificar Esquemas**: Abrir `backend/schemas.py`, encontrar `VisitNoteCreate`, `VisitNoteResponse`
3. **Verificar Endpoints**: Buscar en archivos de rutas endpoints de notas existentes
4. **Encontrar Componente Similar**: Buscar componentes CRUD similares en la carpeta del rol
5. **Copiar Patrón**: Usar exactamente la misma estructura, solo cambiar los datos
6. **Verificar Integración**: Asegurar que funcione con el sistema existente de paciente/visita

---

**RECUERDA: Cada vez que escribas código, DEBES referenciar los archivos reales. Sin suposiciones. Sin placeholders. Solo código real y compatible basado en el código base existente. Y SIEMPRE en ESPAÑOL.**

**🛑 NUNCA MODIFICAR EL BACKEND SIN AUTORIZACIÓN EXPLÍCITA DE DOC LUIS 🛑**