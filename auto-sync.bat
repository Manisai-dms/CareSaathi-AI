@echo off
title CareSaathi-AI Auto Pull and Push Sync
echo Starting CareSaathi-AI Git Auto-Sync...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0auto-sync.ps1"
pause
