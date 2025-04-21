"use client"

import { Button } from "@/components/ui/button"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

// Initial categories to seed the database
const initialCategories = [
  {
    name: "Tops",
    slug: "tops",
    description: "T-shirts, hoodies, sweaters, and more",
  },
  {
    name: "Bottoms",
    slug: "bottoms",
    description: "Pants, shorts, skirts, and more",
  },
  {
    name: "Footwear",
    slug: "footwear",
    description: "Sneakers, boots, sandals, and more",
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Hats, bags, jewelry, and more",
  },
  {
    name: "Outerwear",
    slug: "outerwear",
    description: "Jackets, coats, and more",
  },
]

// Initial brands to seed the database
const initialBrands = [
  {
    name: "StreetCore",
    slug: "streetcore",
    description: "Urban essentials with a modern twist",
  },
  {
    name: "UrbanEdge",
    slug: "urbanedge",
    description: "Cutting-edge streetwear for the fashion-forward",
  },
  {
    name: "TechWear",
    slug: "techwear",
    description: "Functional clothing with technical fabrics",
  },
  {
    name: "MetroStyle",
    slug: "metrostyle",
    description: "Sophisticated urban fashion",
  },
  {
    name: "CityBlend",
    slug: "cityblend",
    description: "Versatile pieces for city living",
  },
]

export default function AdminInitDb() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [dbStatus, setDbStatus] = useState({ categories: 0, brands: 0 })
  const [needsInitialization, setNeedsInitialization] = useState(true)

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      // Check if categories already exist
      const categoriesCollection = collection(db, "categories")
      const categoriesSnapshot = await getDocs(categoriesCollection)

      // Check if brands already exist
      const brandsCollection = collection(db, "brands")
      const brandsSnapshot = await getDocs(brandsCollection)

      setDbStatus({
        categories: categoriesSnapshot.size,
        brands: brandsSnapshot.size,
      })

      setNeedsInitialization(categoriesSnapshot.size === 0 || brandsSnapshot.size === 0)
    } catch (error) {
      console.error("Error checking database status:", error)
      toast({
        title: "Error",
        description: "Failed to check database status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const initializeDatabase = async () => {
    try {
      setLoading(true)

      // Add initial categories if needed
      if (dbStatus.categories === 0) {
        const categoriesCollection = collection(db, "categories")

        for (const category of initialCategories) {
          await addDoc(categoriesCollection, {
            ...category,
            createdAt: serverTimestamp(),
          })
        }
      }

      // Add initial brands if needed
      if (dbStatus.brands === 0) {
        const brandsCollection = collection(db, "brands")

        for (const brand of initialBrands) {
          await addDoc(brandsCollection, {
            ...brand,
            createdAt: serverTimestamp(),
          })
        }
      }

      // Refresh status
      await checkDatabaseStatus()

      toast({
        title: "Database initialized",
        description: "Categories and brands have been added to the database.",
      })
    } catch (error) {
      console.error("Error initializing database:", error)
      toast({
        title: "Error",
        description: "Failed to initialize database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!needsInitialization) {
    return null
  }

  return (
    <div className="p-4 border rounded-lg mb-6">
      <h3 className="text-lg font-medium mb-2">Database Initialization</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {dbStatus.categories === 0 && dbStatus.brands === 0
          ? "Your database needs to be initialized with default categories and brands."
          : dbStatus.categories === 0
            ? "Your database needs categories to be initialized."
            : "Your database needs brands to be initialized."}
      </p>
      <Button onClick={initializeDatabase} disabled={loading}>
        {loading ? "Initializing..." : "Initialize Database"}
      </Button>
    </div>
  )
}
