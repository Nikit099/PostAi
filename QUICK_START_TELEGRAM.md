# Быстрый старт: Telegram авторизация

## Шаг 1: Создайте Telegram бота

1. Откройте Telegram
2. Найдите @BotFather
3. Отправьте `/newbot`
4. Следуйте инструкциям
5. Сохраните токен бота

## Шаг 2: Настройте переменные окружения

Создайте файл `.env.local` в корне проекта:

```env
# Из .env.example
NEXT_PUBLIC_SUPABASE_URL=ваш_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш_anon_key
SUPABASE_SERVICE_ROLE_KEY=ваш_service_role_key

# Telegram
TELEGRAM_BOT_TOKEN=ваш_токен_бота

# Остальные переменные...
```

## Шаг 3: Примените миграцию

Запустите этот SQL в Supabase Dashboard (SQL Editor):

```sql
-- Добавить telegram_id в profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS telegram_id TEXT;

-- Создать индекс
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id);

-- Обновить функцию создания пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, telegram_username, telegram_id)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'telegram_username',
    NEW.raw_user_meta_data->>'telegram_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Шаг 4: Запустите приложение

```bash
npm run dev
```

## Шаг 5: Запустите Telegram бота

```bash
# Установите зависимости для бота
npm install node-telegram-bot-api axios

# Создайте файл .env для бота
cat > bot.env << EOF
TELEGRAM_BOT_TOKEN=ваш_токен_бота
API_URL=http://localhost:3000
EOF

# Запустите бота
node scripts/telegram-bot-example.js
```

## Шаг 6: Протестируйте

1. Откройте http://localhost:3000/login
2. Нажмите "Войти через Telegram"
3. В Telegram найдите вашего бота
4. Отправьте `/login`
5. Введите полученный код на сайте

## Готово! 🎉

Если всё работает, вы успешно вошли через Telegram.

## Что делать если не работает?

### Бот не отвечает:
- Проверьте токен бота
- Убедитесь, что бот запущен

### Код не принимается:
- Проверьте, что приложение запущено
- Убедитесь, что API доступен
- Проверьте логи в терминале

### Ошибка базы данных:
- Проверьте SUPABASE_SERVICE_ROLE_KEY
- Убедитесь, что миграция применена

## Для продакшена

1. Замените временное хранилище кодов на Redis
2. Настройте webhook для бота
3. Добавьте rate limiting
4. Используйте HTTPS

## Дополнительная информация

- Полная документация: `TELEGRAM_AUTH_SETUP.md`
- Пример бота: `scripts/telegram-bot-example.js`
- API роут: `app/api/auth/telegram/route.ts`
- Хук авторизации: `hooks/useAuth.ts`
- Страница логина: `app/(auth)/login/page.tsx`
```