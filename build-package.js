const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { execSync } = require('child_process');

// Создаем папку dist, если ее нет
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Получаем версию из package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version || '1.0.0';

// Имена архивов
const windowsArchive = path.join('dist', `webharvest-windows-${version}.zip`);
const linuxArchive = path.join('dist', `webharvest-linux-${version}.tar.gz`);

// Функция создания архива ZIP для Windows
function createWindowsPackage() {
  console.log('Создание архива для Windows...');
  
  const output = fs.createWriteStream(windowsArchive);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Максимальная компрессия
  });
  
  output.on('close', () => {
    console.log(`Архив Windows создан: ${windowsArchive} (${(archive.pointer() / 1024 / 1024).toFixed(2)} МБ)`);
  });
  
  archive.on('error', (err) => {
    throw err;
  });
  
  archive.pipe(output);
  
  // Добавляем файлы, исключая ненужные
  archive.glob('**/*', {
    ignore: [
      'node_modules/**',
      'dist/**',
      '.git/**',
      '*.tar.gz',
      '*.zip',
      'install-linux.sh',
      'start-linux.sh'
    ]
  });
  
  archive.finalize();
}

// Функция создания архива TAR.GZ для Linux
function createLinuxPackage() {
  console.log('Создание архива для Linux...');
  
  const output = fs.createWriteStream(linuxArchive);
  const archive = archiver('tar', {
    gzip: true,
    gzipOptions: { level: 9 } // Максимальная компрессия
  });
  
  output.on('close', () => {
    console.log(`Архив Linux создан: ${linuxArchive} (${(archive.pointer() / 1024 / 1024).toFixed(2)} МБ)`);
  });
  
  archive.on('error', (err) => {
    throw err;
  });
  
  archive.pipe(output);
  
  // Добавляем файлы, исключая ненужные
  archive.glob('**/*', {
    ignore: [
      'node_modules/**',
      'dist/**',
      '.git/**',
      '*.tar.gz',
      '*.zip',
      'install-windows.bat',
      'start-windows.bat'
    ]
  });
  
  archive.finalize();
}

// Устанавливаем зависимость archiver, если ее нет
try {
  require.resolve('archiver');
} catch (e) {
  console.log('Установка модуля archiver для создания архивов...');
  execSync('npm install archiver --no-save', { stdio: 'inherit' });
}

// Создаем оба архива
createWindowsPackage();
createLinuxPackage();