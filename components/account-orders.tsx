"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Eye, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { getOrdersByUser } from "@/lib/firebase/orders"
import { useToast } from "@/components/ui/use-toast"

export default function AccountOrders() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.uid) return

      try {
        setLoading(true)
        const userOrders = await getOrdersByUser(user.uid)
        setOrders(userOrders)
      } catch (err) {
        console.error("Error fetching orders:", err)
        toast({
          title: "Error",
          description: "Failed to load your orders. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          <Link href="/products">
            <Button className="mt-4">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border shadow-sm">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{order.orderNumber}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.createdAt?.toDate
                        ? new Date(order.createdAt.toDate()).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                    </p>
                  </div>
                  <Badge
                    className="mt-2 sm:mt-0 w-fit"
                    variant={
                      order.status === "Delivered" ? "default" : order.status === "Shipped" ? "secondary" : "outline"
                    }
                  >
                    {order.status}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                  </div>
                  <Link href={`/account/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                      <Eye className="mr-2 h-4 w-4" />
                      View Order
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
