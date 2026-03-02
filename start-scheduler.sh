#!/bin/bash
# Headphones Market Tracker - Scheduler Launcher
# Starts the background scheduler process

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.scheduler.pid"
LOG_FILE="/tmp/market-scheduler.log"

# Check if already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "✅ Scheduler already running (PID: $PID)"
        exit 0
    else
        echo "🧹 Removing stale PID file"
        rm -f "$PID_FILE"
    fi
fi

echo "🚀 Starting Market Data Scheduler..."
echo "📁 Working directory: $SCRIPT_DIR"

# Start scheduler in background
cd "$SCRIPT_DIR"
nohup node scheduler.js > "$LOG_FILE" 2>&1 &
PID=$!

# Save PID
echo "$PID" > "$PID_FILE"

echo "✅ Scheduler started (PID: $PID)"
echo "📄 Log file: $LOG_FILE"
echo ""
echo "To stop: ./stop-scheduler.sh"
echo "To check status: ./scheduler-status.sh"
