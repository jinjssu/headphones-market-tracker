# Headphones Market Tracker - Auto-start scheduler
# Add this to ~/.bashrc to start scheduler on login

MARKET_SCHEDULER_DIR="$HOME/.openclaw/workspace/headphones-market-tracker"

# Auto-start scheduler if not running
if [ -d "$MARKET_SCHEDULER_DIR" ]; then
    if [ ! -f "$MARKET_SCHEDULER_DIR/.scheduler.pid" ] || ! ps -p $(cat "$MARKET_SCHEDULER_DIR/.scheduler.pid" 2>/dev/null) > /dev/null 2>&1; then
        echo "🔄 Starting Market Data Scheduler..."
        cd "$MARKET_SCHEDULER_DIR" && ./start-scheduler.sh > /dev/null 2>&1 &
    fi
fi
