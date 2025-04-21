// This file is for reference only and should be run once to set up the database
// It's not part of the regular application code

import { db } from "./config"
import { collection, addDoc, getDocs } from "firebase/firestore"

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

// Function to initialize the database with categories
export async function initializeDatabase() {
  try {
    // Check if categories already exist
    const categoriesCollection = collection(db, "categories")
    const categoriesSnapshot = await getDocs(categoriesCollection)

    if (categoriesSnapshot.empty) {
      // Add initial categories
      for (const category of initialCategories) {
        await addDoc(categoriesCollection, {
          ...category,
          createdAt: new Date(),
        })
      }
      console.log("Database initialized with categories")
    } else {
      console.log("Categories already exist, skipping initialization")
    }
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}

// Firestore security rules (to be added in Firebase Console)
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read categories
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Allow anyone to read products
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    // Allow authenticated users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow admins to read and write all user data
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
*/
