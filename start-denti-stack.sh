#!/usr/bin/env bash
set -euo pipefail

# Base directory is the parent of denti-code-u2 (the monorepo root)
GI_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

MODE="${1:-dev}" # dev | start

APPOINTMENTS_DIR="$GI_DIR/denti-code-appointments"
PROVIDER_DIR="$GI_DIR/denti-code-clinic-provider-api"
AUTH_DIR="$GI_DIR/denti-code-auth-srv"
PATIENTS_DIR="$GI_DIR/denti-code-patients-api"
U2_DIR="$GI_DIR/denti-code-u2"
GATEWAY_DIR="$GI_DIR/denti-code-api-gateway"

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

free_port() {
  local port="$1"
  if command -v fuser >/dev/null 2>&1; then
    fuser -k "${port}/tcp" >/dev/null 2>&1 || true
  fi
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
  dev)
    # Ensure old/stale local processes from previous runs don't block service ports.
    free_port 3000
    free_port 3001
    free_port 3002
    free_port 3003
    free_port 3004
    free_port 3005

    start_with_env "appointments" "$APPOINTMENTS_DIR" "npm run dev" "$LOG_DIR/appointments.log"
    start_with_env "provider" "$PROVIDER_DIR" "npm run start:dev" "$LOG_DIR/provider.log"
    start_with_env "auth" "$AUTH_DIR" "npm run start:dev" "$LOG_DIR/auth.log"
    # Run only the API server in dev. `npm run dev` also starts the RabbitMQ consumer
    # which can fail/retry endlessly when RabbitMQ is not running and destabilize local setup.
    start_with_env "patients" "$PATIENTS_DIR" "npm run dev:server" "$LOG_DIR/patients.log"

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
    free_port 3000
    free_port 3001
    free_port 3002
    free_port 3003
    free_port 3004
    free_port 3005

    start_with_env "appointments" "$APPOINTMENTS_DIR" "npm run build && npm run start" "$LOG_DIR/appointments.log"
    start_with_env "provider" "$PROVIDER_DIR" "npm run build && npm run start:prod" "$LOG_DIR/provider.log"
    start_with_env "auth" "$AUTH_DIR" "npm run build && npm run start:prod" "$LOG_DIR/auth.log"
    start_with_env "patients" "$PATIENTS_DIR" "npm run start" "$LOG_DIR/patients.log"

    start_with_env "ui2" "$U2_DIR" "npm run build && PORT=3005 npm run start" "$LOG_DIR/ui2.log"

    echo "Starting gateway..."
    (
      cd "$GATEWAY_DIR"
      ./start-gateway.sh start
    ) >"$LOG_DIR/gateway.log" 2>&1 &
    PIDS+=("$!")
    ;;
  *)
    echo "Usage: $0 [dev|start]" >&2
    exit 2
    ;;
esac

echo "Started processes (PIDs): ${PIDS[*]}"
echo "Logs: $LOG_DIR"
echo "Tip: tail -f $LOG_DIR/gateway.log"

# Keep script alive so Ctrl+C stops everything.
while true; do
  sleep 5
done

