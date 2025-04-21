"use client"

import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin-sidebar"
import AdminBrands from "@/components/admin-brands"
import ProtectedRoute from "@/components/protected-route"

export default function AdminBrandsPage() {
  const router = useRouter()

  return (
    <ProtectedRoute adminOnly>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminSidebar />

        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-xl font-semibold">Брандове</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <AdminBrands />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
