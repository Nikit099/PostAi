export default function Loading() {
  return (
    <div className="container px-4 py-6 space-y-6">
      <div className="space-y-2 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>

      {/* Вкладки */}
      <div className="flex border-b">
        <div className="flex-1 py-3">
          <div className="h-6 bg-muted rounded w-24 mx-auto"></div>
        </div>
        <div className="flex-1 py-3">
          <div className="h-6 bg-muted rounded w-24 mx-auto"></div>
        </div>
      </div>

      {/* Контент */}
      <div className="space-y-6">
        <div className="h-[200px] bg-muted rounded-lg"></div>
        
        <div className="h-14 bg-muted rounded-lg"></div>
      </div>
    </div>
  )
}