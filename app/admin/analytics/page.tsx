"use client"

import AdminSidebar from "@/components/admin-sidebar"
import AdminAnalytics from "@/components/admin-analytics"
import ProtectedRoute from "@/components/protected-route"

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute adminOnly>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminSidebar />

        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold">Анализ</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <AdminAnalytics />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
