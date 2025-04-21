import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductReviews from "@/components/product-reviews"
import RelatedProducts from "@/components/related-products"
import AddToCartButton from "@/components/add-to-cart-button"
import { getProductById } from "@/lib/firebase/products"
import { formatCurrency } from "@/lib/utils"

export default async function ProductPage({ params }: { params: { id: string } }) {
  // Fetch product from Firebase
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  // Determine product status based on inventory
  const productStatus =
    product.inventory > 0 ? `In stock${product.inventory < 10 ? " (Low stock)" : " and ready to ship"}` : "Out of stock"

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Обратно към продукти
      </Link>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full object-cover aspect-square"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
          </div>
          {product.additionalImages && product.additionalImages.length > 0 ? (
            <div className="grid grid-cols-4 gap-4">
              {product.additionalImages.map((image, i) => (
                <div key={i} className="overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} - View ${i + 1}`}
                    className="w-full object-cover aspect-square"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={`${product.name} - View ${i + 1}`}
                    className="w-full object-cover aspect-square"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                <span className="ml-2 text-sm text-gray-600">
                  {product.rating ? product.rating.toFixed(1) : "No ratings"} ({product.reviewCount || 0} reviews)
                </span>
              </div>
              {product.brand && <div className="text-sm text-gray-600">Brand: {product.brand}</div>}
            </div>
          </div>

          <div className="text-2xl font-bold">{formatCurrency(product.price)}</div>

          <div className="space-y-4">
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <Button key={size} variant="outline" className="h-10 px-4">
                      {size}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <Button key={color} variant="outline" className="h-10 px-4">
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <AddToCartButton product={product} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              {productStatus}
            </div>
            <div className="text-sm text-gray-600">Безплатна доставка над 100лв.</div>
          </div>

          <Tabs defaultValue="description">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Описание</TabsTrigger>
              <TabsTrigger value="features">Характеристики</TabsTrigger>
              <TabsTrigger value="shipping">Доставка</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-4">
              <p>{product.description || "No description available."}</p>
            </TabsContent>
            <TabsContent value="features" className="pt-4">
              {product.features && product.features.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {product.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              ) : (
                <p>No feature details available.</p>
              )}
            </TabsContent>
            <TabsContent value="shipping" className="pt-4">
              <p>
              Поръчките обикновено се доставят в рамките на 3-5 работни дни. Безплатна стандартна доставка за поръчки над 100лв. Експресни
              налични опции за доставка при плащане.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ProductReviews productId={params.id} />

      <RelatedProducts
        category={product.name}
        currentProductId={params.id}
        categoryId={product.categoryIds?.[0] || null}
      />
    </div>
  )
}
