#!/bin/bash
# Headphones Market Tracker - Scheduler Status

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.scheduler.pid"
LOG_FILE="/tmp/market-scheduler.log"
STATE_FILE="$SCRIPT_DIR/.scheduler-state.json"

echo "📊 Market Data Scheduler Status"
echo "================================"
echo ""

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "✅ Status: RUNNING"
        echo "🔢 PID: $PID"
    else
        echo "❌ Status: NOT RUNNING (stale PID file)"
    fi
else
    echo "❌ Status: NOT RUNNING"
fi

echo ""
echo "📁 Directory: $SCRIPT_DIR"
echo "📄 Log file: $LOG_FILE"

if [ -f "$STATE_FILE" ]; then
    echo ""
    echo "📊 Last Run Info:"
    cat "$STATE_FILE" | head -5
fi

if [ -f "$LOG_FILE" ]; then
    echo ""
    echo "📋 Recent Logs:"
    tail -10 "$LOG_FILE"
fi
