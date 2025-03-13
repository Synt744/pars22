#!/bin/bash

# Запуск WebHarvest для Linux
echo "==================================================="
echo "    WebHarvest - Запуск приложения"
echo "==================================================="
echo ""

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js не найден. Пожалуйста, установите Node.js (v16 или выше)."
    echo "Инструкции: https://nodejs.org/en/download/"
    exit 1
fi

# Запуск приложения
echo "Запуск WebHarvest..."
echo "Веб-интерфейс будет доступен по адресу: http://localhost:5000"
echo ""
echo "Чтобы остановить приложение, нажмите Ctrl+C"
echo ""

npm run dev

# Если скрипт завершился с ошибкой
if [ $? -ne 0 ]; then
    echo ""
    echo "Ошибка при запуске WebHarvest. Пожалуйста, убедитесь, что:"
    echo "1. Порт 5000 не занят другим приложением"
    echo "2. Все зависимости установлены (запустите install-linux.sh)"
    echo ""
    echo "Для получения помощи обратитесь к документации (USER_GUIDE.md)"
    exit 1
fi