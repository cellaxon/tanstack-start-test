# Kill processes using specific ports
# Usage: .\kill-ports.ps1

param(
    [int[]]$Ports = @(3000, 4000, 4001)
)

Write-Host "Checking and killing processes on ports: $($Ports -join ', ')" -ForegroundColor Yellow
Write-Host ""

foreach ($port in $Ports) {
    Write-Host "Checking port $port..." -ForegroundColor Cyan

    # Find process using the port
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

    if ($connection) {
        $processId = $connection.OwningProcess | Select-Object -Unique

        foreach ($procId in $processId) {
            if ($procId -ne 0) {
                try {
                    $process = Get-Process -Id $procId -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "  Found process: $($process.ProcessName) (PID: $procId)" -ForegroundColor Red
                        Stop-Process -Id $procId -Force
                        Write-Host "  ✓ Killed process $procId on port $port" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "  × Failed to kill process ${procId}: $_" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "  ✓ Port $port is free" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green