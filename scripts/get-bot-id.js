// Скрипт для получения bot_id из username
// Используйте: node scripts/get-bot-id.js <bot_username>

const axios = require('axios');

async function getBotId(botUsername) {
  try {
    // Удаляем @ если есть
    const username = botUsername.replace('@', '');
    
    console.log(`\n=== Получение bot_id для @${username} ===`);
    console.log('\nСпособ 1: Через BotFather');
    console.log('1. Откройте @BotFather в Telegram');
    console.log('2. Отправьте /mybots');
    console.log('3. Выберите вашего бота');
    console.log('4. Выберите "API Token"');
    console.log('5. Токен выглядит как: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz');
    console.log('6. Первая часть до двоеточия - это ваш bot_id');
    console.log('   Пример: для токена "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"');
    console.log('   bot_id = 1234567890');
    
    console.log('\nСпособ 2: Через getMe API (требует токен бота)');
    console.log('Если у вас есть токен бота, используйте:');
    console.log('curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe');
    console.log('В ответе будет поле "id" - это bot_id');
    
    console.log('\nСпособ 3: Через Telegram OAuth');
    console.log('Telegram OAuth требует bot_id в URL:');
    console.log('https://oauth.telegram.org/auth?bot_id=<BOT_ID>&...');
    console.log('\nРекомендация: Используйте Telegram Widget вместо OAuth');
    console.log('Telegram Widget использует username, а не bot_id');
    
    return null;
  } catch (error) {
    console.error('Error:', error.message);
    return null;
  }
}

// Получаем аргументы командной строки
const args = process.argv.slice(2);
const botUsername = args[0] || 'ContentGenieBot';

getBotId(botUsername).then(() => {
  console.log('\n=== Альтернативное решение ===');
  console.log('Используйте Telegram Widget (уже реализован в компоненте TelegramLoginButton)');
  console.log('Widget использует username, а не bot_id');
  console.log('Для тестирования откройте: http://localhost:3001/login');
  process.exit(0);
});
