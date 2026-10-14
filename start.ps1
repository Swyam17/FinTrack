Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "          FinTrack: Multi-Device Finance System           " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Ensure Node is in Path
$nodeDir = "C:\Users\Lenovo\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64"
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    $env:PATH = "$nodeDir;$env:PATH"
}

# Find Wi-Fi / LAN IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -match "Wi-Fi|Ethernet" -and $_.IPAddress -notlike "169.254*" } | Select-Object -First 1).IPAddress
if (-not $ip) { $ip = "192.168.1.9" }

Write-Host "[Access URLs]" -ForegroundColor Yellow
Write-Host "▶ This Computer:             http://localhost:3000" -ForegroundColor Green
Write-Host "▶ Other Devices (Phones/PCs): http://${ip}:3000" -ForegroundColor Green
Write-Host "▶ Production Port:           http://${ip}:5001" -ForegroundColor Green
Write-Host ""
Write-Host "Opening browser..." -ForegroundColor Gray
Start-Process "http://localhost:3000"

Write-Host "Starting FinTrack servers..." -ForegroundColor Cyan
npm run dev
