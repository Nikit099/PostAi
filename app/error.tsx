'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Что-то пошло не так!</h2>
        <p className="text-muted-foreground">
          {error.message || 'Произошла непредвиденная ошибка'}
        </p>
        <Button
          onClick={() => reset()}
          className="bg-gradient-to-r from-primary-blue to-primary-green"
        >
          Попробовать снова
        </Button>
      </div>
    </div>
  )
}