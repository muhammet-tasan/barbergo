# Sends a custom notification message to the BarberGo ntfy topic.
# Usage: powershell -File scripts/notify-custom.ps1 "Your message here"
#
# Optional (used by the Claude Code hooks in .claude/hooks/notify-ping.ps1):
#   -Title       short ASCII title shown above the message (default: none)
#   -TimeoutSec  HTTP timeout in seconds (default: 100 = PowerShell default)
#   -Quiet       no console output; never fails (always exit 0)
#
# Topic: env BARBERGO_NTFY_TOPIC, default "barbergo-muhammet".

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Message,
    [string]$Title = "",
    [int]$TimeoutSec = 100,
    [switch]$Quiet
)

$Topic = if ($env:BARBERGO_NTFY_TOPIC) { $env:BARBERGO_NTFY_TOPIC } else { "barbergo-muhammet" }
$Uri = "https://ntfy.sh/$Topic"

$Headers = @{}
if ($Title) { $Headers["Title"] = $Title }

try {
    # UTF-8 bytes so umlauts survive Windows PowerShell 5.1.
    $Body = [System.Text.Encoding]::UTF8.GetBytes($Message)
    Invoke-RestMethod -Uri $Uri -Method Post -Body $Body -Headers $Headers `
        -ContentType "text/plain; charset=utf-8" -TimeoutSec $TimeoutSec | Out-Null
    if (-not $Quiet) {
        Write-Host "Notification sent to topic: $Topic"
        Write-Host "Message: $Message"
    }
}
catch {
    if ($Quiet) { exit 0 }
    Write-Error "Failed to send notification: $_"
    exit 1
}
