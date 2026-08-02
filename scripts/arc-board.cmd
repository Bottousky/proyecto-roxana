@echo off
REM Regenera el tablero del Arco I y lo abre en el navegador.
REM Destino del acceso directo del escritorio. Siempre regenera: el HTML es derivado.

cd /d "%~dp0.."

where node >nul 2>&1
if errorlevel 1 (
  echo No se encontro node en el PATH.
  echo Instalalo o abri el tablero a mano:
  echo   docs\agent-runs\ohmdal-arc1-serial-v1\board.html
  pause
  exit /b 1
)

node scripts\arc-board.mjs --open
if errorlevel 1 (
  echo.
  echo Fallo la generacion del tablero. Revisa el mensaje de arriba.
  pause
  exit /b 1
)
