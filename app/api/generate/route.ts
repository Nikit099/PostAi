import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { idea, userId } = await request.json()

    if (!idea || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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

    // Проверяем лимиты пользователя
    const { data: userData } = await supabase
      .from('profiles')
      .select('daily_credits')
      .eq('id', userId)
      .single()

    if (!userData || userData.daily_credits <= 0) {
      return NextResponse.json(
        { error: 'Daily limit exceeded' },
        { status: 429 }
      )
    }

    // Здесь будет вызов DeepSeek API
    // Пока что возвращаем моковый ответ
    const generatedText = `🔥 Начинайте свой день с зарядки! Всего 15 минут утренних упражнений могут повысить вашу продуктивность на целый день.

💡 Почему это работает:
• Пробуждает организм
• Улучшает кровообращение
• Повышает концентрацию
• Дает заряд энергии

🚀 Попробуйте завтра утром и почувствуйте разницу!

#продуктивность #зарядка #утро #здоровье #энергия`

    // Сохраняем генерацию в историю
    const { error: generationError } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        original_idea: idea,
        generated_text: generatedText,
        used_credits: 1,
      })

    if (generationError) {
      console.error('Generation save error:', generationError)
    }

    // Обновляем кредиты пользователя
    await supabase
      .from('profiles')
      .update({ daily_credits: userData.daily_credits - 1 })
      .eq('id', userId)

    return NextResponse.json({
      success: true,
      text: generatedText,
      credits_left: userData.daily_credits - 1,
    })
  } catch (error) {
    console.error('Generation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}