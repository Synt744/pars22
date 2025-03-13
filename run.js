/**
 * Скрипт для запуска WebHarvest из командной строки
 * Позволяет выполнять скрапинг напрямую без использования веб-интерфейса
 */

import { storage } from './server/storage.js';
import { runScraper } from './server/scraper.js';

// Обработка аргументов командной строки
const args = process.argv.slice(2);
const command = args[0];

// Справка по использованию
function printHelp() {
  console.log(`
WebHarvest CLI - Интерфейс командной строки для WebHarvest

Использование:
  node run.js <команда> [опции]

Команды:
  list                 Показать список доступных конфигураций скраперов
  run <id>             Запустить скрапер по ID конфигурации
  show <id>            Показать детали конфигурации скрапера
  export <id> <format> Экспортировать собранные данные (format: csv, json)
  help                 Показать эту справку

Примеры:
  node run.js list
  node run.js run 1
  node run.js show 2
  node run.js export 1 json
  `);
}

// Список скраперов
async function listScrapers() {
  try {
    const configs = await storage.getScraperConfigs();
    console.log('\nДоступные конфигурации скраперов:');
    console.log('------------------------------------------------------');
    console.log('ID  | Название                       | URL');
    console.log('------------------------------------------------------');
    configs.forEach(config => {
      console.log(`${config.id.toString().padEnd(3)} | ${config.name.padEnd(30)} | ${config.url}`);
    });
    console.log('------------------------------------------------------');
    console.log(`Всего конфигураций: ${configs.length}`);
    console.log();
  } catch (error) {
    console.error('Ошибка при получении списка скраперов:', error);
  }
}

// Показать детали скрапера
async function showScraperDetails(id) {
  try {
    const configId = parseInt(id);
    const config = await storage.getScraperConfig(configId);
    
    if (!config) {
      console.error(`Скрапер с ID ${configId} не найден.`);
      return;
    }
    
    const fields = await storage.getDataFields(configId);
    const products = await storage.getScrapedProducts(configId);
    const productCount = await storage.getProductCount(configId);
    const jobs = await storage.getScraperJobs(configId);
    
    console.log('\nДетали скрапера:');
    console.log('------------------------------------------------------');
    console.log(`ID: ${config.id}`);
    console.log(`Название: ${config.name}`);
    console.log(`URL: ${config.url}`);
    console.log(`Тип страницы: ${config.pageType}`);
    console.log(`Ограничение страниц: ${config.pageLimit}`);
    console.log(`Интервал запросов: ${config.requestInterval} сек.`);
    console.log(`Шаблон пагинации: ${config.paginationPattern || 'Не указан'}`);
    console.log(`User-Agent Spoofing: ${config.useUserAgentSpoofing ? 'Включено' : 'Выключено'}`);
    console.log(`Cloudflare Bypass: ${config.useCloudflareBypass ? 'Включено' : 'Выключено'}`);
    console.log(`CAPTCHA Handling: ${config.useCaptchaHandling ? 'Включено' : 'Выключено'}`);
    console.log(`Прокси URL: ${config.proxyUrl || 'Не указан'}`);
    
    console.log('\nПоля данных:');
    console.log('------------------------------------------------------');
    if (fields.length > 0) {
      console.log('ID  | Название          | Селектор                 | Тип');
      console.log('------------------------------------------------------');
      fields.forEach(field => {
        console.log(`${field.id.toString().padEnd(3)} | ${field.name.padEnd(18)} | ${field.selector.padEnd(25)} | ${field.type}`);
      });
    } else {
      console.log('Нет настроенных полей данных.');
    }
    
    console.log('\nСтатистика:');
    console.log('------------------------------------------------------');
    console.log(`Полей данных: ${fields.length}`);
    console.log(`Собранных продуктов: ${productCount}`);
    console.log(`Выполненных задач: ${jobs.length}`);
    console.log('------------------------------------------------------');
    
  } catch (error) {
    console.error('Ошибка при получении деталей скрапера:', error);
  }
}

// Запустить скрапер
async function runScraperById(id) {
  try {
    const configId = parseInt(id);
    const config = await storage.getScraperConfig(configId);
    
    if (!config) {
      console.error(`Скрапер с ID ${configId} не найден.`);
      return;
    }
    
    console.log(`Запуск скрапера "${config.name}"...`);
    
    // Создаем новую задачу
    const job = await storage.createScraperJob({
      configId: config.id,
      status: 'running',
      startTime: new Date().toISOString(),
      itemsScraped: 0
    });
    
    console.log(`Задача создана (ID: ${job.id})`);
    console.log('Выполняется скрапинг...');
    
    // Запускаем скрапер
    const updatedJob = await runScraper(config, job, storage);
    
    console.log('\nРезультаты:');
    console.log('------------------------------------------------------');
    console.log(`Статус: ${updatedJob.status}`);
    console.log(`Собрано элементов: ${updatedJob.itemsScraped}`);
    console.log(`Время начала: ${new Date(updatedJob.startTime).toLocaleString()}`);
    console.log(`Время окончания: ${new Date(updatedJob.endTime).toLocaleString()}`);
    console.log(`Длительность: ${updatedJob.durationSeconds} сек.`);
    
    if (updatedJob.error) {
      console.error(`Ошибка: ${updatedJob.error}`);
    }
    
    console.log('------------------------------------------------------');
    console.log(`Для просмотра собранных данных используйте: node run.js export ${configId} json`);
    
  } catch (error) {
    console.error('Ошибка при запуске скрапера:', error);
  }
}

// Экспорт данных
async function exportData(id, format) {
  try {
    const configId = parseInt(id);
    const config = await storage.getScraperConfig(configId);
    
    if (!config) {
      console.error(`Скрапер с ID ${configId} не найден.`);
      return;
    }
    
    const products = await storage.getScrapedProducts(configId);
    
    if (!products || !products.length) {
      console.error(`Нет данных для экспорта в скрапере с ID ${configId}.`);
      return;
    }
    
    if (format.toLowerCase() === 'json') {
      console.log(JSON.stringify(products, null, 2));
    } else if (format.toLowerCase() === 'csv') {
      // Простой CSV экспорт
      if (products.length > 0) {
        const headers = Object.keys(products[0]).join(',');
        const rows = products.map(product => {
          return Object.values(product).map(value => {
            if (typeof value === 'string') {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',');
        });
        
        console.log(headers);
        rows.forEach(row => console.log(row));
      }
    } else {
      console.error(`Неподдерживаемый формат: ${format}. Используйте 'csv' или 'json'.`);
    }
    
  } catch (error) {
    console.error('Ошибка при экспорте данных:', error);
  }
}

// Обработка команд
async function processCommand() {
  if (!command || command === 'help') {
    printHelp();
    return;
  }
  
  switch (command) {
    case 'list':
      await listScrapers();
      break;
    case 'run':
      if (!args[1]) {
        console.error('Необходимо указать ID скрапера. Например: node run.js run 1');
        break;
      }
      await runScraperById(args[1]);
      break;
    case 'show':
      if (!args[1]) {
        console.error('Необходимо указать ID скрапера. Например: node run.js show 1');
        break;
      }
      await showScraperDetails(args[1]);
      break;
    case 'export':
      if (!args[1] || !args[2]) {
        console.error('Необходимо указать ID скрапера и формат. Например: node run.js export 1 json');
        break;
      }
      await exportData(args[1], args[2]);
      break;
    default:
      console.error(`Неизвестная команда: ${command}`);
      printHelp();
  }
}

// Запуск
processCommand()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Ошибка:', error);
    process.exit(1);
  });