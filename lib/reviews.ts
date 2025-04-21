import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  updateDoc,
} from "firebase/firestore"
import { db } from "./config"

// Get reviews for a product
export async function getProductReviews(productId) {
  try {
    const reviewsCollection = collection(db, "reviews")
    const q = query(reviewsCollection, where("productId", "==", productId), orderBy("createdAt", "desc"))
    const reviewsSnapshot = await getDocs(q)
    const reviews = reviewsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return reviews
  } catch (error) {
    console.error("Error getting product reviews:", error)
    throw error
  }
}

// Add a review
export async function addReview(reviewData) {
  try {
    const reviewToAdd = {
      ...reviewData,
      createdAt: new Date(),
      helpful: 0,
      unhelpful: 0,
    }

    const docRef = await addDoc(collection(db, "reviews"), reviewToAdd)
    return {
      id: docRef.id,
      ...reviewToAdd,
    }
  } catch (error) {
    console.error("Error adding review:", error)
    throw error
  }
}

// Delete a review
export async function deleteReview(id) {
  try {
    const reviewRef = doc(db, "reviews", id)
    await deleteDoc(reviewRef)
    return true
  } catch (error) {
    console.error("Error deleting review:", error)
    throw error
  }
}

// Mark review as helpful/unhelpful
export async function updateReviewHelpfulness(id, isHelpful) {
  try {
    const reviewRef = doc(db, "reviews", id)
    const reviewDoc = await getDoc(reviewRef)

    if (reviewDoc.exists()) {
      const reviewData = reviewDoc.data()
      const field = isHelpful ? "helpful" : "unhelpful"
      const updatedCount = (reviewData[field] || 0) + 1

      await updateDoc(reviewRef, { [field]: updatedCount })

      return {
        id,
        [field]: updatedCount,
      }
    } else {
      throw new Error("Review not found")
    }
  } catch (error) {
    console.error("Error updating review helpfulness:", error)
    throw error
  }
}
