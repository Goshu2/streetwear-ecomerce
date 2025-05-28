import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import FeaturedCollection from "@/components/featured-collection"
import { getProducts } from "@/lib/firebase/products"
import { getCategories } from "@/lib/firebase/categories"

function toPlainTimestamp(timestamp: any) {
  if (!timestamp || typeof timestamp.toMillis !== "function") {
    return null
  }
  return timestamp.toMillis()
}

export default async function Home() {
  const productsRaw = await getProducts({
    limit: 4,
    sortBy: "rating",
    sortDirection: "desc",
  })

  const trendingProducts = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    rating: p.rating,
    imageUrl: p.imageUrl,
    categoryId: p.categoryId,
    createdAt: toPlainTimestamp(p.createdAt),
    updatedAt: toPlainTimestamp(p.updatedAt),
  }))

  const categoriesRaw = await getCategories()
  const categories = categoriesRaw.map((c) => ({
    ...c,
    createdAt: toPlainTimestamp(c.createdAt),
  }))

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[90vh] flex items-center justify-center text-white">
        <img
          src="/DivineGLoBanner.jpg"
          alt="Hero Background"
          className="absolute inset-0 w-full h-full object-cover brightness-110"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-4 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white drop-shadow-lg">
            ХОДИ С ВЯРАТА
          </h1>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/products">
              <button className="px-6 py-3 text-lg font-semibold text-white bg-black border border-white rounded-md shadow-md transition hover:bg-white hover:text-black">
                Пазарувай сега
                <ArrowRight className="ml-2 h-5 w-5 inline-block" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      

      {/* Trending Products */}
      <section className="w-full py-12 md:py-24 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">В тенденция сега</h2>
            <p className="max-w-[700px] mx-auto text-gray-500 md:text-xl">
              Виж всички продукти
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <Link href="/products">
              <Button size="lg">
                Виж всички продукти
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <FeaturedCollection />
    </div>
  )
}
