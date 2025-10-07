
@echo off
start cmd /k "cd backend && npm install && npm run dev"
timeout /t 5
start cmd /k "cd frontend && npm install && npm start"
pause
