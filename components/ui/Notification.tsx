'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface NotificationProps {
  type: NotificationType
  title: string
  message?: string
  duration?: number // в миллисекундах, 0 = не закрывать автоматически
  onClose?: () => void
  className?: string
}

const typeConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-primary-green/10',
    borderColor: 'border-primary-green',
    textColor: 'text-primary-green',
    iconColor: 'text-primary-green',
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500',
    textColor: 'text-red-500',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-600',
    iconColor: 'text-yellow-500',
  },
  info: {
    icon: Info,
    bgColor: 'bg-primary-blue/10',
    borderColor: 'border-primary-blue',
    textColor: 'text-primary-blue',
    iconColor: 'text-primary-blue',
  },
}

export function Notification({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  className,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const config = typeConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        if (onClose) {
          setTimeout(onClose, 300) // Ждем завершения анимации
        }
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    if (onClose) {
      setTimeout(onClose, 300)
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 w-full max-w-sm animate-in slide-in-from-right-5',
        className
      )}
    >
      <div
        className={cn(
          'rounded-lg border p-4 shadow-lg backdrop-blur-sm',
          config.bgColor,
          config.borderColor
        )}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', config.iconColor)} />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className={cn('font-medium', config.textColor)}>
                  {title}
                </h4>
                {message && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {message}
                  </p>
                )}
              </div>
              
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                aria-label="Закрыть уведомление"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Progress bar для автоматического закрытия */}
            {duration > 0 && (
              <div className="mt-3 h-1 w-full bg-current/20 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', config.bgColor)}
                  style={{
                    animation: `shrink ${duration}ms linear forwards`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}