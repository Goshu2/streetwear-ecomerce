"use client"

import { useState } from "react"
import AdminSidebar from "@/components/admin-sidebar"
import AdminOrders from "@/components/admin-orders"
import ProtectedRoute from "@/components/protected-route"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminOrderFilters from "@/components/admin-order-filters"

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState("all")

  return (
    <ProtectedRoute adminOnly>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminSidebar />

        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold">Поръчки</h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="all">Всички поръчки</TabsTrigger>
                  <TabsTrigger value="pending">Изчакващи</TabsTrigger>
                  <TabsTrigger value="processing">Обработвани</TabsTrigger>
                  <TabsTrigger value="shipped">Изпратени</TabsTrigger>
                  <TabsTrigger value="delivered">Доставени</TabsTrigger>
                  <TabsTrigger value="cancelled">Отказани</TabsTrigger>
                </TabsList>
                <AdminOrderFilters />
              </div>

              <TabsContent value="all">
                <AdminOrders filter="all" />
              </TabsContent>

              <TabsContent value="pending">
                <AdminOrders filter="Pending" />
              </TabsContent>

              <TabsContent value="processing">
                <AdminOrders filter="Processing" />
              </TabsContent>

              <TabsContent value="shipped">
                <AdminOrders filter="Shipped" />
              </TabsContent>

              <TabsContent value="delivered">
                <AdminOrders filter="Delivered" />
              </TabsContent>

              <TabsContent value="cancelled">
                <AdminOrders filter="Cancelled" />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
