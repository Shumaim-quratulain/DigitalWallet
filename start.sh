#!/bin/bash
#
# Digital Wallet — start everything with one command.
#
#   ./start.sh              backend + frontend
#   ./start.sh --with-ml    also start the fraud-detection API (needs pip deps)
#
# Press Ctrl+C to shut everything down again.
#
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT/.logs"
mkdir -p "$LOG_DIR"

BE_LOG="$LOG_DIR/backend.log"
FE_LOG="$LOG_DIR/frontend.log"
ML_LOG="$LOG_DIR/ml-api.log"

WITH_ML=0
for arg in "$@"; do
  case "$arg" in
    --with-ml | -m) WITH_ML=1 ;;
    -h | --help)
      sed -n '2,10p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown option: $arg (try --help)" >&2
      exit 1
      ;;
  esac
done

# --- pretty output ----------------------------------------------------------
if [ -t 1 ]; then
  B=$'\033[1m'; DIM=$'\033[2m'; G=$'\033[32m'; Y=$'\033[33m'
  R=$'\033[31m'; C=$'\033[36m'; N=$'\033[0m'
else
  B=''; DIM=''; G=''; Y=''; R=''; C=''; N=''
fi
info() { printf '%s\n' "  $*"; }
ok()   { printf '%s\n' "  ${G}✓${N} $*"; }
warn() { printf '%s\n' "  ${Y}!${N} $*"; }
err()  { printf '%s\n' "  ${R}✗${N} $*"; }
step() { printf '\n%s\n' "${B}$*${N}"; }

# Checks for a listener on any address (Vite binds to IPv6 ::1 on macOS).
port_open() { lsof -nP -iTCP:"$1" -sTCP:LISTEN -t >/dev/null 2>&1; }

# Wait until a TCP port accepts connections. $1=port $2=label $3=timeout seconds
wait_for_port() {
  local port="$1" label="$2" limit="${3:-120}" waited=0
  printf '  %s' "${DIM}waiting for $label"
  while ! port_open "$port"; do
    if [ "$waited" -ge "$limit" ]; then
      printf '%s\n' "${N}"
      err "$label did not start within ${limit}s"
      return 1
    fi
    printf '.'
    sleep 1
    waited=$((waited + 1))
  done
  printf '%s\n' "${N}"
  ok "$label is up on port $port"
}

free_port() {
  local pids
  pids="$(lsof -ti :"$1" 2>/dev/null)"
  if [ -n "$pids" ]; then
    kill -9 $pids 2>/dev/null
  fi
}

BE_PID=""; FE_PID=""; ML_PID=""; STARTED_INFRA=""; CLEANED=0

cleanup() {
  [ "$CLEANED" -eq 1 ] && return
  CLEANED=1
  printf '\n%s\n' "${B}Shutting down…${N}"
  for pid in "$ML_PID" "$FE_PID" "$BE_PID"; do
    [ -n "$pid" ] && kill "$pid" 2>/dev/null
  done
  # Gradle / npm spawn children, so make sure the ports really are free.
  [ -n "$FE_PID" ] && free_port 5173
  [ -n "$BE_PID" ] && free_port 8080
  [ -n "$ML_PID" ] && free_port 5010
  # Leave MySQL and RabbitMQ running — they are shared brew services.
  ok "backend and frontend stopped"
}
trap cleanup INT TERM EXIT

printf '\n%s\n' "${C}${B}  ╭──────────────────────────────────────────────╮${N}"
printf '%s\n'   "${C}${B}  │        Digital Wallet — local startup        │${N}"
printf '%s\n\n' "${C}${B}  ╰──────────────────────────────────────────────╯${N}"

# ---------------------------------------------------------------------------
# 1. Infrastructure (MySQL + RabbitMQ)
# ---------------------------------------------------------------------------
step "1/4  Database and message broker"

for svc in mysql rabbitmq; do
  if brew services list 2>/dev/null | grep -qE "^${svc}\s+started"; then
    ok "$svc already running"
  else
    info "starting ${svc} ..."
    brew services start "$svc" >/dev/null 2>&1 || warn "could not start $svc via brew"
    STARTED_INFRA="$STARTED_INFRA $svc"
  fi
done

wait_for_port 3306 "MySQL" 60    || { err "Is MySQL installed?  brew install mysql";    exit 1; }
wait_for_port 5672 "RabbitMQ" 60 || warn "RabbitMQ not reachable — transfers will use the synchronous fallback"

# ---------------------------------------------------------------------------
# 2. Backend (Spring Boot)
# ---------------------------------------------------------------------------
step "2/4  Spring Boot backend"

if port_open 8080; then
  ok "already running on 8080 (reusing)"
else
  JAVA21="$(/usr/libexec/java_home -v 21 2>/dev/null)"
  if [ -z "$JAVA21" ]; then
    err "JDK 21 not found. Install it with:  brew install --cask temurin@21"
    exit 1
  fi
  info "using JDK 21 → $JAVA21"

  : >"$BE_LOG"
  (
    cd "$ROOT/wallet-backend" || exit 1
    JAVA_HOME="$JAVA21" ./gradlew :app:bootRun --console=plain
  ) >"$BE_LOG" 2>&1 &
  BE_PID=$!

  wait_for_port 8080 "backend" 240 || {
    err "backend failed to start — last lines of $BE_LOG:"
    tail -n 20 "$BE_LOG" | sed 's/^/     /'
    exit 1
  }
fi

# ---------------------------------------------------------------------------
# 3. Frontend (Vite)
# ---------------------------------------------------------------------------
step "3/4  React frontend"

if port_open 5173; then
  ok "already running on 5173 (reusing)"
else
  if [ ! -x "$ROOT/wallet-frontend/node_modules/.bin/vite" ]; then
    info "installing frontend dependencies (first run only)…"
    (cd "$ROOT/wallet-frontend" && npm install) >"$FE_LOG" 2>&1
  fi

  : >"$FE_LOG"
  (
    cd "$ROOT/wallet-frontend" || exit 1
    exec ./node_modules/.bin/vite
  ) >"$FE_LOG" 2>&1 &
  FE_PID=$!

  wait_for_port 5173 "frontend" 90 || {
    err "frontend failed to start — last lines of $FE_LOG:"
    tail -n 20 "$FE_LOG" | sed 's/^/     /'
    exit 1
  }
fi

# ---------------------------------------------------------------------------
# 4. Optional fraud-detection API
# ---------------------------------------------------------------------------
step "4/4  Fraud-detection API (optional)"

if [ "$WITH_ML" -eq 1 ]; then
  if port_open 5010; then
    ok "already running on 5010 (reusing)"
  elif ! "$ROOT/.venv/bin/python" -c "import flask" >/dev/null 2>&1; then
    warn "Python deps missing. Run once:"
    info "  cd wallet-ml-api && python3 -m venv ../.venv && ../.venv/bin/pip install -r requirements.txt"
    warn "skipping — the Fraud Detection page will show an error until it runs"
  else
    : >"$ML_LOG"
    (
      cd "$ROOT/wallet-ml-api" || exit 1
      exec "$ROOT/.venv/bin/python" run.py
    ) >"$ML_LOG" 2>&1 &
    ML_PID=$!
    if wait_for_port 5010 "fraud API" 90; then :; else
      warn "fraud API did not start — see $ML_LOG"
    fi
  fi
else
  info "skipped (add --with-ml to include it)"
fi

# ---------------------------------------------------------------------------
# Ready
# ---------------------------------------------------------------------------
printf '\n%s\n' "${G}${B}  ╭──────────────────────────────────────────────╮${N}"
printf '%s\n'   "${G}${B}  │              Everything is running           │${N}"
printf '%s\n'   "${G}${B}  ╰──────────────────────────────────────────────╯${N}"
printf '\n'
printf '  %s\n' "Open →  ${C}${B}http://localhost:5173${N}"
printf '\n'
printf '  %s\n' "Backend API    http://localhost:8080"
printf '  %s\n' "MySQL          127.0.0.1:3306   (user: root)"
printf '  %s\n' "RabbitMQ       http://localhost:15672   (guest / guest)"
if [ -n "$ML_PID" ] || port_open 5010; then
  printf '  %s\n' "Fraud API      http://localhost:5010"
fi
printf '\n'
printf '  %s\n' "${DIM}New accounts start with a ₹5000 balance, so you can"
printf '  %s\n' "send money between two accounts straight away.${N}"
printf '\n'
printf '  %s\n' "Logs: $LOG_DIR/"
printf '  %s\n\n' "Press ${B}Ctrl+C${N} to stop the backend and frontend."

# Follow the logs so the terminal shows what is happening.
TAIL_TARGETS=()
[ -n "$BE_PID" ] && TAIL_TARGETS+=("$BE_LOG")
[ -n "$FE_PID" ] && TAIL_TARGETS+=("$FE_LOG")
[ -n "$ML_PID" ] && TAIL_TARGETS+=("$ML_LOG")

if [ ${#TAIL_TARGETS[@]} -gt 0 ]; then
  tail -f "${TAIL_TARGETS[@]}"
else
  info "Nothing started by this script (services were already running)."
  info "Press Ctrl+C to exit."
  while :; do sleep 5; done
fi
