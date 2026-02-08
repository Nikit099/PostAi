'use client'

import { useState, useRef, useEffect } from 'react'
import { Smile, Type, Hash, Bold, Italic, List, Link } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  maxHeight?: string
  showToolbar?: boolean
  className?: string
}

const popularEmojis = [
  '🔥', '😊', '🎯', '💡', '🚀', '✨', '👏', '📈', '💪', '🌟',
  '📢', '🎉', '🤔', '👍', '❤️', '😍', '😂', '😎', '🤩', '🙌'
]

const hashtagSuggestions = [
  'продуктивность', 'мотивация', 'развитие', 'успех', 'бизнес',
  'стартап', 'маркетинг', 'контент', 'соцсети', 'тренды'
]

export function TextEditor({
  value,
  onChange,
  placeholder = 'Начните писать...',
  minHeight = '200px',
  maxHeight = '400px',
  showToolbar = true,
  className,
}: TextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false)

  const insertText = (text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = value.substring(0, start) + text + value.substring(end)
    
    onChange(newValue)
    
    // Фокусируем и устанавливаем курсор после вставленного текста
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const formatText = (format: 'bold' | 'italic' | 'list' | 'link') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let formattedText = ''
    let newCursorPos = start

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'жирный текст'}**`
        newCursorPos = start + (selectedText ? 2 : 0)
        break
      case 'italic':
        formattedText = `*${selectedText || 'курсивный текст'}*`
        newCursorPos = start + (selectedText ? 1 : 0)
        break
      case 'list':
        formattedText = selectedText 
          ? selectedText.split('\n').map(line => `• ${line}`).join('\n')
          : '• пункт списка'
        break
      case 'link':
        formattedText = `[${selectedText || 'текст ссылки'}](https://example.com)`
        newCursorPos = start + (selectedText ? 1 : 0)
        break
    }

    const newValue = value.substring(0, start) + formattedText + value.substring(end)
    onChange(newValue)

    // Фокусируем и устанавливаем курсор
    setTimeout(() => {
      textarea.focus()
      if (selectedText) {
        textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length)
      } else {
        const pos = format === 'list' ? start + formattedText.length : newCursorPos
        textarea.setSelectionRange(pos, pos)
      }
    }, 0)
  }

  const insertHashtag = (hashtag: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart
    const textBeforeCursor = value.substring(0, cursorPos)
    const textAfterCursor = value.substring(cursorPos)

    // Проверяем, есть ли уже хештег перед курсором
    const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ')
    const lastNewlineIndex = textBeforeCursor.lastIndexOf('\n')
    const lastSeparatorIndex = Math.max(lastSpaceIndex, lastNewlineIndex)
    
    const wordBeforeCursor = textBeforeCursor.substring(lastSeparatorIndex + 1)
    
    let newValue = ''
    let newCursorPos = cursorPos

    if (wordBeforeCursor.startsWith('#')) {
      // Заменяем текущий хештег
      newValue = textBeforeCursor.substring(0, lastSeparatorIndex + 1) + 
                `#${hashtag} ` + textAfterCursor
      newCursorPos = lastSeparatorIndex + 1 + hashtag.length + 2
    } else {
      // Добавляем новый хештег
      newValue = textBeforeCursor + ` #${hashtag} ` + textAfterCursor
      newCursorPos = cursorPos + hashtag.length + 2
    }

    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Автоматическое увеличение высоты textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const newHeight = Math.max(
      parseInt(minHeight),
      Math.min(textarea.scrollHeight, parseInt(maxHeight))
    )
    textarea.style.height = `${newHeight}px`
  }, [value, minHeight, maxHeight])

  return (
    <div className={cn('space-y-3', className)}>
      {showToolbar && (
        <Card className="p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={cn(
                'p-2 rounded hover:bg-accent transition-colors',
                showEmojiPicker && 'bg-accent'
              )}
              title="Вставить эмодзи"
            >
              <Smile className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowHashtagSuggestions(!showHashtagSuggestions)}
              className={cn(
                'p-2 rounded hover:bg-accent transition-colors',
                showHashtagSuggestions && 'bg-accent'
              )}
              title="Вставить хештег"
            >
              <Hash className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-border" />

            <button
              onClick={() => formatText('bold')}
              className="p-2 rounded hover:bg-accent transition-colors"
              title="Жирный текст"
            >
              <Bold className="w-4 h-4" />
            </button>

            <button
              onClick={() => formatText('italic')}
              className="p-2 rounded hover:bg-accent transition-colors"
              title="Курсив"
            >
              <Italic className="w-4 h-4" />
            </button>

            <button
              onClick={() => formatText('list')}
              className="p-2 rounded hover:bg-accent transition-colors"
              title="Список"
            >
              <List className="w-4 h-4" />
            </button>

            <button
              onClick={() => formatText('link')}
              className="p-2 rounded hover:bg-accent transition-colors"
              title="Ссылка"
            >
              <Link className="w-4 h-4" />
            </button>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex flex-wrap gap-2">
                {popularEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      insertText(emoji)
                      setShowEmojiPicker(false)
                    }}
                    className="w-8 h-8 rounded hover:bg-accent transition-colors text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hashtag Suggestions */}
          {showHashtagSuggestions && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex flex-wrap gap-2">
                {hashtagSuggestions.map((hashtag) => (
                  <button
                    key={hashtag}
                    onClick={() => {
                      insertHashtag(hashtag)
                      setShowHashtagSuggestions(false)
                    }}
                    className="px-3 py-1 rounded-full bg-muted hover:bg-accent transition-colors text-sm"
                  >
                    #{hashtag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 rounded-lg border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary-blue/20"
          style={{
            minHeight,
            maxHeight,
          }}
          rows={5}
        />
        
        {/* Счетчик символов */}
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {value.length} символов
        </div>
      </div>

      {/* Предпросмотр Markdown (опционально) */}
      {value.includes('*') || value.includes('**') || value.includes('[') ? (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Type className="w-4 h-4" />
            <span className="text-sm font-medium">Предпросмотр</span>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {value
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
              .replace(/\n/g, '<br>')
              .replace(/• (.*?)(?=\n|$)/g, '<li>$1</li>')
            }
          </div>
        </Card>
      ) : null}
    </div>
  )
}