param(
  [string]$BlenderExe = $env:ROXANA_BLENDER_EXE
)

$ErrorActionPreference = 'Stop'
$workspace = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$builder = Join-Path $PSScriptRoot 'build_school.py'

if (-not $BlenderExe) {
  $command = Get-Command blender -ErrorAction SilentlyContinue
  if ($command) {
    $BlenderExe = $command.Source
  } else {
    $portable = Join-Path $env:LOCALAPPDATA 'Programs\Blender Portable\blender-4.5.12-windows-x64\blender.exe'
    if (Test-Path -LiteralPath $portable) { $BlenderExe = $portable }
  }
}

if (-not $BlenderExe -or -not (Test-Path -LiteralPath $BlenderExe)) {
  throw 'No se encontró Blender. Define ROXANA_BLENDER_EXE con la ruta a blender.exe.'
}

Write-Host "Construyendo Instituto Roxana con $BlenderExe"
& $BlenderExe --background --factory-startup --python $builder
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Assets listos en $(Join-Path $workspace 'assets\school3d')"
