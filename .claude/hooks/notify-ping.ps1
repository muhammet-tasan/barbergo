# BarberGo - ntfy push hook (Notification / Stop events).
#
# Port of the TASAN Media Trips ntfy-ping.sh. Only pings if notifications are
# ON for THIS session (.claude/notify-state/<session_id>, see notify-toggle.ps1).
# Never blocks Claude: short timeout, failures swallowed, always exit 0.
# Sends a short FIXED message only - never prompt, file or tool content.
#
# Usage (wired in .claude/settings.json):
#   notify-ping.ps1 notify    # Notification event: Claude waits for input/approval
#   notify-ping.ps1 complete  # Stop event: a turn ended
#
# Duplicate guard: the same kind is not sent twice within 10 seconds
# (state: .claude/notify-state/<session_id>.last).

param([string]$Kind = 'notify')

$ErrorActionPreference = 'SilentlyContinue'

$raw = [Console]::In.ReadToEnd()
try { $data = $raw | ConvertFrom-Json } catch { exit 0 }
if (-not $data -or -not $data.session_id) { exit 0 }

$sessionId = [string]$data.session_id
$stateDir = Join-Path $PSScriptRoot '..\notify-state'
$stateFile = Join-Path $stateDir $sessionId
if (-not (Test-Path $stateFile)) { exit 0 }   # notifications OFF for this session

# Duplicate guard (same kind within 10 s).
$lastFile = "$stateFile.last"
$now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
if (Test-Path $lastFile) {
    $parts = (Get-Content -Raw $lastFile).Trim() -split ' '
    if ($parts.Count -eq 2 -and $parts[0] -eq $Kind -and ($now - [int64]$parts[1]) -lt 10) { exit 0 }
}
Set-Content -Path $lastFile -Value "$Kind $now" -Encoding ascii

$message = if ($Kind -eq 'complete') { 'Auftrag beendet' } else { 'Claude braucht deine Eingabe/Freigabe' }

$notify = Join-Path $PSScriptRoot '..\..\scripts\notify-custom.ps1'
& $notify -Message $message -Title 'BarberGo' -TimeoutSec 5 -Quiet
exit 0
