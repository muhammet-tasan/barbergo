# BarberGo - notification on/off toggle (UserPromptSubmit hook).
#
# Port of the TASAN Media Trips toggle.sh (PowerShell, no Python dependency).
#   - prompt starting with "/goal"  -> notifications ON
#   - "notify:on"  in the prompt    -> notifications ON
#   - "notify:off" in the prompt    -> notifications OFF
#   (if both appear, the LAST one wins)
#
# State is per Claude Code session: .claude/notify-state/<session_id>
# Never blocks, never changes the prompt, always exits 0.

$ErrorActionPreference = 'SilentlyContinue'

$raw = [Console]::In.ReadToEnd()
try { $data = $raw | ConvertFrom-Json } catch { exit 0 }
if (-not $data -or -not $data.session_id) { exit 0 }

$sessionId = [string]$data.session_id
$prompt = [string]$data.prompt

$stateDir = Join-Path $PSScriptRoot '..\notify-state'
$stateFile = Join-Path $stateDir $sessionId

$lastOn = $prompt.LastIndexOf('notify:on', [StringComparison]::OrdinalIgnoreCase)
$lastOff = $prompt.LastIndexOf('notify:off', [StringComparison]::OrdinalIgnoreCase)
$isGoal = $prompt.TrimStart().StartsWith('/goal', [StringComparison]::OrdinalIgnoreCase)

$turnOn = ($isGoal -and $lastOff -lt 0) -or ($lastOn -ge 0 -and $lastOn -gt $lastOff)
$turnOff = ($lastOff -ge 0 -and $lastOff -gt $lastOn) -or ($isGoal -and $lastOff -gt $lastOn)

if ($turnOn) {
    New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
    New-Item -ItemType File -Force -Path $stateFile | Out-Null
    Write-Output '{"systemMessage": "BarberGo: Benachrichtigungen AN (nur diese Sitzung)."}'
}
elseif ($turnOff) {
    Remove-Item -Force -Path $stateFile, "$stateFile.last"
    Write-Output '{"systemMessage": "BarberGo: Benachrichtigungen AUS."}'
}
exit 0
