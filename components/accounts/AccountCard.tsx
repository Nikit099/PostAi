'use client'

import { MessageSquare, Instagram, Globe, Twitter, Youtube, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { ConnectedAccount } from '@/types'

interface AccountCardProps {
  account: ConnectedAccount
  isSelected?: boolean
  showStatus?: boolean
  onSelect?: (accountId: string) => void
  onRemove?: (accountId: string) => void
  className?: string
}

const serviceConfigs = {
  telegram: {
    icon: MessageSquare,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    label: 'Telegram',
  },
  instagram: {
    icon: Instagram,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    label: 'Instagram',
  },
  vk: {
    icon: Globe,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    label: 'VK',
  },
  twitter: {
    icon: Twitter,
    color: 'text-sky-500',
    bgColor: 'bg-sky-50 dark:bg-sky-900/20',
    label: 'Twitter',
  },
  dzen: {
    icon: Youtube,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    label: 'Дзен',
  },
}

export function AccountCard({
  account,
  isSelected = false,
  showStatus = true,
  onSelect,
  onRemove,
  className,
}: AccountCardProps) {
  const config = serviceConfigs[account.service] || serviceConfigs.telegram
  const Icon = config.icon

  const handleClick = () => {
    if (onSelect) {
      onSelect(account.id)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRemove && confirm('Вы уверены, что хотите удалить этот аккаунт?')) {
      onRemove(account.id)
    }
  }

  return (
    <Card
      onClick={handleClick}
      className={cn(
        'p-4 transition-all cursor-pointer',
        isSelected
          ? 'border-2 border-primary-green bg-primary-green/5'
          : 'border border-input hover:border-primary-blue/50',
        !account.is_active && 'opacity-60',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center',
            config.bgColor
          )}>
            <Icon className={cn('w-6 h-6', config.color)} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{account.account_name}</h3>
              {showStatus && !account.is_active && (
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Неактивен
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{config.label}</span>
              {account.account_data.username && (
                <>
                  <span>•</span>
                  <span>{account.account_data.username}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSelected && (
            <div className="w-6 h-6 rounded-full bg-primary-green flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {onRemove && (
            <button
              onClick={handleRemove}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Удалить аккаунт"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}