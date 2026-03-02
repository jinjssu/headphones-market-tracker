#!/bin/bash
# Headphones Market Tracker - Daily Data Update Script
# Runs daily to update market data and push to GitHub

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔄 Starting daily market data update..."
echo "📅 Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Run the data generator
echo "📊 Generating new market data..."
node update-data.js

# Check if data changed
if git diff --quiet market-data.json; then
    echo "ℹ️  No significant changes detected"
else
    echo "📝 Data updated, committing changes..."
    git config user.name "OpenClaw Auto-Updater"
    git config user.email "auto-updater@headphones-tracker.local"
    git add market-data.json
    git commit -m "📊 Auto-update market data $(date '+%Y-%m-%d')"
    
    echo "🚀 Pushing to GitHub..."
    git push origin main
    
    echo ""
    echo "✅ Daily update completed successfully!"
fi
