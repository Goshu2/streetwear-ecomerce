"use client"

import { useParams } from "next/navigation"
import AdminSidebar from "@/components/admin-sidebar"
import ProductForm from "@/components/product-form"
import ProtectedRoute from "@/components/protected-route"

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string

  return (
    <ProtectedRoute adminOnly>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminSidebar />

        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold">Редактиране на продукт</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <ProductForm productId={productId} />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
