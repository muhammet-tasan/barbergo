# Sends a fixed "task finished" notification to your ntfy topic.
# Usage: powershell -File scripts/notify-done.ps1

$Topic = "barbergo-muhammet"
$Message = "barbergo: Cursor task finished. Please review the result."
$Uri = "https://ntfy.sh/$Topic"

try {
    Invoke-RestMethod -Uri $Uri -Method Post -Body $Message -ContentType "text/plain; charset=utf-8"
    Write-Host "Notification sent to topic: $Topic"
}
catch {
    Write-Error "Failed to send notification: $_"
    exit 1
}
