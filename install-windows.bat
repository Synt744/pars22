@echo off
cls
echo ===================================================
echo     WebHarvest - Установка для Windows
echo ===================================================
echo.

:: Проверка наличия Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js не найден. Пожалуйста, установите Node.js (v16 или выше).
    echo Инструкции: https://nodejs.org/en/download/
    pause
    exit /b 1
)

:: Вывод версии Node.js
echo Используется Node.js:
node -v
echo.

:: Установка зависимостей
echo Установка зависимостей...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Ошибка при установке зависимостей. Пожалуйста, проверьте подключение к интернету и права доступа.
    pause
    exit /b 1
)

echo ✓ Зависимости установлены успешно

echo.
echo ===================================================
echo     Установка WebHarvest завершена успешно
echo ===================================================
echo.
echo Чтобы запустить WebHarvest, выполните:
echo   start-windows.bat
echo.
echo Для использования командной строки:
echo   webharvest help
echo.

pause