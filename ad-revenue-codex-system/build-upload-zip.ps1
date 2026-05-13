$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Split-Path -Parent $scriptDir
Set-Location $repoRoot

Write-Host "AI Biz Note の公開用ZIPを作成します..."
node ad-revenue-codex-system\scripts\build-site.mjs

$zipPath = Join-Path $repoRoot "aibiz-note-netlify-upload.zip"
Compress-Archive -Path "ad-revenue-codex-system\public\*" -DestinationPath $zipPath -Force

Write-Host ""
Write-Host "完了しました。"
Write-Host $zipPath
Read-Host "Enterキーで閉じます"
