#!/bin/bash

echo "======================================================"
echo "WebHarvest - Сборка пакетов для Windows и Linux"
echo "======================================================"
echo

# Делаем скрипт исполняемым
chmod +x ./build-packages.sh

# Проверяем наличие Node.js
if ! [ -x "$(command -v node)" ]; then
  echo "[ERROR] Node.js не установлен." >&2
  echo
  exit 1
fi

echo "[INFO] Установка модуля archiver для создания архивов..."
npm install archiver --no-save

echo "[INFO] Сборка проекта..."
npm run build

echo "[INFO] Создание пакетов..."
node build-package.js

echo
echo "======================================================"
echo "Сборка завершена!"
echo "Готовые пакеты находятся в папке dist/"
echo "======================================================"
echo