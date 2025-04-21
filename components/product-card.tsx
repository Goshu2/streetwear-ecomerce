"use client"

import type React from "react"
import Link from "next/link"
import { ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/components/cart-provider"

type Product = {
  id: string
  name: string
  price: number
  image?: string
  rating?: number
  brand?: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  return (
    <div className="group relative">
      <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View Product</span>
      </Link>

      <div className="overflow-hidden rounded-lg">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-[300px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg"
          }}
        />
      </div>

      <div className="mt-4 flex flex-col">
        {product.brand && <span className="text-sm text-gray-500">{product.brand}</span>}

        <h3 className="text-base font-medium">{product.name}</h3>

        <div className="mt-1 flex items-center justify-between">
          <span className="font-semibold">{formatCurrency(product.price)}</span>
          {product.rating && (
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 text-sm text-gray-600">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      <Button
        size="sm"
        className="absolute bottom-0 right-0 z-20 mb-4 mr-4 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleAddToCart}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to Cart
      </Button>
    </div>
  )
}
