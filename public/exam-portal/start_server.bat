@echo off
cd /d "%~dp0"
set HTTP_PROXY=
set HTTPS_PROXY=
set ALL_PROXY=
set http_proxy=
set https_proxy=
set all_proxy=
set PAPERBASE_USE_SYSTEM_PROXY=0
echo Starting Paperbase server without system proxy...
echo Open http://127.0.0.1:3000 after the server starts.
echo.
python server.py
