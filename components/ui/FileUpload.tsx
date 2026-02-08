'use client'

import { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { validateFiles, getFilePreview, cleanupFilePreviews, formatFileSize } from '@/lib/fileUtils'

interface FileUploadProps {
  maxFiles?: number
  maxSize?: number // в байтах
  accept?: Record<string, string[]>
  onFilesChange?: (files: File[]) => void
  className?: string
}

export function FileUpload({
  maxFiles = 4,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
  },
  onFilesChange,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Очищаем старые превью
    cleanupFilePreviews(previews)
    
    // Валидируем файлы
    const validation = validateFiles([...files, ...acceptedFiles])
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }
    
    setErrors([])
    
    // Обновляем файлы
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
    setFiles(newFiles)
    
    // Создаем превью
    const newPreviews = newFiles.map(file => getFilePreview(file))
    setPreviews(newPreviews)
    
    // Уведомляем родительский компонент
    if (onFilesChange) {
      onFilesChange(newFiles)
    }
  }, [files, previews, maxFiles, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
  })

  const removeFile = (index: number) => {
    // Очищаем превью удаляемого файла
    URL.revokeObjectURL(previews[index])
    
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    
    setFiles(newFiles)
    setPreviews(newPreviews)
    
    if (onFilesChange) {
      onFilesChange(newFiles)
    }
  }

  const clearAll = () => {
    // Очищаем все превью
    cleanupFilePreviews(previews)
    
    setFiles([])
    setPreviews([])
    setErrors([])
    
    if (onFilesChange) {
      onFilesChange([])
    }
  }

  // Очищаем превью при размонтировании
  useState(() => {
    return () => {
      cleanupFilePreviews(previews)
    }
  })

  return (
    <div className={cn('space-y-4', className)}>
      {/* Область загрузки */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary-blue bg-primary-blue/5'
            : 'border-input hover:border-primary-blue/50',
          errors.length > 0 && 'border-destructive'
        )}
      >
        <input {...getInputProps()} />
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mx-auto">
            {isDragActive ? (
              <Upload className="w-8 h-8 text-primary-blue animate-bounce" />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium">
              {isDragActive ? 'Отпустите файлы здесь' : 'Перетащите файлы сюда'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              или нажмите для выбора файлов
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Поддерживаются: PNG, JPG, GIF, WebP (макс. {formatFileSize(maxSize)})
            </p>
            <p className="text-xs text-muted-foreground">
              Максимум файлов: {maxFiles}
            </p>
          </div>
        </div>
      </div>

      {/* Ошибки */}
      {errors.length > 0 && (
        <Card className="p-4 border-destructive bg-destructive/5">
          <div className="space-y-1">
            {errors.map((error, index) => (
              <p key={index} className="text-sm text-destructive">
                • {error}
              </p>
            ))}
          </div>
        </Card>
      )}

      {/* Превью файлов */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">Загруженные файлы</span>
              <span className="text-sm text-muted-foreground">
                ({files.length}/{maxFiles})
              </span>
            </div>
            <Button
              onClick={clearAll}
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
            >
              Очистить все
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={previews[index]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    onClick={() => removeFile(index)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mt-2">
                  <p className="text-xs truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}