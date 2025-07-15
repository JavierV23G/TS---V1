#!/usr/bin/env python3
"""
Ejemplo de uso de la nueva estructura de contact_info como Dict[str, str]

Este archivo muestra cómo usar la nueva estructura de contactos
en formato diccionario para crear y actualizar pacientes.
"""

# Ejemplo de estructura de contactos válida
example_contact_info = {
    "primary": "305-123-4567",
    "secondary": "305-987-6543",
    "emergency_1": "305-555-1234",
    "emergency_2": "305-444-5678",
    "work": "305-333-9999",
    "home": "305-222-8888"
}

# Ejemplo de payload para crear un paciente
example_patient_payload = {
    "full_name": "Juan Pérez",
    "birthday": "1980-05-15",
    "gender": "Male",
    "address": "123 Main St, Miami, FL 33101",
    "contact_info": example_contact_info,
    "insurance": "Medicare",
    "physician": "Dr. Smith",
    "agency_id": 1,
    "nursing_diagnosis": "Post-surgical recovery",
    "urgency_level": "normal",
    "prior_level_of_function": "Independent",
    "homebound_status": "Yes",
    "weight_bearing_status": "Full weight bearing",
    "referral_reason": "Physical therapy needed",
    "weight": "180 lbs",
    "height": "5'10\"",
    "past_medical_history": "Knee surgery",
    "clinical_grouping": "Orthopedic",
    "required_disciplines": "PT",
    "is_active": True,
    "initial_cert_start_date": "2024-01-15"
}

# Ejemplo de actualización de contactos
example_contact_update = {
    "contact_info": {
        "primary": "305-123-4567",
        "secondary": "305-987-6543", 
        "emergency_1": "305-555-1234",
        "work": "305-333-9999"
    }
}

print("Ejemplo de estructura de contactos:")
print("===================================")
print("Contactos completos:")
for key, value in example_contact_info.items():
    print(f"  {key}: {value}")

print("\nEjemplo de payload para crear paciente:")
print("======================================")
print(f"Nombre: {example_patient_payload['full_name']}")
print(f"Contactos: {example_patient_payload['contact_info']}")

print("\nEjemplo de actualización de contactos:")
print("=====================================")
print(f"Nuevos contactos: {example_contact_update['contact_info']}")

print("\nNotas importantes:")
print("=================")
print("1. contact_info ahora es un diccionario donde las claves son identificadores únicos")
print("2. Los valores son strings que representan números de teléfono") 
print("3. Puedes usar cualquier identificador como clave: 'primary', 'work', 'emergency_1', etc.")
print("4. La estructura es flexible y permite múltiples contactos con identificadores descriptivos")