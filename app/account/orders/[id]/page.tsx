"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Package } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency } from "@/lib/utils"
import { getOrderById } from "@/lib/firebase/orders"
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

export default function OrderDetailsPage() {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const orderId = params.id

  useEffect(() => {
    // Redirect if not logged in
    if (user === null) {
      router.push(`/login?redirect=/account/orders/${orderId}`)
      return
    }

    async function fetchOrder() {
      try {
        setLoading(true)
        const orderData = await getOrderById(orderId)

        // Check if order exists and belongs to the current user
        if (!orderData) {
          setError("Order not found")
          return
        }

        if (orderData.userId !== user?.uid) {
          setError("You don't have permission to view this order")
          return
        }

        // Serialize the Firestore data to remove non-serializable objects
        const serializedOrder = serializeData(orderData)
        setOrder(serializedOrder)
      } catch (err) {
        console.error("Error fetching order:", err)
        setError("Failed to load order details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchOrder()
    }
  }, [orderId, user, router])

  // Render loading state
  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Skeleton className="h-7 w-64" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex justify-between border-b pb-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-16 w-16 rounded" />
                        <div>
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <Link href="/account/orders">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>

        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>

        <div className="mt-6">
          <p className="text-muted-foreground">If you believe this is an error, please contact customer support.</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container max-w-4xl py-8">
        <Link href="/account/orders">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>

        <div className="text-center py-12 border rounded-lg">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground">We couldn't find the order you're looking for.</p>
          <Link href="/account/orders">
            <Button className="mt-4">View All Orders</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8">
      <Link href="/account/orders">
        <Button variant="ghost" size="sm" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order #{order.id}</h1>
        <div className="mt-2 sm:mt-0">
          <Badge
            variant={order.status === "Delivered" ? "default" : order.status === "Shipped" ? "secondary" : "outline"}
          >
            {order.status}
          </Badge>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex justify-between border-b pb-4 last:border-0">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {order.shippingAddress && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal || order.total)}</span>
              </div>

              {order.shipping > 0 && (
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.shipping)}</span>
                </div>
              )}

              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
              )}

              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>

              {order.paymentMethod && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-1">Payment Method</p>
                    <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button className="w-full">Need Help?</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
