@echo off
cd /d "%~dp0"
title InfraQuest - Reinos do Ceu
echo.
echo  INFRAQUEST - REINOS DO CEU
echo  Abra http://127.0.0.1:4180 no navegador.
echo  Mantenha esta janela aberta enquanto joga.
echo.
where node >nul 2>nul
if errorlevel 1 (
 echo Instale Node.js 24 ou superior pelo site oficial https://nodejs.org
 pause
 exit /b 1
)
node --env-file-if-exists=.env server.mjs
pause
