#!/bin/bash

echo "⏳ Verificando entorno..."

echo "POSTGRES_USER: $POSTGRES_USER"
echo "POSTGRES_DB: $POSTGRES_DB"
echo "Esperar DB: ${WAIT_FOR_DB}"

if [ "$WAIT_FOR_DB" = "true" ]; then
  echo "⏳ Esperando que PostgreSQL esté listo..."
  export PGPASSWORD="$POSTGRES_PASSWORD"

  until psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' > /dev/null 2>&1; do
    echo "❗ PostgreSQL no está listo aún..."
    sleep 2
  done

  echo "✅ PostgreSQL está listo. Iniciando backend..."
else
  echo "⚠ Skipping DB wait (WAIT_FOR_DB=$WAIT_FOR_DB)"
fi

exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload