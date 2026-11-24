# Sends a fixed "task finished" notification to the BarberGo ntfy topic.
# Usage: powershell -File scripts/notify-done.ps1
# Note: Claude Code sends these automatically via hooks when notify:on is active
# (see docs/dev-notifications.md). Use this script only for manual pings.

& "$PSScriptRoot/notify-custom.ps1" "barbergo: task finished. Please review the result."
exit $LASTEXITCODE
