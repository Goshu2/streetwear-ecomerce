"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Box, DollarSign, Package, ShoppingCart, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminSidebar from "@/components/admin-sidebar"
import AdminProducts from "@/components/admin-products"
import AdminOrders from "@/components/admin-orders"
import AdminCustomers from "@/components/admin-customers"
import AdminAnalytics from "@/components/admin-analytics"
import AdminCategories from "@/components/admin-categories"
import AdminInitDb from "@/components/admin-init-db"
import ProtectedRoute from "@/components/protected-route"
import { getDashboardStats } from "@/lib/firebase/analytics"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const [selectedTab, setSelectedTab] = useState("products")
  const [stats, setStats] = useState({
    revenue: { total: 0, change: 0 },
    orders: { total: 0, change: 0 },
    products: { total: 0, new: 0 },
    customers: { total: 0, new: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const dashboardStats = await getDashboardStats()
        setStats(dashboardStats)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <ProtectedRoute adminOnly>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminSidebar />

        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <Link href="/admin" className="lg:hidden">
              <Package className="h-6 w-6" />
              <span className="sr-only">Табло за управление</span>
            </Link>
            <div className="ml-auto flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  Виж магазин
                </Button>
              </Link>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="flex flex-col gap-6">
              <h1 className="text-3xl font-bold">Табло за управление</h1>

              <AdminInitDb />

              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Общи приходи</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${Number.parseFloat(stats.revenue.total).toFixed(2)}</div>
                      <p className="text-xs text-muted-foreground">
                        {Number.parseFloat(stats.revenue.change) >= 0 ? "+" : ""}
                        {stats.revenue.change}% от последния месец
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Поръчки</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.orders.total}</div>
                      <p className="text-xs text-muted-foreground">
                        {Number.parseFloat(stats.orders.change) >= 0 ? "+" : ""}
                        {stats.orders.change}% от последния месец
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Продукти</CardTitle>
                      <Box className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.products.total}</div>
                      <p className="text-xs text-muted-foreground">+{stats.products.new} нови продукти</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Клиенти</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.customers.total}</div>
                      <p className="text-xs text-muted-foreground">+{stats.customers.new} този месец</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
                <TabsList>
                  <TabsTrigger value="products">Продукти</TabsTrigger>
                  <TabsTrigger value="categories">Категории</TabsTrigger>
                  <TabsTrigger value="orders">Поръчки</TabsTrigger>
                  <TabsTrigger value="customers">Клиенти</TabsTrigger>
                  <TabsTrigger value="analytics">Анализ</TabsTrigger>
                </TabsList>
                <TabsContent value="products" className="pt-6">
                  <AdminProducts />
                </TabsContent>
                <TabsContent value="categories" className="pt-6">
                  <AdminCategories />
                </TabsContent>
                <TabsContent value="orders" className="pt-6">
                  <AdminOrders />
                </TabsContent>
                <TabsContent value="customers" className="pt-6">
                  <AdminCustomers />
                </TabsContent>
                <TabsContent value="analytics" className="pt-6">
                  <AdminAnalytics />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
