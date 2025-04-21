import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore"
import { db } from "./config"

// Interface for product filtering options
interface ProductFilterOptions {
  search?: string | null
  categoryId?: string | null
  brandId?: string | null
  minPrice?: number | null
  maxPrice?: number | null
  colors?: string[] | null
  sizes?: string[] | null
  sortBy?: string
  sortDirection?: "asc" | "desc"
  limit?: number
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  rating?: number
  imageUrl?: string
  categoryId?: string
  createdAt?: any
  updatedAt?: any
}

// Get products with filtering
export async function getProducts(options: ProductFilterOptions = {}): Promise<Product[]> {
  try {
    const {
      search = null,
      categoryId = null,
      brandId = null,
      minPrice = null,
      maxPrice = null,
      sortBy = "createdAt",
      sortDirection = "desc",
      limit: queryLimit = 100,
    } = options

    // Start building the query
    let productsQuery = collection(db, "products")
    const constraints = []

    // Add sorting
    constraints.push(orderBy(sortBy, sortDirection))

    // Add limit
    constraints.push(limit(queryLimit))

    // Apply server-side filters where possible
    if (brandId) {
      constraints.unshift(where("brandId", "==", brandId))
    }

    // Apply the constraints to the query
    // Always use query() to ensure consistent types
    const finalQuery = constraints.length > 0
      ? query(productsQuery, ...constraints)
      : query(productsQuery)

    // Execute the query
    const productsSnapshot = await getDocs(finalQuery)

    // Get all products
    let products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[]

    // Apply client-side filtering for more complex filters
    if (search) {
      const searchLower = search.toLowerCase()
      products = products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchLower) || product.description?.toLowerCase().includes(searchLower),
      )
    }

    if (categoryId) {
      products = products.filter((product) => product.categoryId === categoryId)
    }

    if (minPrice !== null) {
      products = products.filter((product) => product.price >= minPrice)
    }

    if (maxPrice !== null) {
      products = products.filter((product) => product.price <= maxPrice)
    }

    return products
  } catch (error) {
    console.error("Error getting products:", error)
    throw error
  }
}

// Get products by category
export async function getProductsByCategory(categoryId: string) {
  try {
    return getProducts({ categoryId })
  } catch (error) {
    console.error("Error getting products by category:", error)
    throw error
  }
}

// Get a single product by ID
export async function getProductById(id: string) {
  try {
    const productDoc = doc(db, "products", id)
    const productSnapshot = await getDoc(productDoc)

    if (productSnapshot.exists()) {
      return {
        id: productSnapshot.id,
        ...productSnapshot.data(),
      }
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting product:", error)
    throw error
  }
}

// Add a new product
export async function addProduct(productData: {
  name: string;
  price: number;
  description: string;
  categoryId: string;
}, imageUrl: string | null = null) {
  try {
    // Add product to Firestore
    const productToAdd = {
      ...productData,
      ...(imageUrl && { image: imageUrl }),
      createdAt: new Date(),
    }

    const docRef = await addDoc(collection(db, "products"), productToAdd)
    return {
      id: docRef.id,
      ...productToAdd,
    }
  } catch (error) {
    console.error("Error adding product:", error)
    throw error
  }
}

// Update a product
export async function updateProduct(id: string, productData: {
  name: string;
  price: number;
  description: string;
  categoryId: string;
}, imageUrl: string | null = null) {
  try {
    // Get the existing product first
    const existingProduct = await getProductById(id)
    if (!existingProduct) {
      throw new Error(`Product with ID ${id} not found`)
    }

    // Update product in Firestore
    const productToUpdate = {
      name: productData.name,
      price: productData.price,
      description: productData.description,
      categoryId: productData.categoryId,
      ...(imageUrl ? { image: imageUrl } : {}), // Only update image if a new URL is provided
      updatedAt: new Date(),
    }

    const productRef = doc(db, "products", id)
    await updateDoc(productRef, productToUpdate)

    return {
      id,
      ...productToUpdate,
    }
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

// Delete a product
export async function deleteProduct(id: string) {
  try {
    const productRef = doc(db, "products", id)
    await deleteDoc(productRef)
    return true
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

export async function getFeaturedProducts(count = 4) {
  try {
    const productsCollection = collection(db, "products")
    const q = query(productsCollection, where("featured", "==", true), limit(count))
    const productsSnapshot = await getDocs(q)

    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return products
  } catch (error) {
    console.error("Error getting featured products:", error)
    return []
  }
}

// Get related products
export async function getRelatedProducts(categoryId: string, currentProductId: string, count = 4) {
  try {
    const productsCollection = collection(db, "products")
    const q = query(
      productsCollection,
      where("categoryIds", "array-contains", categoryId),
      where("__name__", "!=", currentProductId),
      limit(count),
    )

    const productsSnapshot = await getDocs(q)

    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return products
  } catch (error) {
    console.error("Error getting related products:", error)
    return []
  }
}
