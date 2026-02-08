#!/usr/bin/env node

// Скрипт для безопасного запуска Telegram бота
// Проверяет, не запущен ли уже бот

require('dotenv').config();
const fs = require('fs');
const path = require('path');

const LOCK_FILE = path.join(__dirname, '.bot.lock');
const BOT_SCRIPT = path.join(__dirname, 'telegram-bot-example.js');

// Проверяем наличие lock файла
if (fs.existsSync(LOCK_FILE)) {
  try {
    const lockContent = fs.readFileSync(LOCK_FILE, 'utf8');
    const lockData = JSON.parse(lockContent);
    const now = Date.now();
    
    // Если lock файл старше 5 минут, считаем его устаревшим
    if (now - lockData.timestamp < 5 * 60 * 1000) {
      console.error('❌ Бот уже запущен!');
      console.error(`   PID: ${lockData.pid}`);
      console.error(`   Запущен: ${new Date(lockData.timestamp).toLocaleString()}`);
      console.error('   Если бот не работает, удалите файл scripts/.bot.lock');
      process.exit(1);
    } else {
      console.log('⚠️  Найден устаревший lock файл, удаляю...');
      fs.unlinkSync(LOCK_FILE);
    }
  } catch (error) {
    console.error('Ошибка чтения lock файла:', error);
    fs.unlinkSync(LOCK_FILE);
  }
}

// Создаем lock файл
const lockData = {
  pid: process.pid,
  timestamp: Date.now(),
  script: BOT_SCRIPT
};

fs.writeFileSync(LOCK_FILE, JSON.stringify(lockData, null, 2));
console.log(`✅ Lock файл создан (PID: ${process.pid})`);

// Обработка завершения процесса
process.on('exit', () => {
  if (fs.existsSync(LOCK_FILE)) {
    fs.unlinkSync(LOCK_FILE);
    console.log('✅ Lock файл удален');
  }
});

process.on('SIGINT', () => {
  console.log('\n🛑 Получен SIGINT, завершаю работу...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Получен SIGTERM, завершаю работу...');
  process.exit(0);
});

// Запускаем бота
console.log('🚀 Запуск Telegram бота...');
require('./telegram-bot-example.js');

console.log('🤖 Бот успешно запущен!');
console.log('📝 Для остановки нажмите Ctrl+C');