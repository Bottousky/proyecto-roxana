param(
  [string]$BlenderExe = $env:ROXANA_BLENDER_EXE
)

$ErrorActionPreference = 'Stop'
$workspace = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$blend = Join-Path $workspace 'assets\school3d\instituto-roxana.blend'
$script = Join-Path $PSScriptRoot 'render_school_validation.py'

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

& $BlenderExe $blend --background --python $script
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

