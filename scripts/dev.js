/**
 * MediaForge Unified Dev Server Launcher
 * Launches both FastAPI Backend and Vite Frontend concurrently with unified logs.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

// Detect Python executable in virtual environment
const winVenvPython = path.join(backendDir, 'venv', 'Scripts', 'python.exe');
const unixVenvPython = path.join(backendDir, 'venv', 'bin', 'python');

let pythonBin = 'python';
if (fs.existsSync(winVenvPython)) {
  pythonBin = winVenvPython;
} else if (fs.existsSync(unixVenvPython)) {
  pythonBin = unixVenvPython;
}

console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log('\x1b[36m%s\x1b[0m', '   MediaForge Unified Development Environment     ');
console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log(`[Init] Using Python: ${pythonBin}`);
console.log(`[Init] Backend Dir:   ${backendDir}`);
console.log(`[Init] Frontend Dir:  ${frontendDir}`);
console.log('\x1b[36m%s\x1b[0m', '--------------------------------------------------');

// 1. Launch FastAPI Backend
const backendProcess = spawn(
  pythonBin,
  ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'],
  {
    cwd: backendDir,
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
  }
);

backendProcess.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) {
      console.log(`\x1b[35m[Backend 8000]\x1b[0m ${line}`);
    }
  });
});

backendProcess.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.includes('ERROR') || trimmed.includes('Traceback') || trimmed.includes('Exception')) {
      console.error(`\x1b[31m[Backend Err]\x1b[0m ${trimmed}`);
    } else if (trimmed.includes('WARNING') || trimmed.includes('WARN')) {
      console.warn(`\x1b[33m[Backend Warn]\x1b[0m ${trimmed}`);
    } else {
      // Uvicorn writes standard INFO and lifecycle logs to stderr by default
      console.log(`\x1b[35m[Backend 8000]\x1b[0m ${trimmed}`);
    }
  });
backendProcess.on('exit', (code, signal) => {
  if (code !== 0 && code !== null) {
    console.warn(`\x1b[33m[Backend 8000] Process exited (code: ${code}, signal: ${signal})\x1b[0m`);
  }
});

// 2. Launch Vite Frontend
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const frontendProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: frontendDir,
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
});

frontendProcess.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) {
      console.log(`\x1b[32m[Frontend 5173]\x1b[0m ${line}`);
    }
  });
});

frontendProcess.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) {
      console.error(`\x1b[33m[Frontend Warn]\x1b[0m ${line}`);
    }
  });
});

// Clean shutdown handler
function shutdown() {
  console.log('\n\x1b[36m[MediaForge] Stopping all servers...\x1b[0m');
  try {
    if (process.platform === 'win32') {
      if (backendProcess.pid) spawn('taskkill', ['/pid', backendProcess.pid, '/f', '/t']);
      if (frontendProcess.pid) spawn('taskkill', ['/pid', frontendProcess.pid, '/f', '/t']);
    } else {
      backendProcess.kill();
      frontendProcess.kill();
    }
  } catch (err) {
    // Ignore shutdown kill errors
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
