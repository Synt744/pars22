# Руководство пользователя WebHarvest

## Оглавление
1. [Введение](#введение)
2. [Установка](#установка)
3. [Начало работы](#начало-работы)
4. [Создание скрапера](#создание-скрапера)
5. [Настройка полей данных](#настройка-полей-данных)
6. [Запуск скрапинга](#запуск-скрапинга)
7. [Работа с результатами](#работа-с-результатами)
8. [Планирование задач](#планирование-задач)
9. [Настройки](#настройки)
10. [Устранение неполадок](#устранение-неполадок)

## Введение

WebHarvest - это приложение для извлечения данных с веб-сайтов с удобным пользовательским интерфейсом. Оно позволяет создавать конфигурации скраперов для различных сайтов, управлять процессом сбора данных и экспортировать результаты.

## Установка

### Windows
1. Распакуйте архив в удобное место
2. Запустите `install-windows.bat`
3. Дождитесь завершения установки
4. Запустите `start-windows.bat`, чтобы начать работу с приложением

### Linux
1. Распакуйте архив в удобное место
2. Откройте терминал в директории с распакованными файлами
3. Выполните команду: `chmod +x install-linux.sh && ./install-linux.sh`
4. После установки запустите приложение: `chmod +x start-linux.sh && ./start-linux.sh`

## Начало работы

После запуска приложения откройте браузер и перейдите по адресу:
```
http://localhost:5000
```

Вы увидите панель управления WebHarvest со следующими разделами:
- **Dashboard** - общий обзор ваших скраперов и последних задач
- **Scrapers** - управление конфигурациями скраперов
- **History** - история выполненных задач скрапинга
- **Scheduled** - планирование автоматизированных задач скрапинга
- **Settings** - настройки приложения

## Создание скрапера

1. Перейдите в раздел "Scrapers" и нажмите кнопку "New Scraper"
2. Введите следующие данные:
   - **Name** - название конфигурации
   - **URL** - адрес целевого веб-сайта
   - **Page Type** - тип страницы (product listing, product detail, etc.)
   - **Page Limit** - максимальное количество страниц для скрапинга
   - **Request Interval** - интервал между запросами в секундах
   - **Pagination Pattern** - шаблон URL для пагинации (если применимо)

3. Настройте опции защиты:
   - **User Agent Spoofing** - подмена User-Agent для обхода блокировок
   - **Cloudflare Bypass** - обход защиты Cloudflare
   - **CAPTCHA Handling** - обработка CAPTCHA
   - **Proxy URL** - URL прокси-сервера (при необходимости)

4. Нажмите "Save" для сохранения конфигурации

## Настройка полей данных

После создания скрапера настройте поля данных, которые нужно извлекать:

1. В секции "Data Fields" нажмите "Add Field"
2. Введите следующие данные:
   - **Name** - название поля (например, "title", "price", "rating")
   - **Selector** - CSS/XPath селектор для извлечения элемента
   - **Type** - тип данных (text, number, image, link)
   - **Required** - обязательное ли поле
   - **Transform** - опциональная функция трансформации (например, `.trim()`)

3. Повторите для всех необходимых полей данных
4. Нажмите "Save" для сохранения поля

## Запуск скрапинга

После настройки скрапера и полей данных:

1. Нажмите кнопку "Start Scraping" на странице конфигурации
2. Подтвердите запуск задачи
3. Вы будете перенаправлены на страницу задачи, где можно отслеживать процесс

## Работа с результатами

После завершения скрапинга:

1. Перейдите на страницу результатов скрапера
2. Просмотрите собранные данные в таблице
3. Используйте поиск и фильтры для навигации
4. Экспортируйте данные в нужном формате (CSV, JSON) с помощью кнопок экспорта

## Планирование задач

Для автоматизации скрапинга:

1. Перейдите в раздел "Scheduled"
2. Нажмите "Create Schedule"
3. Выберите скрапер из выпадающего списка
4. Настройте расписание:
   - **Frequency** - частота (daily, weekly)
   - **Days** - дни недели (для weekly)
   - **Time** - время запуска

5. Нажмите "Create Schedule" для сохранения

## Настройки

В разделе "Settings" вы можете настроить:

1. **Account Information** - данные учетной записи
2. **Notification Settings** - настройки уведомлений
3. **Default Request Settings** - настройки запросов по умолчанию
4. **Anti-Detection Settings** - настройки обхода защиты
5. **Security Settings** - настройки безопасности
6. **Data Management** - управление данными

## Устранение неполадок

### Скрапер не извлекает данные
- Проверьте селекторы - они могут устареть при изменении сайта
- Увеличьте интервал между запросами
- Включите опции обхода защиты

### Ошибка "Too Many Requests"
- Увеличьте интервал между запросами
- Используйте прокси-сервер
- Включите User Agent Spoofing

### Приложение не запускается
- Убедитесь, что Node.js установлен и имеет версию 16.x или выше
- Проверьте, что порт 5000 не занят другим приложением
- Запустите установку заново с помощью `install-windows.bat` или `install-linux.sh`