@echo off
setlocal
cd /d "%~dp0"

echo AI Biz Note を生成しています...
node scripts\build-site.mjs
if errorlevel 1 (
  echo 生成に失敗しました。
  pause
  exit /b 1
)

where netlify >nul 2>nul
if errorlevel 1 (
  echo Netlify CLI が見つかりません。
  echo 初回だけ次を実行してください。
  echo npm install -g netlify-cli
  echo netlify login
  pause
  exit /b 1
)

echo Netlifyへ本番公開します...
netlify deploy --prod --dir=public --site=boisterous-kulfi-a047ae
if errorlevel 1 (
  echo 公開に失敗しました。Netlifyログイン状態やサイトIDを確認してください。
  pause
  exit /b 1
)

echo 公開が完了しました。
echo https://aibiz-note.jp
pause
