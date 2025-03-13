@echo off
echo ======================================================
echo WebHarvest - Сборка пакетов для Windows и Linux
echo ======================================================
echo.

REM Проверяем наличие Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js не установлен.
    echo.
    pause
    exit /b 1
)

echo [INFO] Установка модуля archiver для создания архивов...
call npm install archiver --no-save

echo [INFO] Сборка проекта...
call npm run build

echo [INFO] Создание пакетов...
call node build-package.js

echo.
echo ======================================================
echo Сборка завершена! 
echo Готовые пакеты находятся в папке dist/
echo ======================================================
echo.
pause