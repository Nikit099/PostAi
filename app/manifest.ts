import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ContentGenie',
    short_name: 'ContentGenie',
    description: 'Мобильно-ориентированное приложение для генерации и публикации текста в социальные сети',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#A7D2FF',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}