#!/bin/sh
set -e

echo "Reading DB password from /run/secrets/db_password..."

if [ -f /run/secrets/db_password ]; then
  DB_PASSWORD=$(tr -d '\r\n' < /run/secrets/db_password)
  echo "DB_PASSWORD length (trimmed): ${#DB_PASSWORD}"

  export DATABASE_URL="postgresql://vapeuruser:${DB_PASSWORD}@db:5432/vapeurdb?schema=public"
  echo "DATABASE_URL = $DATABASE_URL"
else
  echo "No /run/secrets/db_password found, falling back to local DATABASE_URL"
fi

echo "Waiting for PostgreSQL to be ready and syncing schema..."

# Retry `npx prisma db push` until it succeeds (DB ready), or timeout after ~60s
MAX_RETRIES=30
RETRY_COUNT=0
until npx prisma db push >/dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT+1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "Timed out waiting for database after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "Database not ready yet - retrying ($RETRY_COUNT/$MAX_RETRIES)..."
  sleep 2
done
echo "Schema synced."

echo "Starting Node app..."
# Replace shell with node so PID 1 is node and logs/errors are visible
exec node app.js
