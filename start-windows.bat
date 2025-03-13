@echo off
cls
echo ===================================================
echo     WebHarvest - Запуск приложения
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

:: Запуск приложения
echo Запуск WebHarvest...
echo Веб-интерфейс будет доступен по адресу: http://localhost:5000
echo.
echo Чтобы остановить приложение, закройте это окно или нажмите Ctrl+C
echo.

start http://localhost:5000
npm run dev

:: Если скрипт завершился с ошибкой
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Ошибка при запуске WebHarvest. Пожалуйста, убедитесь, что:
    echo 1. Порт 5000 не занят другим приложением
    echo 2. Все зависимости установлены (запустите install-windows.bat)
    echo.
    echo Для получения помощи обратитесь к документации (USER_GUIDE.md)
    pause
    exit /b 1
)