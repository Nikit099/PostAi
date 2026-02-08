'use client'

import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number // от 0 до 100
  max?: number
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  className?: string
}

export function Progress({
  value,
  max = 100,
  showValue = false,
  size = 'md',
  variant = 'default',
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }
  
  const variantClasses = {
    default: 'bg-primary-blue',
    success: 'bg-primary-green',
    warning: 'bg-yellow-500',
    destructive: 'bg-red-500',
  }

  return (
    <div className={cn('space-y-2', className)}>
      {showValue && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Прогресс</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={cn(
        'w-full bg-muted rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}