@echo off
setlocal
cd /d "%~dp0\.."

echo AI Biz Note の公開用ZIPを作成します...
node ad-revenue-codex-system\scripts\build-site.mjs
if errorlevel 1 (
  echo 生成に失敗しました。
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Path 'ad-revenue-codex-system\public\*' -DestinationPath 'aibiz-note-netlify-upload.zip' -Force"
if errorlevel 1 (
  echo ZIP作成に失敗しました。
  pause
  exit /b 1
)

echo 完了しました。
echo 作成ファイル:
echo %cd%\aibiz-note-netlify-upload.zip
pause
