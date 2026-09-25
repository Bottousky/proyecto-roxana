[CmdletBinding()]
param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'
$ohmdalRoot = Split-Path -Parent $PSScriptRoot
$ohmdalUrl = 'http://127.0.0.1:4180/'
$ohmdalNode = Get-Command node -ErrorAction SilentlyContinue
if (-not $ohmdalNode) {
  Write-Host 'Ohmdal necesita Node.js para abrirse. Instalá Node.js 22.12 o superior y volvé a abrir este archivo.'
  Read-Host 'Enter para cerrar'
  exit 1
}
Set-Location -LiteralPath $ohmdalRoot
if (-not (Test-Path -LiteralPath (Join-Path $ohmdalRoot 'dist/index.html'))) {
  if (-not (Test-Path -LiteralPath (Join-Path $ohmdalRoot 'node_modules'))) { & npm.cmd ci; if ($LASTEXITCODE -ne 0) { throw 'No se pudieron preparar las dependencias.' } }
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo preparar el juego.' }
}
$ohmdalRunning = $false
try {
  $ohmdalResponse = Invoke-WebRequest -Uri $ohmdalUrl -UseBasicParsing -TimeoutSec 2
  $ohmdalRunning = $ohmdalResponse.Headers['X-Ohmdal'] -eq 'La Luz'
} catch { }
if (-not $ohmdalRunning) {
  $ohmdalServer = Join-Path $ohmdalRoot 'scripts/server.mjs'
  Start-Process -FilePath $ohmdalNode.Source -ArgumentList @('"' + $ohmdalServer + '"') -WorkingDirectory $ohmdalRoot -WindowStyle Hidden
  for ($ohmdalAttempt = 0; $ohmdalAttempt -lt 25; $ohmdalAttempt++) {
    try {
      $ohmdalResponse = Invoke-WebRequest -Uri $ohmdalUrl -UseBasicParsing -TimeoutSec 1
      if ($ohmdalResponse.Headers['X-Ohmdal'] -eq 'La Luz') { $ohmdalRunning = $true; break }
    } catch { }
    Start-Sleep -Milliseconds 200
  }
}
if (-not $ohmdalRunning) {
  Write-Host 'No se pudo abrir Ohmdal en el puerto 4180. Cerrá otra instancia que lo esté usando y volvé a intentar.'
  Read-Host 'Enter para cerrar'
  exit 1
}
if (-not $NoBrowser) { Start-Process $ohmdalUrl }
