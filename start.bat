@echo off
chcp 65001 >nul
title PDF翻译服务

echo ================================================
echo PDF 翻译服务
echo ================================================
echo.

python start_server.py

pause
