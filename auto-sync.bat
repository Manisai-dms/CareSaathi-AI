@echo off
title CareSaathi-AI Continuous Auto Pull & Push
echo ========================================================
echo  Starting CareSaathi-AI Auto Pull and Push Service
echo ========================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto-sync.ps1"
pause
