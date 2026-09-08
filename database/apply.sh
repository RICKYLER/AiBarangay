#!/usr/bin/env bash
# =============================================================
# apply.sh — install the AI Barangay Problem Mapper DB
#
# Local fresh install:
#   ./database/apply.sh                              # database "aibarangay"
#   DB_NAME=mydb ./database/apply.sh                 # custom local database
#
# Supabase / any remote Postgres:
#   DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" \
#     ./database/apply.sh
#
# Options:
#   SKIP_DEMO=1   skip seeds/05_demo.sql (production)
#   SKIP_POLICY=1 skip policies/rls.sql (e.g. when the connection role
#                 cannot CREATE ROLE — grants can be applied by hand)
#
# Requires: PostgreSQL 15+ client (psql), server with PostGIS 3+
# =============================================================
set -euo pipefail

cd "$(dirname "$0")"

run_sql() { # run_sql <file> <label>
  echo "  $2: $1"
  if [ -n "${DATABASE_URL:-}" ]; then
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$1"
  else
    psql -d "${DB_NAME:-aibarangay}" -v ON_ERROR_STOP=1 -f "$1"
  fi
}

if [ -n "${DATABASE_URL:-}" ]; then
  echo "► Applying to remote database via DATABASE_URL"
  CREATED=0
else
  DB_NAME="${DB_NAME:-aibarangay}"
  echo "► Creating database ${DB_NAME} (continues if it already exists)"
  psql -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE \"${DB_NAME}\"" 2>/dev/null \
    || echo "  … database already exists, continuing"
  CREATED=1
fi

echo "► Schema"
for f in schema/*.sql; do run_sql "$f" schema; done

echo "► Functions"
for f in functions/*.sql; do run_sql "$f" functions; done

echo "► Triggers"
for f in triggers/*.sql; do run_sql "$f" triggers; done

echo "► Views"
for f in views/*.sql; do run_sql "$f" views; done

echo "► Indexes"
for f in indexes/*.sql; do run_sql "$f" indexes; done

if [ "${SKIP_POLICY:-0}" != "1" ]; then
  echo "► Policies (roles app_user / bi_reader + RLS + grants)"
  if [ "$CREATED" = "1" ]; then
    # Local install: create login roles on the cluster first.
    psql -d postgres -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
        CREATE ROLE app_user LOGIN PASSWORD 'change-me-app';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'bi_reader') THEN
        CREATE ROLE bi_reader LOGIN PASSWORD 'change-me-bi';
    END IF;
END
$$;
SQL
  fi
  run_sql policies/rls.sql policies
else
  echo "  … skipped (SKIP_POLICY=1)"
fi

echo "► Migrations"
for f in migrations/*.sql; do run_sql "$f" migrations; done

echo "► Seeds"
for f in seeds/*.sql; do
  if [ "${SKIP_DEMO:-0}" = "1" ] && [ "$f" = "seeds/05_demo.sql" ]; then
    echo "  … skipping demo data (SKIP_DEMO=1)"
    continue
  fi
  run_sql "$f" seeds
done

if [ -n "${DATABASE_URL:-}" ]; then
  echo "✓ Done (remote database)."
else
  echo "✓ Done. Connect with: psql -d ${DB_NAME}"
fi
