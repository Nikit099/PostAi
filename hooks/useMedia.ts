import { useState, useEffect } from 'react'
import { uploadFile, uploadMultipleFiles, deleteFile } from '@/lib/fileUtils'
import { toast } from 'sonner'

interface UseMediaOptions {
  userId: string
  folder?: string
  maxFiles?: number
  maxSize?: number
}

export function useMedia({
  userId,
  folder = 'posts',
  maxFiles = 4,
  maxSize = 5 * 1024 * 1024,
}: UseMediaOptions) {
  const [files, setFiles] = useState<File[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `Файл слишком большой. Максимальный размер: ${maxSize / 1024 / 1024}MB`,
      }
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Неподдерживаемый формат файла',
      }
    }

    return { isValid: true }
  }

  const addFiles = (newFiles: File[]) => {
    const validFiles: File[] = []
    const errors: string[] = []

    newFiles.forEach(file => {
      const validation = validateFile(file)
      if (validation.isValid) {
        validFiles.push(file)
      } else if (validation.error) {
        errors.push(`${file.name}: ${validation.error}`)
      }
    })

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }

    if (validFiles.length > 0) {
      const totalFiles = files.length + validFiles.length
      if (totalFiles > maxFiles) {
        toast.error(`Можно загрузить не более ${maxFiles} файлов`)
        return
      }

      setFiles(prev => [...prev, ...validFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const clearFiles = () => {
    setFiles([])
  }

  const uploadFiles = async (): Promise<string[]> => {
    if (files.length === 0) {
      return []
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const results = await uploadMultipleFiles(files, userId, folder)
      
      const successfulUploads = results.filter(result => !result.error)
      const failedUploads = results.filter(result => result.error)

      if (failedUploads.length > 0) {
        failedUploads.forEach(result => {
          toast.error(`Ошибка загрузки: ${result.error}`)
        })
      }

      if (successfulUploads.length > 0) {
        const urls = successfulUploads.map(result => result.url)
        setUploadedUrls(prev => [...prev, ...urls])
        toast.success(`Загружено ${successfulUploads.length} файлов`)
        return urls
      }

      return []
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Ошибка при загрузке файлов')
      return []
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const deleteUploadedFile = async (url: string): Promise<boolean> => {
    try {
      // Извлекаем путь из URL
      const urlObj = new URL(url)
      const path = urlObj.pathname.split('/').slice(2).join('/') // Убираем /storage/v1/object/public/media/
      
      const success = await deleteFile(path)
      
      if (success) {
        setUploadedUrls(prev => prev.filter(u => u !== url))
        toast.success('Файл удален')
      } else {
        toast.error('Ошибка при удалении файла')
      }
      
      return success
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Ошибка при удалении файла')
      return false
    }
  }

  const getFilePreviews = () => {
    return files.map(file => URL.createObjectURL(file))
  }

  const cleanupPreviews = (previews: string[]) => {
    previews.forEach(preview => URL.revokeObjectURL(preview))
  }

  // Очищаем превью при размонтировании
  useEffect(() => {
    return () => {
      const previews = getFilePreviews()
      cleanupPreviews(previews)
    }
  }, [files])

  return {
    files,
    uploadedUrls,
    isUploading,
    uploadProgress,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    deleteUploadedFile,
    getFilePreviews,
    cleanupPreviews,
    validateFile,
  }
}