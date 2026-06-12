# =============================================================================
# watch.ps1 - Auto-rebuild dist/styles.css whenever the source files change.
# -----------------------------------------------------------------------------
# Re-runs build.ps1 (which compiles from an ASCII-only temp path) every time
# tokens/theme.css, index.html, styles/page.css or scripts/main.js is saved.
# Refresh the browser after each rebuild to see the change.
#
#   Usage: powershell -ExecutionPolicy Bypass -File scripts/watch.ps1
#          (or: npm run watch:win)   --   stop with Ctrl+C
# =============================================================================

$ErrorActionPreference = "Stop"
$proj  = Split-Path -Parent $PSScriptRoot
$build = Join-Path $PSScriptRoot "build.ps1"
$watched = @(
  (Join-Path $proj "tokens\theme.css"),
  (Join-Path $proj "index.html"),
  (Join-Path $proj "styles\page.css"),
  (Join-Path $proj "scripts\main.js")
)

function Get-Stamp {
  ($watched | Where-Object { Test-Path $_ } | ForEach-Object { (Get-Item $_).LastWriteTimeUtc.Ticks }) -join "-"
}

Write-Host "Building once..."
& powershell -ExecutionPolicy Bypass -File $build
Write-Host "Watching for changes (Ctrl+C to stop)..."

$last = Get-Stamp
while ($true) {
  Start-Sleep -Milliseconds 800
  $now = Get-Stamp
  if ($now -ne $last) {
    $last = $now
    Write-Host ("[{0}] change detected -> rebuilding" -f (Get-Date -Format "HH:mm:ss"))
    try { & powershell -ExecutionPolicy Bypass -File $build } catch { Write-Warning $_ }
  }
}
