# Sends a custom notification message to your ntfy topic.
# Usage: powershell -File scripts/notify-custom.ps1 "Your message here"

param(
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$Message
)

$Topic = "barbergo-muhammet"
$Uri = "https://ntfy.sh/$Topic"

try {
    Invoke-RestMethod -Uri $Uri -Method Post -Body $Message -ContentType "text/plain; charset=utf-8"
    Write-Host "Notification sent to topic: $Topic"
    Write-Host "Message: $Message"
}
catch {
    Write-Error "Failed to send notification: $_"
    exit 1
}
