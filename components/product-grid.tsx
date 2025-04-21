"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "@/components/product-card"
import { getProducts } from "@/lib/firebase/products"
import { Loader2 } from "lucide-react"

export default function ProductGrid({ categoryId = null }) {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch products when component mounts or when search params change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)

        // Get search term if it exists
        const search = searchParams.get("search")

        // Fetch products from Firebase
        let fetchedProducts = []

        if (categoryId) {
          // If a category ID is provided, fetch products for that category
          fetchedProducts = await getProducts({
            categoryId,
            search: search || null,
          })
        } else {
          // Otherwise, fetch all products
          fetchedProducts = await getProducts({
            search: search || null,
          })
        }

        setProducts(fetchedProducts)
        console.log(fetchedProducts)
        // Apply filters to the fetched products
        applyFilters(fetchedProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryId, searchParams])

  // Apply filters whenever search params or products change
  useEffect(() => {
    if (products.length > 0) {
      applyFilters(products)
    }
  }, [searchParams, products])

  const applyFilters = (productsToFilter) => {
    // Get filter values from URL params
    const minPrice = searchParams.get("minPrice") ? Number.parseFloat(searchParams.get("minPrice")) : 0
    const maxPrice = searchParams.get("maxPrice")
      ? Number.parseFloat(searchParams.get("maxPrice"))
      : Number.POSITIVE_INFINITY
    const categoryIds = searchParams.get("categories") ? searchParams.get("categories").split(",") : []
    const brandIds = searchParams.get("brands") ? searchParams.get("brands").split(",") : []
    const colors = searchParams.get("colors") ? searchParams.get("colors").split(",") : []
    const sizes = searchParams.get("sizes") ? searchParams.get("sizes").split(",") : []

    // Apply all filters to the products
    const filtered = productsToFilter.filter((product) => {
      // Price filter
      if (product.price < minPrice || product.price > maxPrice) {
        return false
      }

      // Category filter
      if (
        categoryIds.length > 0 &&
        (!product.categoryIds || !categoryIds.some((id) => product.categoryIds.includes(id)))
      ) {
        return false
      }

      // Brand filter (fixed: use product.brand)
      if (brandIds.length > 0 && (!product.brand || !brandIds.includes(product.brand))) {
        return false
      }

      // Color filter
      if (colors.length > 0 && (!product.colors || !colors.some((color) => product.colors.includes(color)))) {
        return false
      }

      // Size filter
      if (sizes.length > 0 && (!product.sizes || !sizes.some((size) => product.sizes.includes(size)))) {
        return false
      }

      return true
    })

    setFilteredProducts(filtered)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Няма открити продукти</h3>
        <p className="text-muted-foreground mt-2">
          {categoryId
            ? "Няма продукти в тази категория, отговарящи на вашите филтри."
            : "Няма продукти, отговарящи на вашите филтри."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
