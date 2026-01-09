@echo off
echo アプリを起動しています...
cd /d "c:\Users\janpi\OneDrive\デスクトップ\新しいフォルダー"

:: ブラウザを先に開くコマンド（3秒待ってから）
timeout /t 3 >nul
start http://localhost:5173

:: サーバーを起動
npm run dev
