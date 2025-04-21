"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { addProduct, updateProduct, getProductById } from "@/lib/firebase/products"
import { getCategories } from "@/lib/firebase/categories"
import { getBrands } from "@/lib/firebase/brands"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
const DEFAULT_COLORS = ["Black", "White", "Gray", "Red", "Blue", "Green"]
const DEFAULT_PLACEHOLDER_IMAGE = "/placeholder.svg"

export default function ProductForm({ productId = null }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(!!productId)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    inventory: "",
    brand: "",
    sizes: [...DEFAULT_SIZES],
    colors: [...DEFAULT_COLORS],
    categoryIds: [],
    featured: false,
    features: [],
    additionalImages: [],
    rating: 0,
    reviewCount: 0,
    image: DEFAULT_PLACEHOLDER_IMAGE, // Default image URL
  })
  const [imageUrl, setImageUrl] = useState("")
  const [newFeature, setNewFeature] = useState("")
  const [newSize, setNewSize] = useState("")
  const [newColor, setNewColor] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const fetchedCategories = await getCategories()
        setCategories(fetchedCategories)

        // Fetch brands
        const fetchedBrands = await getBrands()
        setBrands(fetchedBrands)

        // If editing, fetch product data
        if (productId) {
          const product = await getProductById(productId)
          if (product) {
            setFormData({
              name: product.name || "",
              description: product.description || "",
              price: product.price?.toString() || "",
              inventory: product.inventory?.toString() || "",
              brand: product.brand || "",
              sizes: product.sizes || [...DEFAULT_SIZES],
              colors: product.colors || [...DEFAULT_COLORS],
              categoryIds: product.categoryIds || [],
              featured: product.featured || false,
              features: product.features || [],
              additionalImages: product.additionalImages || [],
              rating: product.rating || 0,
              reviewCount: product.reviewCount || 0,
              image: product.image || DEFAULT_PLACEHOLDER_IMAGE,
            })
            setImageUrl(product.image || "")
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setInitialLoading(false)
      }
    }

    fetchData()
  }, [productId, toast])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => {
      const categoryIds = prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId]

      return {
        ...prev,
        categoryIds,
      }
    })
  }

  const handleImageUrlChange = (e) => {
    const url = e.target.value
    setImageUrl(url)
    setFormData({
      ...formData,
      image: url || DEFAULT_PLACEHOLDER_IMAGE,
    })
  }

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      })
      setNewFeature("")
    }
  }

  const handleRemoveFeature = (index) => {
    const updatedFeatures = [...formData.features]
    updatedFeatures.splice(index, 1)
    setFormData({
      ...formData,
      features: updatedFeatures,
    })
  }

  const handleAddSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, newSize.trim()],
      })
      setNewSize("")
    }
  }

  const handleRemoveSize = (size) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((s) => s !== size),
    })
  }

  const handleAddColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData({
        ...formData,
        colors: [...formData.colors, newColor.trim()],
      })
      setNewColor("")
    }
  }

  const handleRemoveColor = (color) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((c) => c !== color),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        inventory: Number.parseInt(formData.inventory, 10),
      }

      if (productId) {
        await updateProduct(productId, productData, imageUrl)
        toast({
          title: "Product updated",
          description: "The product has been updated successfully.",
        })
      } else {
        await addProduct(productData, imageUrl)
        toast({
          title: "Product added",
          description: "The new product has been added successfully.",
        })
      }

      router.push("/admin/products")
    } catch (error) {
      console.error("Error saving product:", error)
      setError(error.message || "Failed to save product. Please try again.")
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{productId ? "Редактирай продукт" : "Добави нов продукт"}</CardTitle>
        <CardDescription>
          {productId ? "Update the product details below." : "Запишете детайлите за да създадете продукт."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Грешка</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Име на продукт</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Цена (лв)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inventory">Инвентар</Label>
              <Input
                id="inventory"
                name="inventory"
                type="number"
                min="0"
                value={formData.inventory}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Бранд</Label>
            <Select value={formData.brand} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Изберете бранд" />
              </SelectTrigger>
              <SelectContent>
                {brands.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Няма налични брандове.
                    <a href="/admin/brands" className="text-primary hover:underline ml-1">
                      Добави брандове
                    </a>
                  </div>
                ) : (
                  brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.name}>
                      {brand.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Снимка на продукта</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={imageUrl}
              onChange={handleImageUrlChange}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
            Въведете директен URL адрес към изображението на вашия продукт. Оставете празно, за да използвате изображение на заместител.
            </p>
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image || "/placeholder.svg"}
                  alt="Product preview"
                  className="h-40 w-40 object-cover rounded-md border"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE
                    setFormData({
                      ...formData,
                      image: DEFAULT_PLACEHOLDER_IMAGE,
                    })
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Характеристики</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Добави Характеристики"
              />
              <Button type="button" onClick={handleAddFeature}>
                Добави
              </Button>
            </div>
            {formData.features.length > 0 && (
              <div className="mt-2 space-y-2">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <span>{feature}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFeature(index)}>
                     Премахни
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Размери</Label>
            <div className="flex gap-2">
              <Input value={newSize} onChange={(e) => setNewSize(e.target.value)} placeholder="Добави размер" />
              <Button type="button" onClick={handleAddSize}>
                Добави
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.sizes.map((size) => (
                <div key={size} className="flex items-center bg-muted px-3 py-1 rounded-md">
                  <span>{size}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-1"
                    onClick={() => handleRemoveSize(size)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Colors</Label>
            <div className="flex gap-2">
              <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="Добави цвят" />
              <Button type="button" onClick={handleAddColor}>
                Добави
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.colors.map((color) => (
                <div key={color} className="flex items-center bg-muted px-3 py-1 rounded-md">
                  <span>{color}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 ml-1"
                    onClick={() => handleRemoveColor(color)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Категории</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={formData.categoryIds.includes(category.id)}
                    onCheckedChange={() => handleCategoryChange(category.id)}
                  />
                  <Label htmlFor={`category-${category.id}`} className="font-normal">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Няма открити категории.{" "}
                <a href="/admin/categories" className="text-primary hover:underline">
                  Добави категории
                </a>{" "}
                Първи.
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              name="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })}
            />
            <Label htmlFor="featured" className="font-normal">
            Представен продукт (ще бъде показан на началната страница)
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.push("/admin/products")}>
            Откажи
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {productId ? "Update Product" : "Добави продукт"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
