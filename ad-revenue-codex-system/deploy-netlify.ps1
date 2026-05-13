$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "AI Biz Note を生成しています..."
node scripts\build-site.mjs

$netlify = Get-Command netlify -ErrorAction SilentlyContinue
if (-not $netlify) {
  Write-Host ""
  Write-Host "Netlify CLI が見つかりません。"
  Write-Host "初回だけ以下をPowerShellで実行してください。"
  Write-Host "npm install -g netlify-cli"
  Write-Host "netlify login"
  Read-Host "Enterキーで閉じます"
  exit 1
}

Write-Host "Netlifyへ本番公開します..."
netlify deploy --prod --dir=public --site=boisterous-kulfi-a047ae

Write-Host ""
Write-Host "公開が完了しました。"
Write-Host "https://aibiz-note.jp"
Read-Host "Enterキーで閉じます"
