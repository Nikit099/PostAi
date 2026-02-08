import { supabase } from './supabase/client'

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export async function uploadFile(
  file: File,
  userId: string,
  folder: string = 'posts'
): Promise<UploadResult> {
  try {
    // Проверяем размер файла (макс. 5MB)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      throw new Error('Файл слишком большой. Максимальный размер: 5MB')
    }

    // Проверяем тип файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Неподдерживаемый формат файла. Используйте JPEG, PNG, GIF или WebP')
    }

    // Генерируем уникальное имя файла
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${userId}/${folder}/${fileName}`

    // Загружаем файл в Supabase Storage
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Получаем публичный URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath,
    }
  } catch (error) {
    console.error('File upload error:', error)
    return {
      url: '',
      path: '',
      error: error instanceof Error ? error.message : 'Ошибка загрузки файла',
    }
  }
}

export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('media')
      .remove([filePath])

    if (error) throw error
    return true
  } catch (error) {
    console.error('File deletion error:', error)
    return false
  }
}

export async function uploadMultipleFiles(
  files: File[],
  userId: string,
  folder: string = 'posts'
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadFile(file, userId, folder))
  return Promise.all(uploadPromises)
}

export function validateFiles(files: File[]): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const MAX_FILES = 4
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  if (files.length > MAX_FILES) {
    errors.push(`Можно загрузить не более ${MAX_FILES} файлов`)
  }

  files.forEach((file, index) => {
    if (file.size > MAX_SIZE) {
      errors.push(`Файл "${file.name}" слишком большой. Максимальный размер: 5MB`)
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`Файл "${file.name}" имеет неподдерживаемый формат`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function getFilePreview(file: File): string {
  return URL.createObjectURL(file)
}

export function cleanupFilePreviews(previews: string[]) {
  previews.forEach(preview => {
    URL.revokeObjectURL(preview)
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}