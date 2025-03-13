#!/bin/bash

# Установщик WebHarvest для Linux
echo "==================================================="
echo "    WebHarvest - Установка для Linux"
echo "==================================================="
echo ""

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js не найден. Пожалуйста, установите Node.js (v16 или выше)."
    echo "Инструкции: https://nodejs.org/en/download/"
    exit 1
fi

# Проверка версии Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "Требуется Node.js версии 16 или выше. Текущая версия: $(node -v)"
    echo "Пожалуйста, обновите Node.js: https://nodejs.org/en/download/"
    exit 1
fi

echo "✓ Node.js $(node -v) найден"

# Установка зависимостей
echo ""
echo "Установка зависимостей..."
npm install

if [ $? -ne 0 ]; then
    echo "Ошибка при установке зависимостей. Пожалуйста, проверьте подключение к интернету и права доступа."
    exit 1
fi

echo "✓ Зависимости установлены успешно"

# Создание запускающего скрипта
echo "#!/bin/bash" > webharvest
echo "node run.js \$@" >> webharvest
chmod +x webharvest

echo ""
echo "✓ Создан скрипт командной строки 'webharvest'"
echo ""
echo "==================================================="
echo "    Установка WebHarvest завершена успешно"
echo "==================================================="
echo ""
echo "Чтобы запустить WebHarvest, выполните:"
echo "  ./start-linux.sh"
echo ""
echo "Для использования командной строки:"
echo "  ./webharvest help"
echo ""