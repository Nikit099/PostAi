import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Проверяем формат файла
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm']
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: 'Unsupported audio format' },
        { status: 400 }
      )
    }

    // Здесь будет вызов GigaChat API для транскрибации
    // Пока что возвращаем моковый текст
    
    const mockTranscriptions = [
      'Хочу написать пост о пользе утренней зарядки для продуктивности в течение дня.',
      'Нужен пост о важности здорового сна и его влиянии на работоспособность.',
      'Создай контент о том, как правильно планировать день для максимальной эффективности.',
      'Напиши пост о преимуществах цифрового детокса и отключения от гаджетов.',
    ]

    const randomIndex = Math.floor(Math.random() * mockTranscriptions.length)
    const transcribedText = mockTranscriptions[randomIndex]

    return NextResponse.json({
      success: true,
      text: transcribedText,
    })
  } catch (error) {
    console.error('Transcription API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}