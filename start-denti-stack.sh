#!/usr/bin/env bash
set -euo pipefail

# Base directory is the parent of denti-code-u2 (the monorepo root)
GI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

MODE="${1:-dev}" # dev | start | migrate | seed

APPOINTMENTS_DIR="$GI_DIR/denti-code-appointments"
CLINIC_PROVIDER_DIR="$GI_DIR/denti-code-clinic-provider-api"
AUTH_DIR="$GI_DIR/denti-code-auth-srv"
PATIENTS_DIR="$GI_DIR/denti-code-patients-api"
BROKER_DIR="$GI_DIR/denti-code-broker-srv"
U2_DIR="$GI_DIR/denti-code-u2"
GATEWAY_DIR="$GI_DIR/denti-code-api-gateway"

RABBIT_CONTAINER_NAME="${RABBIT_CONTAINER_NAME:-denti-rabbitmq}"

LOG_DIR="$GI_DIR/.logs"
mkdir -p "$LOG_DIR"

PIDS=()
cleanup() {
  if [[ "${#PIDS[@]}" -gt 0 ]]; then
    echo "Stopping ${#PIDS[@]} process(es)..."
    kill "${PIDS[@]}" >/dev/null 2>&1 || true
  fi
}
trap cleanup INT TERM

# Gateway + APIs + UI + broker HTTP. (RabbitMQ uses 5672/15672 — not freed here.)
STACK_PORTS=(3000 3001 3002 3003 3004 3005 5000)

free_port() {
  local port="$1"
  local pids

  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" >/dev/null 2>&1 || true
  fi

  if command -v lsof >/dev/null 2>&1; then
    pids=$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)
    if [[ -n "${pids}" ]]; then
      # shellcheck disable=SC2086
      kill ${pids} >/dev/null 2>&1 || true
      sleep 0.15
      # shellcheck disable=SC2086
      kill -9 ${pids} >/dev/null 2>&1 || true
    fi
  fi
}

free_stack_ports() {
  local port
  for port in "${STACK_PORTS[@]}"; do
    free_port "$port"
  done
}

# RabbitMQ (AMQP). Auth publishes via HTTP to broker-srv; broker-srv and patients-consumer use pika/amqplib.
start_rabbitmq_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "WARN: Docker not found. Install Docker or run RabbitMQ on localhost:5672 yourself."
    echo "      Without RabbitMQ, set SKIP_BROKER=1 to start patients API only (no consumer)."
    return 1
  fi

  if docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "$RABBIT_CONTAINER_NAME"; then
    echo "RabbitMQ container '$RABBIT_CONTAINER_NAME' already running (AMQP :5672)."
    return 0
  fi

  if docker ps -a --format '{{.Names}}' 2>/dev/null | grep -qx "$RABBIT_CONTAINER_NAME"; then
    echo "Starting RabbitMQ container '$RABBIT_CONTAINER_NAME'..."
    docker start "$RABBIT_CONTAINER_NAME"
    return 0
  fi

  echo "Creating RabbitMQ container '$RABBIT_CONTAINER_NAME' (AMQP :5672, management UI :15672, guest/guest)..."
  set +e
  docker run -d \
    --hostname denti-rabbit \
    --name "$RABBIT_CONTAINER_NAME" \
    -p 5672:5672 \
    -p 15672:15672 \
    -e RABBITMQ_DEFAULT_USER=guest \
    -e RABBITMQ_DEFAULT_PASS=guest \
    rabbitmq:3-management-alpine
  local dr=$?
  set -e
  if [[ "$dr" -ne 0 ]]; then
    echo "WARN: docker run failed (is Docker running?). Continuing without guaranteed RabbitMQ."
    return 1
  fi
  return 0
}

# HTTP publish API → RabbitMQ (auth uses BROKER_PUBLISH_URL, e.g. http://localhost:5000/api/publish)
start_broker_http() {
  if [[ ! -d "$BROKER_DIR" ]]; then
    echo "ERROR: Broker service directory missing: $BROKER_DIR" >&2
    exit 2
  fi

  local py=python3
  if [[ -x "$BROKER_DIR/venv/bin/python" ]]; then
    py="$BROKER_DIR/venv/bin/python"
  elif [[ -x "$BROKER_DIR/.venv/bin/python" ]]; then
    py="$BROKER_DIR/.venv/bin/python"
  fi

  echo "Starting broker HTTP (Flask publish API on :5000)..."
  start_with_env "broker (HTTP → RabbitMQ)" "$BROKER_DIR" "$py run.py" "$LOG_DIR/broker.log"
}

run_prisma_migrate() {
  local title="$1"
  local dir="$2"
  if [[ ! -d "$dir" ]]; then
    echo "ERROR: Missing directory for $title: $dir" >&2
    exit 2
  fi
  echo "==> prisma migrate deploy — $title"
  (cd "$dir" && npx prisma migrate deploy)
}

run_prisma_seed() {
  local title="$1"
  local dir="$2"
  if [[ ! -d "$dir" ]]; then
    echo "ERROR: Missing directory for $title: $dir" >&2
    exit 2
  fi
  echo "==> prisma db seed — $title"
  (cd "$dir" && npx prisma db seed)
}

start_with_env() {
  local name="$1"
  local dir="$2"
  local cmd="$3"
  local log="$4"

  if [[ ! -d "$dir" ]]; then
    echo "ERROR: Missing directory for $name: $dir" >&2
    exit 2
  fi

  echo "Starting $name..."
  (
    cd "$dir"
    if [[ -f ".env" ]]; then
      set -a
      # shellcheck disable=SC1091
      source ".env"
      set +a
    fi
    # shellcheck disable=SC2086
    eval "$cmd"
  ) >"$log" 2>&1 &

  PIDS+=("$!")
}

case "$MODE" in
  migrate)
    echo "Applying Prisma migrations (each service has its own SQLite DB)."
    echo "Run this once per machine (or after pulling new migrations) before dev|start."
    run_prisma_migrate "auth" "$AUTH_DIR"
    run_prisma_migrate "patients" "$PATIENTS_DIR"
    run_prisma_migrate "clinic-provider (doctors, procedures, treatment facilities)" "$CLINIC_PROVIDER_DIR"
    run_prisma_migrate "appointments" "$APPOINTMENTS_DIR"
    echo ""
    echo "Migrations finished. Load sample data with: $0 seed"
    exit 0
    ;;
  seed)
    echo "Seeding databases (order matches cross-service demo data)."
    run_prisma_seed "auth" "$AUTH_DIR"
    run_prisma_seed "clinic-provider" "$CLINIC_PROVIDER_DIR"
    run_prisma_seed "patients" "$PATIENTS_DIR"
    run_prisma_seed "appointments" "$APPOINTMENTS_DIR"
    echo ""
    echo "Seeding finished."
    exit 0
    ;;
  dev)
    echo "Freeing stack ports (${STACK_PORTS[*]})..."
    free_stack_ports

    if [[ "${SKIP_BROKER:-}" == "1" ]]; then
      echo "SKIP_BROKER=1 — not starting RabbitMQ / broker HTTP; patients runs API only (no AMQP consumer)."
    else
      start_rabbitmq_docker || true
      echo "Waiting for RabbitMQ to accept connections..."
      sleep 4
      start_broker_http
      sleep 1
    fi

    start_with_env "appointments" "$APPOINTMENTS_DIR" "npm run dev" "$LOG_DIR/appointments.log"
    start_with_env "clinic-provider" "$CLINIC_PROVIDER_DIR" "npm run start:dev" "$LOG_DIR/clinic-provider.log"
    start_with_env "auth" "$AUTH_DIR" "npm run start:dev" "$LOG_DIR/auth.log"

    if [[ "${SKIP_BROKER:-}" == "1" ]]; then
      start_with_env "patients" "$PATIENTS_DIR" "npm run dev:server" "$LOG_DIR/patients.log"
    else
      # API + AMQP consumer (user.registered → create patient). Needs RabbitMQ on localhost:5672.
      start_with_env "patients (API + consumer)" "$PATIENTS_DIR" "npm run dev" "$LOG_DIR/patients.log"
    fi

    # UI2 (Next.js) runs on an internal port; the gateway proxies it.
    start_with_env "ui2" "$U2_DIR" "PORT=3005 npm run dev" "$LOG_DIR/ui2.log"

    # Gateway already knows how to load its own .env (via start-gateway.sh)
    echo "Starting gateway..."
    (
      cd "$GATEWAY_DIR"
      ./start-gateway.sh dev
    ) >"$LOG_DIR/gateway.log" 2>&1 &
    PIDS+=("$!")
    ;;
  start)
    echo "Freeing stack ports (${STACK_PORTS[*]})..."
    free_stack_ports

    if [[ "${SKIP_BROKER:-}" == "1" ]]; then
      echo "SKIP_BROKER=1 — not starting RabbitMQ / broker HTTP."
    else
      start_rabbitmq_docker || true
      echo "Waiting for RabbitMQ to accept connections..."
      sleep 4
      start_broker_http
      sleep 1
    fi

    start_with_env "appointments" "$APPOINTMENTS_DIR" "npm run build && npm run start" "$LOG_DIR/appointments.log"
    start_with_env "clinic-provider" "$CLINIC_PROVIDER_DIR" "npm run build && npm run start:prod" "$LOG_DIR/clinic-provider.log"
    start_with_env "auth" "$AUTH_DIR" "npm run build && npm run start:prod" "$LOG_DIR/auth.log"
    start_with_env "patients" "$PATIENTS_DIR" "npm run start" "$LOG_DIR/patients.log"

    if [[ "${SKIP_BROKER:-}" != "1" ]]; then
      start_with_env "patients-consumer (AMQP)" "$PATIENTS_DIR" "node consumer.js" "$LOG_DIR/patients-consumer.log"
    fi

    start_with_env "ui2" "$U2_DIR" "npm run build && PORT=3005 npm run start" "$LOG_DIR/ui2.log"

    echo "Starting gateway..."
    (
      cd "$GATEWAY_DIR"
      ./start-gateway.sh start
    ) >"$LOG_DIR/gateway.log" 2>&1 &
    PIDS+=("$!")
    ;;
  *)
    echo "Usage: $0 [dev|start|migrate|seed]" >&2
    echo "" >&2
    echo "  dev      Free ports, start RabbitMQ (Docker) + broker HTTP + APIs + gateway." >&2
    echo "  start    Same with production-style builds; patients API + separate AMQP consumer." >&2
    echo "  migrate  prisma migrate deploy (auth, patients, clinic-provider, appointments)." >&2
    echo "  seed     prisma db seed (same order)." >&2
    echo "" >&2
    echo "  SKIP_BROKER=1 $0 dev   Skip RabbitMQ + Flask broker; patients API only (no consumer)." >&2
    echo "  Broker: denti-code-broker-srv (Flask :5000 → RabbitMQ). Auth: BROKER_PUBLISH_URL in auth .env." >&2
    exit 2
    ;;
esac

echo "Started processes (PIDs): ${PIDS[*]}"
echo "Logs: $LOG_DIR"
echo "Tip: tail -f $LOG_DIR/gateway.log  |  broker: tail -f $LOG_DIR/broker.log  |  clinic-provider: tail -f $LOG_DIR/clinic-provider.log"
if [[ "${SKIP_BROKER:-}" != "1" ]]; then
  echo "RabbitMQ: amqp://localhost:5672  |  Management UI: http://localhost:15672 (guest / guest)"
  echo "Publish URL (auth): http://localhost:5000/api/publish"
fi

# Keep script alive so Ctrl+C stops everything.
while true; do
  sleep 5
done
