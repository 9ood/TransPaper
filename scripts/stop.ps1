$ErrorActionPreference = "Stop"

$Targets = Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq "python.exe" -and
    $_.CommandLine -like "*pdf2zh_next.main*" -and
    $_.CommandLine -like "*--server-port 7862*"
}

if (-not $Targets) {
    Write-Output "TransPaper is not running"
    return
}

$Targets | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force
}

Write-Output "TransPaper stopped"
