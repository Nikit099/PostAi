import { Header } from '@/components/layout/Header'
// import { MobileNav } from '@/components/layout/MobileNav'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20">
        {children}
      </main>
      {/* <MobileNav /> */}
    </div>
  )
}