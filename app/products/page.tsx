import { Suspense } from "react"
import ProductFilters from "@/components/product-filters"
import ProductGrid from "@/components/product-grid"
import ProductsLoading from "@/components/products-loading"

export default function ProductsPage() {
  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <h1 className="text-3xl font-bold mb-6 md:hidden">Всички продукти</h1>
          <Suspense fallback={<ProductsLoading />}>
            <ProductFilters />
          </Suspense>
        </aside>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6 hidden md:block">Всички продукти</h1>
          <Suspense fallback={<ProductsLoading />}>
            <ProductGrid />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
