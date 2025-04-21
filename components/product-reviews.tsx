"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsDown, ThumbsUp } from "lucide-react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { getProductReviews, addReview, updateReviewHelpfulness } from "@/lib/firebase/reviews"

interface ProductReviewsProps {
  productId: string
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const fetchedReviews = await getProductReviews(productId)
        setReviews(fetchedReviews)
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [productId])

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to leave a review.",
        variant: "destructive",
      })
      return
    }

    if (!reviewText.trim()) {
      toast({
        title: "Review required",
        description: "Please enter your review before submitting.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const newReview = await addReview({
        productId,
        userId: user.uid,
        rating,
        review: reviewText,
      })

      setReviews([newReview, ...reviews])

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })

      setReviewText("")
      setRating(5)
    } catch (error) {
      toast({
        title: "Failed to submit review",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleHelpful = async (reviewId, isHelpful) => {
    try {
      await updateReviewHelpfulness(reviewId, isHelpful)

      // Update local state
      setReviews(
        reviews.map((review) => {
          if (review.id === reviewId) {
            const field = isHelpful ? "helpful" : "unhelpful"
            return {
              ...review,
              [field]: (review[field] || 0) + 1,
            }
          }
          return review
        }),
      )

      toast({
        title: "Thank you",
        description: "Your feedback has been recorded.",
      })
    } catch (error) {
      console.error("Error updating review helpfulness:", error)
    }
  }

  if (loading) {
    return (
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      <div className="space-y-8">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-muted-foreground">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="flex">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                  </div>
                  <span className="ml-2 font-medium">{review.user}</span>
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>

              <p className="text-gray-700 mb-4">{review.review}</p>

              <div className="flex items-center text-sm text-gray-500">
                <span>Was this review helpful?</span>
                <Button variant="ghost" size="sm" className="ml-2" onClick={() => handleHelpful(review.id, true)}>
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {review.helpful || 0}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleHelpful(review.id, false)}>
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  {review.unhelpful || 0}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-12">
        <h3 className="text-xl font-bold mb-4">Write a Review</h3>

        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Rating</label>
            <div className="flex">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <button key={i} type="button" className="focus:outline-none" onClick={() => setRating(i + 1)}>
                    <Star className={`h-8 w-8 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                  </button>
                ))}
            </div>
          </div>

          <div>
            <label htmlFor="review" className="block mb-2 font-medium">
              Your Review
            </label>
            <Textarea
              id="review"
              rows={5}
              placeholder="Share your experience with this product..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </div>
    </section>
  )
}
