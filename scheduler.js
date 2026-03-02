#!/usr/bin/env node
/**
 * Headphones Market Tracker - Background Scheduler
 * Runs continuously and triggers daily updates at 2:00 AM UTC+8
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const LOG_FILE = path.join('/tmp', 'market-scheduler.log');
const STATE_FILE = path.join(SCRIPT_DIR, '.scheduler-state.json');

function log(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.log(line.trim());
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    return { lastRun: null, runs: [] };
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function runUpdate() {
  return new Promise((resolve, reject) => {
    log('🔄 Starting daily update...');
    
    exec(`cd "${SCRIPT_DIR}" && ./daily-update.sh`, (error, stdout, stderr) => {
      if (error) {
        log(`❌ Update failed: ${error.message}`);
        reject(error);
      } else {
        log(`✅ Update completed successfully`);
        log(stdout);
        if (stderr) log(`stderr: ${stderr}`);
        resolve({ stdout, stderr });
      }
    });
  });
}

function getNextRunTime() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(2, 0, 0, 0); // 2:00 AM UTC+8
  
  // If it's already past 2 AM today, schedule for tomorrow
  if (now.getHours() >= 2) {
    return tomorrow;
  }
  
  // Otherwise, schedule for today at 2 AM
  const today = new Date(now);
  today.setHours(2, 0, 0, 0);
  return today > now ? today : tomorrow;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  log('🚀 Market Data Scheduler starting...');
  log(`📁 Working directory: ${SCRIPT_DIR}`);
  
  const state = loadState();
  log(`📊 Last run: ${state.lastRun || 'never'}`);
  
  // Check if we missed a run
  const now = new Date();
  const today2AM = new Date(now);
  today2AM.setHours(2, 0, 0, 0);
  
  if (!state.lastRun || new Date(state.lastRun) < today2AM) {
    const hoursSince2AM = (now - today2AM) / (1000 * 60 * 60);
    if (hoursSince2AM < 12) {
      log('⏰ Running catch-up update (missed 2 AM run)...');
      try {
        await runUpdate();
        state.lastRun = new Date().toISOString();
        state.runs.push({ date: state.lastRun, status: 'success' });
        saveState(state);
      } catch (e) {
        state.runs.push({ date: new Date().toISOString(), status: 'failed' });
        saveState(state);
      }
    }
  }
  
  // Main loop
  while (true) {
    const nextRun = getNextRunTime();
    const waitMs = nextRun - new Date();
    
    log(`⏳ Next run: ${nextRun.toISOString()} (in ${Math.round(waitMs / 1000 / 60)} minutes)`);
    
    // Check every minute if it's time to run
    while (new Date() < nextRun) {
      await sleep(60000); // Check every minute
      
      // Handle graceful shutdown
      if (process.env.SCHEDULER_STOP === 'true') {
        log('🛑 Scheduler stopping...');
        process.exit(0);
      }
    }
    
    // Run the update
    try {
      await runUpdate();
      state.lastRun = new Date().toISOString();
      state.runs.push({ date: state.lastRun, status: 'success' });
      
      // Keep only last 30 runs
      if (state.runs.length > 30) {
        state.runs = state.runs.slice(-30);
      }
      
      saveState(state);
    } catch (e) {
      state.runs.push({ date: new Date().toISOString(), status: 'failed' });
      saveState(state);
    }
  }
}

// Handle process signals
process.on('SIGINT', () => {
  log('📴 Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('📴 Received SIGTERM, shutting down...');
  process.exit(0);
});

// Start the scheduler
main().catch(err => {
  log(`❌ Fatal error: ${err.message}`);
  process.exit(1);
});
