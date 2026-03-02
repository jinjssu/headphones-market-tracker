#!/bin/bash
# Headphones Market Tracker - Scheduler Stopper

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.scheduler.pid"

if [ ! -f "$PID_FILE" ]; then
    echo "ℹ️  Scheduler not running (no PID file)"
    exit 0
fi

PID=$(cat "$PID_FILE")

if ps -p "$PID" > /dev/null 2>&1; then
    echo "🛑 Stopping scheduler (PID: $PID)..."
    kill "$PID"
    sleep 2
    
    # Force kill if still running
    if ps -p "$PID" > /dev/null 2>&1; then
        kill -9 "$PID"
    fi
    
    rm -f "$PID_FILE"
    echo "✅ Scheduler stopped"
else
    echo "ℹ️  Scheduler not running (stale PID file)"
    rm -f "$PID_FILE"
fi
