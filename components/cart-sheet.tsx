"use client"

import Link from "next/link"
import { Minus, Plus, ShoppingCart, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCart } from "@/components/cart-provider"
import { formatCurrency } from "@/lib/utils"

export default function CartSheet() {
  const { cart, updateQuantity, removeFromCart } = useCart()

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  if (cart.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <SheetHeader className="px-4">
          <SheetTitle>Вашата количка</SheetTitle>
        </SheetHeader>
        <div className="flex flex-1 flex-col items-center justify-center space-y-4">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">Количката ти е празна</h3>
            <p className="text-sm text-muted-foreground">Добави продукти за да ги видиш тук.</p>
          </div>
          <Link href="/products">
            <Button>Продължи пазаруването</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <SheetHeader className="px-4">
        <SheetTitle>Вашата количка ({cart.length})</SheetTitle>
      </SheetHeader>
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 py-4">
          {cart.map((item) => (
            <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-start gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-md border">
                <img src={item.image || "/placeholder.svg"} alt={item.name} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item, Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                    <span className="sr-only">Намали количеството</span>
                  </Button>
                  <span className="text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                    <span className="sr-only">Увеличи количеството</span>
                  </Button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span>{formatCurrency(item.price * item.quantity)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => removeFromCart(item)}
                >
                  <Trash className="h-4 w-4" />
                  <span className="sr-only">Премахни</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-base font-medium">
            <span>Сума</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <p className="text-sm text-muted-foreground">Доставката и такси ще бъдат изчислени накрая.</p>
          <div className="flex flex-col gap-2">
            <Link href="/cart" className="w-full">
              <Button className="w-full">Виж количката</Button>
            </Link>
            <Link href="/checkout" className="w-full">
              <Button variant="outline" className="w-full">
                Плащане
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
