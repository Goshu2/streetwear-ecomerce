import Link from "next/link"
import { getCategories } from "@/lib/firebase/categories"

export default async function CategoriesPage() {
  let categories = []
  let error = null

  try {
    categories = await getCategories()
  } catch (err) {
    error = "Failed to load categories. Please try again later."
    console.error("Error loading categories:", err)
  }

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Всички категории</h1>

      {error ? (
        <div className="text-center py-12">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Няма открити категории</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="group block">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-90 transition-opacity">
                <div className="flex h-full items-center justify-center bg-gray-200 p-4">
                  <span className="text-2xl font-bold">{category.name.charAt(0)}</span>
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-lg font-semibold group-hover:underline">{category.name}</h3>
                {category.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{category.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
