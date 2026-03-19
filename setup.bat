@echo off
chcp 65001 >nul
setlocal
title TransPaper - First Setup

echo ================================================
echo TransPaper - First Setup
echo ================================================
echo.
echo This helper will prepare the local config file.
echo.

if not exist "config" mkdir config
set CONFIG_FILE=config\config.json

if exist "%CONFIG_FILE%" (
    echo Existing config found.
    set /p reset_choice="Rebuild config? (y/N): "
    if /I not "%reset_choice%"=="Y" goto skip_config
)

echo.
echo Pick translation engine:
echo 1. Google  ^(recommended, no API key^)
echo 2. Bing    ^(backup, no API key^)
echo 3. QwenMT  ^(needs API key^)
set /p engine_choice="Choose 1/2/3 [default 1]: "
if "%engine_choice%"=="" set engine_choice=1

set ENGINE=google
if "%engine_choice%"=="2" set ENGINE=bing
if "%engine_choice%"=="3" set ENGINE=qwenmt

set PORT=
set /p PORT="Port [default 7862]: "
if "%PORT%"=="" set PORT=7862

set API_KEY=
set BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
set MODEL=qwen-mt-turbo

if /I "%ENGINE%"=="qwenmt" (
    set /p API_KEY="QwenMT API key: "
    if "%API_KEY%"=="" (
        echo API key cannot be empty for QwenMT.
        pause
        exit /b 1
    )
)

echo.
echo Saving config...
(
echo {
echo   "engine": "%ENGINE%",
echo   "api_key": "%API_KEY%",
echo   "base_url": "%BASE_URL%",
echo   "model": "%MODEL%",
echo   "port": %PORT%
echo }
) > "%CONFIG_FILE%"

echo Config saved to %CONFIG_FILE%
echo.

:skip_config
echo ================================================
echo Checking Python...
echo ================================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo Python was not found.
    echo Please install Python 3.8 or newer first:
    echo https://www.python.org/downloads/
    pause
    exit /b 1
)

python --version
echo.
echo Setup finished.
echo You can now start the service with start.bat
echo or run python start_server.py
echo.
pause
