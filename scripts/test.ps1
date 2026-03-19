$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$ConfigFile = Join-Path $RepoRoot "config\config.json"
$VenvPython = Join-Path $RepoRoot ".venv\Scripts\python.exe"
$PythonExe = if (Test-Path $VenvPython) { $VenvPython } else { "python" }

if (-not (Test-Path $ConfigFile)) {
    Write-Error "Config is missing. Please run setup.bat first."
}

$Config = Get-Content $ConfigFile -Raw | ConvertFrom-Json

if (-not $Config.api_key -or $Config.api_key -like "*API*" -or $Config.api_key -like "*api*") {
    Write-Error "API Key is missing. Please run setup.bat first."
}

if (-not $Config.port) {
    Write-Error "Port is missing in config\\config.json."
}

& $PythonExe -c "import sys; print(f'Python OK: {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')"
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Output "Config check passed"
