# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Protocol
- Always address the user as "Doctor Luis"
- Always communicate in Spanish

## Development Commands

### Frontend (React)
- **Start development server**: `cd frontend && npm start` (runs on port 3000)
- **Build for production**: `cd frontend && npm run build`
- **Run tests**: `cd frontend && npm test`
- **Lint JavaScript**: `cd frontend && npm run lint:js`
- **Deploy to GitHub Pages**: `cd frontend && npm run deploy`

### Backend (FastAPI/Python)
- **Start development server**: `cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000`
- **Install dependencies**: `cd backend && pip install -r requirements.txt`

### Docker Development
- **Start all services**: `docker-compose up --build`
- **Stop all services**: `docker-compose down`
- Services:
  - Frontend: http://localhost:3000
  - Backend: http://localhost:8000
  - PostgreSQL Database: localhost:5432

## Architecture Overview

### Backend Structure
- **FastAPI** application with PostgreSQL database
- **Authentication**: JWT-based with role-based access control
- **Database**: SQLAlchemy ORM with models for Staff, Patient, CertificationPeriod, Document
- **API Routes**: Organized by CRUD operations (create, search, update, delete)
- **Roles**: Developer, Administrator, PT/OT/ST/PTA/COTA/STA, Supportive, Support, Agency

### Frontend Structure
- **React 18** with React Router for navigation
- **Role-based routing**: Different components for each user role
- **Authentication**: AuthContext manages user sessions
- **Styling**: SCSS with component-specific stylesheets
- **UI Libraries**: FontAwesome, Chart.js, Framer Motion, GSAP

### Key Components by Role
- **Developer**: Full access with support modal integration
- **Administrator**: Management features including support dashboard
- **Therapists (PT/OT/ST/PTA/COTA/STA)**: Patient care and documentation
- **Support/Agency**: Limited access for specific workflows

### Database Models
- **Staff**: User accounts with role-based permissions
- **Patient**: Healthcare patient records with medical info
- **CertificationPeriod**: Treatment period tracking
- **Document**: File storage and management
- **Visit**: Treatment session records
- **StaffAssignment**: Staff-to-patient assignments

### Patient Management System
- **Patient Information**: Demographics, medical history, insurance
- **Certification Periods**: Treatment authorization tracking
- **Disciplines**: PT/OT/ST service coordination
- **Emergency Contacts**: Contact information management
- **Exercises**: Therapy exercise library with images
- **Documentation**: Notes, evaluations, signatures
- **Scheduling**: Visit planning and tracking

### Authentication & Security
- JWT tokens for session management
- Password hashing with bcrypt
- Role-based route protection
- CORS configured for localhost:3000

### File Storage
- Documents stored in `/app/storage/docs` (Docker volume: `E:/documents_uploaded`)
- Exercise images in `frontend/src/assets/exercises/`

## Development Notes

- Frontend uses HashRouter for GitHub Pages deployment
- Database connection requires environment variables in docker-compose
- SCSS styling follows component-based organization
- Role-based components are duplicated across admin/developer/pt-ot-st folders
- Support system integrated only for Developer role via FloatingSupportButton