/**
 * Скрипт для создания пакетов WebHarvest для различных платформ
 * 
 * Использование:
 * node build-package.js windows
 * node build-package.js linux
 * node build-package.js all
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Получаем имя приложения и версию из package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const appName = packageJson.name;
const version = packageJson.version;

// Список файлов и директорий для включения в пакет
const filesToInclude = [
  'client',
  'server',
  'shared',
  '.gitignore',
  'drizzle.config.ts',
  'package.json',
  'package-lock.json',
  'postcss.config.js',
  'README.md',
  'run.js',
  'tailwind.config.ts',
  'theme.json',
  'tsconfig.json',
  'USER_GUIDE.md',
  'vite.config.ts',
  'webharvest.bat',
  'generated-icon.png'
];

// Платформо-зависимые файлы
const windowsFiles = [
  'install-windows.bat',
  'start-windows.bat'
];

const linuxFiles = [
  'install-linux.sh',
  'start-linux.sh'
];

// Создание временной директории для сборки
function prepareDirectory(targetDir) {
  if (fs.existsSync(targetDir)) {
    console.log(`Удаление предыдущей временной директории ${targetDir}...`);
    try {
      fs.rmSync(targetDir, { recursive: true, force: true });
    } catch (err) {
      console.error(`Ошибка при удалении директории ${targetDir}:`, err);
      process.exit(1);
    }
  }
  
  console.log(`Создание временной директории ${targetDir}...`);
  fs.mkdirSync(targetDir, { recursive: true });
}

// Копирование файлов в сборочную директорию
function copyFiles(files, targetDir) {
  console.log(`Копирование файлов в ${targetDir}...`);
  
  files.forEach(file => {
    const source = path.resolve(file);
    const destination = path.join(targetDir, file);
    
    // Создаем родительскую директорию, если она не существует
    const destDir = path.dirname(destination);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    if (fs.existsSync(source)) {
      // Проверяем, является ли файл директорией
      if (fs.lstatSync(source).isDirectory()) {
        // Копируем директорию рекурсивно
        copyDirectory(source, destination);
      } else {
        // Копируем файл
        fs.copyFileSync(source, destination);
        console.log(`  Копирован файл: ${file}`);
      }
    } else {
      console.warn(`  Предупреждение: Файл не найден - ${file}`);
    }
  });
}

// Рекурсивное копирование директории
function copyDirectory(source, destination) {
  // Создаем целевую директорию, если она не существует
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }
  
  // Получаем все файлы и поддиректории
  const files = fs.readdirSync(source);
  
  // Копируем каждый файл/директорию
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);
    
    // Пропускаем node_modules и dist
    if (file === 'node_modules' || file === 'dist') {
      return;
    }
    
    if (fs.lstatSync(sourcePath).isDirectory()) {
      // Рекурсивно копируем поддиректорию
      copyDirectory(sourcePath, destPath);
    } else {
      // Копируем файл
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

// Создание архива (tar.gz для Linux, zip для Windows)
function createArchive(sourceDir, outputFile) {
  console.log(`Создание архива: ${outputFile}`);
  
  try {
    if (outputFile.endsWith('.zip')) {
      // Для Windows создаем zip архив
      if (process.platform === 'win32') {
        // Используем PowerShell в Windows
        execSync(`powershell.exe -Command "Compress-Archive -Path '${sourceDir}\\*' -DestinationPath '${outputFile}'" -Force`);
      } else {
        // Используем zip в Linux/MacOS
        execSync(`zip -r "${outputFile}" *`, { cwd: sourceDir });
      }
    } else if (outputFile.endsWith('.tar.gz')) {
      // Для Linux создаем tar.gz архив
      execSync(`tar -czf "${outputFile}" *`, { cwd: sourceDir });
    }
    console.log(`Архив успешно создан: ${outputFile}`);
  } catch (err) {
    console.error(`Ошибка при создании архива ${outputFile}:`, err);
    process.exit(1);
  }
}

// Функция для создания Windows пакета
function createWindowsPackage() {
  console.log('\n=== Создание пакета для Windows ===\n');
  
  const buildDir = 'dist/package-windows';
  const outputFile = `dist/${appName}-${version}-windows.zip`;
  
  prepareDirectory(buildDir);
  copyFiles([...filesToInclude, ...windowsFiles], buildDir);
  createArchive(buildDir, outputFile);
  
  console.log('\n=== Пакет для Windows успешно создан ===\n');
}

// Функция для создания Linux пакета
function createLinuxPackage() {
  console.log('\n=== Создание пакета для Linux ===\n');
  
  const buildDir = 'dist/package-linux';
  const outputFile = `dist/${appName}-${version}-linux.tar.gz`;
  
  prepareDirectory(buildDir);
  copyFiles([...filesToInclude, ...linuxFiles], buildDir);
  createArchive(buildDir, outputFile);
  
  console.log('\n=== Пакет для Linux успешно создан ===\n');
}

// Основная функция
function main() {
  // Создаем директорию для пакетов, если она не существует
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }
  
  // Получаем аргумент командной строки
  const targetPlatform = process.argv[2] || 'all';
  
  switch (targetPlatform.toLowerCase()) {
    case 'windows':
      createWindowsPackage();
      break;
    case 'linux':
      createLinuxPackage();
      break;
    case 'all':
      createWindowsPackage();
      createLinuxPackage();
      break;
    default:
      console.error(`Неизвестная платформа: ${targetPlatform}`);
      console.log('Использование: node build-package.js [windows|linux|all]');
      process.exit(1);
  }
  
  console.log(`\nГотово! Пакеты созданы в директории 'dist/'`);
}

// Запуск скрипта
main();