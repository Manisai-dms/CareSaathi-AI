@echo off
echo ========================================================
echo Starting CareSaathi AI Healthcare Navigation Platform
echo ========================================================
echo 1. Ensuring dependencies...
pip install -r backend\requirements.txt
echo 2. Launching FastAPI Server on http://127.0.0.1:8000 ...
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
pause
