import { notFound } from "next/navigation"
import { Suspense } from "react"
import ProductFilters from "@/components/product-filters"
import ProductGrid from "@/components/product-grid"
import ProductsLoading from "@/components/products-loading"
import { getCategories } from "@/lib/firebase/categories"

export async function generateStaticParams() {
  try {
    const categories = await getCategories()
    return categories.map((category) => ({
      slug: category.slug,
    }))
  } catch (error) {
    console.error("Error generating static params:", error)
    return []
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = params
  let category = null
  let error = null

  try {
    // Fetch all categories
    const categories = await getCategories()

    // Find the current category by slug
    category = categories.find((cat) => cat.slug === slug)
  } catch (err) {
    error = "Failed to load category. Please try again later."
    console.error("Error loading category:", err)
  }

  if (error) {
    return (
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="text-center py-12">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!category) {
    notFound()
  }

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <Suspense fallback={<ProductsLoading />}>
            <ProductFilters categoryId={category.id} />
          </Suspense>
        </aside>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
          {category.description && <p className="text-gray-500 mb-6">{category.description}</p>}
          <Suspense fallback={<ProductsLoading />}>
            <ProductGrid categoryId={category.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
