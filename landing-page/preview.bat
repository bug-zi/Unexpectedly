@echo off
echo ================================================
echo 万万没想到 - Landing Page 本地预览
echo ================================================
echo.
echo 正在启动本地服务器...
echo 服务器地址: http://localhost:8000
echo.
echo 按 Ctrl+C 停止服务器
echo ================================================
echo.

cd /d "%~dp0"
python -m http.server 8000

pause
