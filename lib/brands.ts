import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./config"

// Brand interface
export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  website?: string
  logo?: string
  createdAt?: any
  updatedAt?: any
}

// Get all brands
export async function getBrands(): Promise<Brand[]> {
  try {
    const brandsCollection = collection(db, "brands")
    const q = query(brandsCollection, orderBy("name"))
    const brandsSnapshot = await getDocs(q)
    const brands = brandsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Brand[]
    return brands
  } catch (error) {
    console.error("Error getting brands:", error)
    return []
  }
}

// Get a single brand by ID
export async function getBrandById(id: string): Promise<Brand | null> {
  try {
    const brandDoc = doc(db, "brands", id)
    const brandSnapshot = await getDoc(brandDoc)

    if (brandSnapshot.exists()) {
      return {
        id: brandSnapshot.id,
        ...brandSnapshot.data(),
      } as Brand
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting brand:", error)
    return null
  }
}

// Get a single brand by slug
export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  try {
    const brandsCollection = collection(db, "brands")
    const q = query(brandsCollection, where("slug", "==", slug))
    const brandSnapshot = await getDocs(q)

    if (!brandSnapshot.empty) {
      const doc = brandSnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data(),
      } as Brand
    } else {
      return null
    }
  } catch (error) {
    console.error("Error getting brand by slug:", error)
    return null
  }
}

// Add a new brand
export async function addBrand(brandData: Omit<Brand, "id" | "createdAt" | "updatedAt">): Promise<Brand> {
  try {
    const brandToAdd = {
      ...brandData,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, "brands"), brandToAdd)
    return {
      id: docRef.id,
      ...brandToAdd,
    } as Brand
  } catch (error) {
    console.error("Error adding brand:", error)
    throw error
  }
}

// Update a brand
export async function updateBrand(id: string, brandData: Partial<Brand>): Promise<Brand> {
  try {
    const brandToUpdate = {
      ...brandData,
      updatedAt: serverTimestamp(),
    }

    const brandRef = doc(db, "brands", id)
    await updateDoc(brandRef, brandToUpdate)

    return {
      id,
      ...brandToUpdate,
    } as Brand
  } catch (error) {
    console.error("Error updating brand:", error)
    throw error
  }
}

// Delete a brand
export async function deleteBrand(id: string): Promise<boolean> {
  try {
    const brandRef = doc(db, "brands", id)
    await deleteDoc(brandRef)
    return true
  } catch (error) {
    console.error("Error deleting brand:", error)
    throw error
  }
}

// Get products by brand
export async function getProductsByBrand(brandName: string): Promise<any[]> {
  try {
    const productsCollection = collection(db, "products")
    const q = query(productsCollection, where("brand", "==", brandName))
    const productsSnapshot = await getDocs(q)

    const products = productsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return products
  } catch (error) {
    console.error("Error getting products by brand:", error)
    return []
  }
}
