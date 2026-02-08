import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
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