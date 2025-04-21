"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, ShoppingCart, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"
import { useSettings } from "@/components/settings-provider"

export default function CartPage() {
  const router = useRouter()
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart()
  const { settings } = useSettings()

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : 10
  const tax = subtotal * (settings.taxRate / 100)
  const total = subtotal + shipping + tax

  const handleCheckout = () => {
    router.push("/checkout")
  }

  if (cart.length === 0) {
    return (
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-6">Вашата количка</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Количката Ви е празна</h2>
          <p className="text-gray-500 mb-6">Не сте добавили нищо още в количката Ви.</p>
          <Link href="/products">
            <Button size="lg">Продължи да пазаруваш</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-6">Вашата количка</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <div className="flow-root">
                <ul className="divide-y">
                  {cart.map((item) => (
                    <li key={`${item.id}-${item.size}-${item.color}`} className="py-6 flex">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium">
                            <h3>
                              <Link href={`/product/${item.id}`} className="hover:underline">
                                {item.name}
                              </Link>
                            </h3>
                            <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.color && `Color: ${item.color}`} {item.size && `Size: ${item.size}`}
                          </p>
                        </div>

                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-2">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => removeFromCart(item)}
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            Премахни
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t px-6 py-4">
              <Button variant="outline" className="w-full" onClick={() => clearCart()}>
                Изчисти количката
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg border shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Резюме на поръчката</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Междинна сума</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Доставка</span>
                  <span>{shipping === 0 ? "Безплатна" : formatCurrency(shipping)}</span>
                </div>
                {shipping === 0 && (
                  <div className="text-xs text-green-600">
                    Безплатна доставка за поръчки над 100лв.{settings.freeShippingThreshold}
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Такси({settings.taxRate}%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold">
                  <span>Общо</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <Button className="w-full mt-6" size="lg" onClick={handleCheckout}>
               Продължете към плащане
              </Button>

              <div className="mt-4 text-center">
                <Link href="/products" className="text-sm text-gray-500 hover:underline">
                Или продължете с пазаруването
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
