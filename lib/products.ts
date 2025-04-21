import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, limit } from "firebase/firestore"
import { db } from "./config"

// Get all products
export async function getProducts() {
  try {
    const productsCollection = collection(db, "products")
    const productsSnapshot = await getDocs(productsCollection)
    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return products
  } catch (error) {
    console.error("Error getting products:", error)
    throw error
  }
}

// Get products by category
export async function getProductsByCategory(categoryId: never) {
  try {
    const productsCollection = collection(db, "products")
    const productsSnapshot = await getDocs(productsCollection)

    // Filter products that have the category ID in their categoryIds array
    const products = productsSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((product) => product.categoryIds && product.categoryIds.includes(categoryId))

    return products
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
export async function addProduct(productData, imageUrl = null) {
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
export async function updateProduct(id, productData, imageUrl = null) {
  try {
    // Update product in Firestore
    const productToUpdate = {
      ...productData,
      ...(imageUrl && { image: imageUrl }),
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
export async function getRelatedProducts(categoryId, currentProductId, count = 4) {
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
