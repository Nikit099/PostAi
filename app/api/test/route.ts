import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Создаем Supabase клиент для сервера
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async getAll() {
            const allCookies = cookieStore.getAll()
            return allCookies
          },
          async setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    // Проверяем подключение к Supabase
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: 'Проверьте переменные окружения SUPABASE_SERVICE_ROLE_KEY и NEXT_PUBLIC_SUPABASE_URL'
        },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supabase подключен успешно',
      data
    })
    
  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Внутренняя ошибка сервера'
      },
      { status: 500 }
    )
  }
}