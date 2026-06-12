# =============================================================================
# build.ps1 - Compile Tailwind/DaisyUI from an ASCII-only path (Windows)
# -----------------------------------------------------------------------------
# This project's path contains non-ASCII characters, which makes the native
# @tailwindcss/oxide scanner crash with an access violation (0xC0000005).
# This script mirrors the build inputs to an ASCII-only temp folder, compiles
# there, then copies dist/styles.css back.
#
#   Usage: powershell -ExecutionPolicy Bypass -File scripts/build.ps1
# =============================================================================

$ErrorActionPreference = "Stop"
$proj = Split-Path -Parent $PSScriptRoot
$work = Join-Path $env:TEMP "cc-build-ascii"

New-Item -ItemType Directory -Force -Path $work | Out-Null

# 1) Mirror the files Tailwind scans + the compile input (no node_modules / dist)
foreach ($item in @("tokens", "styles", "scripts", "package.json", "package-lock.json")) {
  $srcPath = Join-Path $proj $item
  if (Test-Path $srcPath -PathType Container) {
    robocopy $srcPath (Join-Path $work $item) /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
  } elseif (Test-Path $srcPath) {
    Copy-Item $srcPath (Join-Path $work $item) -Force
  }
}
# All top-level *.html pages (so Tailwind scans every page's classes)
Get-ChildItem -Path $proj -Filter *.html -File | ForEach-Object {
  Copy-Item $_.FullName (Join-Path $work $_.Name) -Force
}

# 2) Copy node_modules only when missing (reused on later builds for speed)
if (-not (Test-Path (Join-Path $work "node_modules\@tailwindcss\cli\dist\index.mjs"))) {
  Write-Host "First run: copying node_modules (slow)..."
  robocopy (Join-Path $proj "node_modules") (Join-Path $work "node_modules") /MIR /NFL /NDL /NJH /NJS /NP | Out-Null
}

# 3) Compile
Push-Location $work
try {
  node ".\node_modules\@tailwindcss\cli\dist\index.mjs" --input ./tokens/theme.css --output ./dist/styles.css --minify
} finally {
  Pop-Location
}

# 4) Copy the result back into the project
New-Item -ItemType Directory -Force -Path (Join-Path $proj "dist") | Out-Null
Copy-Item (Join-Path $work "dist\styles.css") (Join-Path $proj "dist\styles.css") -Force
$size = (Get-Item (Join-Path $proj "dist\styles.css")).Length
Write-Host "OK: dist/styles.css updated ($size bytes)"
