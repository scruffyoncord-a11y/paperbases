$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $PSScriptRoot

$proxyVars = @(
  "HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY",
  "http_proxy", "https_proxy", "all_proxy"
)

foreach ($name in $proxyVars) {
  Remove-Item -Path ("Env:\" + $name) -ErrorAction SilentlyContinue
}

$env:PAPERBASE_USE_SYSTEM_PROXY = "0"

Write-Host ""
Write-Host "Starting Paperbase server without system proxy..." -ForegroundColor Cyan
Write-Host "Open http://127.0.0.1:3000 after the server starts." -ForegroundColor Cyan
Write-Host ""

python server.py
