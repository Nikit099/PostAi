# PowerShell скрипт для инициализации проекта ContentGenie

Write-Host "🚀 Инициализация проекта ContentGenie" -ForegroundColor Green

# Проверка наличия Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js установлен: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js не установлен. Пожалуйста, установите Node.js версии 18 или выше." -ForegroundColor Red
    exit 1
}

# Проверка наличия npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm установлен: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm не установлен." -ForegroundColor Red
    exit 1
}

# Установка зависимостей
Write-Host "📦 Установка зависимостей..." -ForegroundColor Yellow
npm install

# Создание файла окружения
if (!(Test-Path ".env.local")) {
    Write-Host "🔧 Создание файла .env.local из примера..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local" -ErrorAction SilentlyContinue
    Write-Host "⚠️  Пожалуйста, отредактируйте файл .env.local и добавьте ваши ключи API" -ForegroundColor Yellow
}

# Проверка структуры проекта
Write-Host "📁 Проверка структуры проекта..." -ForegroundColor Yellow

$requiredFolders = @("app", "components", "lib", "store", "types")
foreach ($folder in $requiredFolders) {
    if (!(Test-Path $folder)) {
        Write-Host "❌ Папка $folder не найдена" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Структура проекта в порядке" -ForegroundColor Green

# Создание необходимых папок
Write-Host "📂 Создание дополнительных папок..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "hooks" | Out-Null
New-Item -ItemType Directory -Force -Path "public" | Out-Null

# Информация о проекте
Write-Host ""
Write-Host "🎉 Проект ContentGenie успешно инициализирован!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Отредактируйте файл .env.local и добавьте ваши ключи API"
Write-Host "2. Настройте базу данных Supabase с помощью файла supabase/migrations/001_initial_schema.sql"
Write-Host "3. Запустите проект командой: npm run dev"
Write-Host "4. Откройте браузер и перейдите по адресу: http://localhost:3000"
Write-Host ""
Write-Host "🔗 Полезные ссылки:" -ForegroundColor Cyan
Write-Host "- Supabase: https://supabase.com"
Write-Host "- DeepSeek API: https://platform.deepseek.com"
Write-Host "- GigaChat API: https://developers.sber.ru/portal/products/gigachat"
Write-Host ""
Write-Host "🚀 Удачи в разработке!" -ForegroundColor Green