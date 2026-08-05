@echo off
REM Consola de ejecucion del Arco I. Destino del acceso directo del escritorio.
REM Levanta el servidor local y abre el navegador. La ventana se queda abierta a proposito:
REM cerrarla apaga la consola. Sin servidor los botones que escriben no funcionan.

title Consola Arco I - Ohmdal  (cerrar esta ventana la apaga)
cd /d "%~dp0.."

where node >nul 2>&1
if errorlevel 1 (
  echo No se encontro node en el PATH.
  echo Instalalo, o abri el tablero estatico a mano ^(solo lectura^):
  echo   docs\agent-runs\ohmdal-arc1-serial-v1\board.html
  echo.
  pause
  exit /b 1
)

node scripts\arc-board.mjs --serve --open
if errorlevel 1 (
  echo.
  echo Fallo la consola. Revisa el mensaje de arriba.
  pause
  exit /b 1
)
