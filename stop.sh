#!/bin/bash
#
# Digital Wallet — stop the app servers.
#
#   ./stop.sh            stop backend + frontend + fraud API
#   ./stop.sh --all      also stop MySQL and RabbitMQ
#
set -u

WITH_INFRA=0
for arg in "$@"; do
  case "$arg" in
    --all | -a) WITH_INFRA=1 ;;
    -h | --help)
      sed -n '2,8p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown option: $arg (try --help)" >&2
      exit 1
      ;;
  esac
done

stop_port() {
  local port="$1" label="$2" pids
  pids="$(lsof -ti :"$port" 2>/dev/null)"
  if [ -z "$pids" ]; then
    echo "  -  $label not running"
    return
  fi
  kill $pids 2>/dev/null
  sleep 1
  pids="$(lsof -ti :"$port" 2>/dev/null)"
  [ -n "$pids" ] && kill -9 $pids 2>/dev/null
  echo "  ✓  $label stopped (port $port)"
}

echo ""
echo "Stopping Digital Wallet"
stop_port 5010 "fraud API"
stop_port 5173 "frontend"
stop_port 8080 "backend"

if [ "$WITH_INFRA" -eq 1 ]; then
  for svc in rabbitmq mysql; do
    if brew services list 2>/dev/null | grep -qE "^${svc}\s+started"; then
      brew services stop "$svc" >/dev/null 2>&1 && echo "  ✓  $svc stopped"
    else
      echo "  -  $svc not running"
    fi
  done
fi

echo ""
