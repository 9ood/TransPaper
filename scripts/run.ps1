$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ConfigFile = Join-Path $RepoRoot "config\config.json"
$VenvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"
$PythonExe = if (Test-Path $VenvPython) { $VenvPython } else { "python" }

if (-not (Test-Path $ConfigFile)) {
    Write-Error "Config is missing. Please run setup.bat first."
}

New-Item -ItemType Directory -Force -Path (Join-Path $RepoRoot "logs") | Out-Null

Push-Location $RepoRoot
try {
    & $PythonExe "start_server.py"
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
} finally {
    Pop-Location
}
