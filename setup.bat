@echo off
chcp 65001 >nul
title PDF翻译服务 - 首次配置

echo ================================================
echo PDF 翻译服务 - 首次配置
echo ================================================
echo.
echo 这个程序会帮你配置 PDF 翻译服务
echo.

if not exist "config" mkdir config

set CONFIG_FILE=config\config.json

if exist "%CONFIG_FILE%" (
    echo 发现已有配置文件，是否要重新配置？
    echo 1. 是，重新配置
    echo 2. 否，保持现有配置
    set /p choice="请选择 (1/2): "
    if not "!choice!"=="1" goto :skip_config
)

echo.
echo ================================================
echo 请输入配置信息
echo ================================================
echo.

set /p api_key="请输入你的千问 API Key: "
if "%api_key%"=="" (
    echo 错误：API Key 不能为空
    pause
    exit /b 1
)

set /p port="请输入服务端口 (直接回车使用默认 7862): "
if "%port%"=="" set port=7862

echo.
echo 正在保存配置...

(
echo {
echo   "api_key": "%api_key%",
echo   "base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
echo   "model": "qwen-mt-turbo",
echo   "port": %port%
echo }
) > "%CONFIG_FILE%"

echo 配置已保存到 %CONFIG_FILE%
echo.

:skip_config

echo ================================================
echo 正在检查 Python 环境...
echo ================================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo 错误：未找到 Python
    echo 请先安装 Python 3.8 或更高版本
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

python --version

echo.
echo ================================================
echo 配置完成！
echo ================================================
echo.
echo 现在你可以：
echo 1. 双击 start.bat 启动服务
echo 2. 或者运行: python start_server.py
echo.

pause
