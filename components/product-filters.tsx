"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getBrands } from "@/lib/firebase/brands"
import { getCategories } from "@/lib/firebase/categories"

interface ProductFiltersProps {
  categoryId?: string
}

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

interface Filter {
  type: string
  label: string
  value: string
}

export default function ProductFilters({ categoryId }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<Filter[]>([])
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")

  // Common colors and sizes
  const colors = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Purple", "Orange", "Pink", "Brown", "Gray"]
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"]

  useEffect(() => {
    const category = searchParams.get("category")
    const color = searchParams.get("color")
    const size = searchParams.get("size")
    const min = searchParams.get("min")
    const max = searchParams.get("max")

    if (category) setSelectedCategories([category])
    if (color) setSelectedColors([color])
    if (size) setSelectedSizes([size])
    if (min) setMinPrice(min)
    if (max) setMaxPrice(max)

    const fetchData = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData || [])
        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  const handleFilterChange = (type: string, value: string) => {
    const newParams = new URLSearchParams(searchParams.toString())

    if (type === "category") {
      const newCategories = selectedCategories.includes(value)
        ? selectedCategories.filter(c => c !== value)
        : [...selectedCategories, value]
      setSelectedCategories(newCategories)
      newParams.set("category", newCategories.join(","))
    } else if (type === "color") {
      const newColors = selectedColors.includes(value)
        ? selectedColors.filter(c => c !== value)
        : [...selectedColors, value]
      setSelectedColors(newColors)
      newParams.set("color", newColors.join(","))
    } else if (type === "size") {
      const newSizes = selectedSizes.includes(value)
        ? selectedSizes.filter(s => s !== value)
        : [...selectedSizes, value]
      setSelectedSizes(newSizes)
      newParams.set("size", newSizes.join(","))
    }

    router.push(`?${newParams.toString()}`)
  }

  const handlePriceChange = (value: number[]) => {
    const newPriceRange = [value[0], value[1]] as [number, number]
    setPriceRange(newPriceRange)
    updateActiveFilters(
      newPriceRange,
      selectedCategories,
      selectedBrands,
      selectedColors,
      selectedSizes
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedColors([])
    setSelectedSizes([])
    setMinPrice("")
    setMaxPrice("")
    router.push("/products")
  }

  const handleRemoveFilter = (filter: Filter) => {
    switch (filter.type) {
      case "price":
        setPriceRange([0, 1000])
        break
      case "category":
        setSelectedCategories((prev) => prev.filter((id) => id !== filter.value))
        break
      case "brand":
        setSelectedBrands((prev) => prev.filter((id) => id !== filter.value))
        break
      case "color":
        setSelectedColors((prev) => prev.filter((color) => color !== filter.value))
        break
      case "size":
        setSelectedSizes((prev) => prev.filter((size) => size !== filter.value))
        break
    }
  }

  const updateActiveFilters = (
    priceRange: [number, number],
    categoryIds: string[],
    brandIds: string[],
    colorValues: string[],
    sizeValues: string[]
  ) => {
    const filters: Filter[] = []

    if (priceRange[0] > 0 || priceRange[1] < 1000) {
      filters.push({
        type: "price",
        label: `$${priceRange[0]} - $${priceRange[1]}`,
        value: `${priceRange[0]}-${priceRange[1]}`
      })
    }

    categoryIds.forEach((id) => {
      const category = categories.find((c) => c.id === id)
      if (category) {
        filters.push({
          type: "category",
          label: category.name,
          value: id
        })
      }
    })

    brandIds.forEach((id) => {
      const brand = brands.find((b) => b.id === id)
      if (brand) {
        filters.push({
          type: "brand",
          label: brand.name,
          value: id
        })
      }
    })

    colorValues.forEach((color) => {
      filters.push({
        type: "color",
        label: color,
        value: color
      })
    })

    sizeValues.forEach((size) => {
      filters.push({
        type: "size",
        label: size,
        value: size
      })
    })

    setActiveFilters(filters)
  }

  const applyFilters = () => {
    // Create a new URLSearchParams object
    const params = new URLSearchParams()

    // Add price range if not default
    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString())
    }
    if (priceRange[1] < 1000) {
      params.set("maxPrice", priceRange[1].toString())
    }

    // Add categories if selected
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","))
    }

    // Add brands if selected
    if (selectedBrands.length > 0) {
      params.set("brands", selectedBrands.join(","))
    }

    // Add colors if selected
    if (selectedColors.length > 0) {
      params.set("colors", selectedColors.join(","))
    }

    // Add sizes if selected
    if (selectedSizes.length > 0) {
      params.set("sizes", selectedSizes.join(","))
    }

    // Preserve search term if it exists
    const search = searchParams.get("search")
    if (search) {
      params.set("search", search)
    }

    // Update the URL with the new params
    const queryString = params.toString()
    router.push(`/products${queryString ? `?${queryString}` : ""}`)

    // Close the filter sheet
    setIsOpen(false)

    // Update active filters display
    updateActiveFilters(priceRange, selectedCategories, selectedBrands, selectedColors, selectedSizes)
  }

  const activeFilterCount = activeFilters.length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 border-dashed">
              <Filter className="mr-2 h-4 w-4" />
              Филтрирай продукти
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[300px] sm:w-[400px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Филтрирай продукти</SheetTitle>
              <SheetDescription>Стеснете продуктите чрез прилагане на филтри</SheetDescription>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Цена</h3>
                <div className="px-2">
                  <Slider
                    defaultValue={priceRange}
                    min={0}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={(value) => handlePriceChange(value)}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm">${priceRange[0]}</span>
                    <span className="text-sm">${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Категории</h3>
                {loading ? (
                  <div className="text-sm text-muted-foreground">Зарежда категории...</div>
                ) : categories.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Няма налични категории</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleFilterChange("category", category.id)}
                        />
                        <Label htmlFor={`category-${category.id}`} className="text-sm font-normal">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Брандове</h3>
                {loading ? (
                  <div className="text-sm text-muted-foreground">Зарежда брандове...</div>
                ) : brands.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Няма налични брандове</div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {brands.map((brand) => (
                      <div key={brand.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`brand-${brand.id}`}
                          checked={selectedBrands.includes(brand.name)}
                          onCheckedChange={() => handleFilterChange("brand", brand.name)}
                        />
                        <Label htmlFor={`brand-${brand.id}`} className="text-sm font-normal">
                          {brand.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Цветове</h3>
                <div className="grid grid-cols-2 gap-2">
                  {colors.map((color) => (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox
                        id={`color-${color}`}
                        checked={selectedColors.includes(color)}
                        onCheckedChange={() => handleFilterChange("color", color)}
                      />
                      <Label htmlFor={`color-${color}`} className="text-sm font-normal">
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Размери</h3>
                <div className="grid grid-cols-2 gap-2">
                  {sizes.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={`size-${size}`}
                        checked={selectedSizes.includes(size)}
                        onCheckedChange={() => handleFilterChange("size", size)}
                      />
                      <Label htmlFor={`size-${size}`} className="text-sm font-normal">
                        {size}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <SheetFooter>
              <SheetTrigger asChild>
                <Button type="submit" onClick={applyFilters}>
                  Филтрирай
                </Button>
              </SheetTrigger>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}