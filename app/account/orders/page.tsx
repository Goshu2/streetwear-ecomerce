"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Eye } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { getOrdersByUser } from "@/lib/firebase/orders"
import { useAuth } from "@/components/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"

// Helper function to serialize Firestore data
function serializeData(data) {
  if (!data) return null

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => serializeData(item))
  }

  // Handle objects
  if (typeof data === "object" && data !== null) {
    // Handle Firestore Timestamp objects
    if (data.seconds !== undefined && data.nanoseconds !== undefined) {
      // Convert to milliseconds timestamp
      return new Date(data.seconds * 1000 + data.nanoseconds / 1000000).toISOString()
    }

    // Handle regular objects
    const result = {}
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeData(value)
    }
    return result
  }

  // Return primitive values as is
  return data
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect if not logged in
    if (user === null) {
      router.push("/login?redirect=/account/orders")
      return
    }

    async function fetchOrders() {
      try {
        setLoading(true)
        if (user?.uid) {
          const userOrders = await getOrdersByUser(user.uid)
          // Serialize the Firestore data to remove non-serializable objects
          const serializedOrders = serializeData(userOrders)
          setOrders(serializedOrders)
        }
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Failed to load your orders. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrders()
    }
  }, [user, router])

  // Render loading state
  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-24 mt-2 sm:mt-0" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-9 w-28 mt-2 sm:mt-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

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
                    <h3 className="font-semibold">{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
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
                      {order.items?.length || 0} {order.items?.length === 1 ? "item" : "items"}
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
