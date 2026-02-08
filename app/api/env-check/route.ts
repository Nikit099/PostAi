import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const envVars = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasTelegramToken: !!process.env.TELEGRAM_BOT_TOKEN,
    supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
    telegramTokenLength: process.env.TELEGRAM_BOT_TOKEN?.length || 0,
  }
  
  return NextResponse.json({
    success: true,
    environment: 'development',
    nodeEnv: process.env.NODE_ENV,
    envVars,
    message: envVars.hasServiceRoleKey ? 'Все переменные найдены' : 'Отсутствуют некоторые переменные',
  })
}