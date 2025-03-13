@echo off
echo ===================================================
echo     WebHarvest - Создание пакетов для распространения
echo ===================================================
echo.

if "%1"=="" (
    echo Создание пакетов для всех платформ...
    node build-package.js all
) else (
    echo Создание пакета для %1...
    node build-package.js %1
)

echo.
echo Пакеты созданы в директории dist/
echo.
pause