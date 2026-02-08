import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

interface PublishRequest {
  userId: string
  postId: string
  accountIds: string[]
  title: string
  text: string
  mediaUrls: string[]
}

interface PublishResult {
  success: boolean
  messageId?: number
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: PublishRequest = await request.json()
    const { userId, postId, accountIds, title, text, mediaUrls } = body

    if (!userId || !accountIds.length || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Получаем данные выбранных аккаунтов
    const { data: accounts, error: accountsError } = await supabase
      .from('connected_accounts')
      .select('*')
      .in('id', accountIds)
      .eq('user_id', userId)
      .eq('is_active', true)

    if (accountsError) {
      console.error('Accounts fetch error:', accountsError)
      return NextResponse.json(
        { error: 'Failed to fetch accounts' },
        { status: 500 }
      )
    }

    if (!accounts.length) {
      return NextResponse.json(
        { error: 'No active accounts found' },
        { status: 404 }
      )
    }

    const results = []

    // Публикуем в каждый аккаунт
    for (const account of accounts) {
      try {
        let publishResult: PublishResult
        
        switch (account.service) {
          case 'telegram':
            publishResult = await publishToTelegram(account.account_data, text, mediaUrls)
            break
          case 'instagram':
            publishResult = await publishToInstagram(account.account_data, title, text, mediaUrls)
            break
          case 'vk':
            publishResult = await publishToVK(account.account_data, title, text, mediaUrls)
            break
          default:
            publishResult = { success: false, error: 'Unsupported service' }
        }

        results.push({
          accountId: account.id,
          service: account.service,
          accountName: account.account_name,
          success: publishResult.success,
          error: publishResult.error,
          messageId: publishResult.messageId,
        })
      } catch (error) {
        console.error(`Publish to ${account.service} error:`, error)
        results.push({
          accountId: account.id,
          service: account.service,
          accountName: account.account_name,
          success: false,
          error: 'Internal error',
        })
      }
    }

    // Сохраняем результаты публикации
    const { error: saveError } = await supabase
      .from('posts')
      .update({
        status: 'published',
        published_to: results.map(r => ({
          accountId: r.accountId,
          success: r.success,
          messageId: r.messageId,
        })),
      })
      .eq('id', postId)
      .eq('user_id', userId)

    if (saveError) {
      console.error('Post update error:', saveError)
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error('Publish API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Моковые функции публикации
async function publishToTelegram(accountData: any, text: string, mediaUrls: string[]): Promise<PublishResult> {
  // Здесь будет реальная интеграция с Telegram API
  // Пока что имитация успешной публикации
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    success: true,
    messageId: Math.floor(Math.random() * 1000000),
  }
}

async function publishToInstagram(accountData: any, title: string, text: string, mediaUrls: string[]): Promise<PublishResult> {
  // Здесь будет реальная интеграция с Instagram API
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const success = Math.random() > 0.3
  
  return {
    success,
    messageId: success ? Math.floor(Math.random() * 1000000) : undefined,
    error: success ? undefined : 'Failed to publish to Instagram',
  }
}

async function publishToVK(accountData: any, title: string, text: string, mediaUrls: string[]): Promise<PublishResult> {
  // Здесь будет реальная интеграция с VK API
  await new Promise(resolve => setTimeout(resolve, 1200))
  
  const success = Math.random() > 0.2
  
  return {
    success,
    messageId: success ? Math.floor(Math.random() * 1000000) : undefined,
    error: success ? undefined : 'Failed to publish to VK',
  }
}