"use client"

import { useState, useEffect } from "react"
import { CreditCard, Edit, Plus, Trash, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import {
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "@/lib/firebase/payment-methods"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AccountPaymentMethods() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")

  const [open, setOpen] = useState(false)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null)

  // Fetch payment methods when component mounts
  useEffect(() => {
    async function fetchPaymentMethods() {
      if (!user?.uid) return

      try {
        setLoading(true)
        const methods = await getPaymentMethods(user.uid)
        setPaymentMethods(methods)
        setError("")
      } catch (err) {
        console.error("Error fetching payment methods:", err)
        setError("Failed to load your payment methods. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [user])

  const handleAddPaymentMethod = () => {
    setEditingPaymentMethod(null)
    setOpen(true)
  }

  const handleEditPaymentMethod = (paymentMethod) => {
    setEditingPaymentMethod(paymentMethod)
    setOpen(true)
  }

  const handleDeletePaymentMethod = async (id) => {
    if (!user?.uid) return

    try {
      setActionLoading(true)
      await deletePaymentMethod(user.uid, id)
      setPaymentMethods(paymentMethods.filter((method) => method.id !== id))

      toast({
        title: "Payment method deleted",
        description: "The payment method has been deleted successfully.",
      })
    } catch (err) {
      console.error("Error deleting payment method:", err)
      toast({
        title: "Error",
        description: "Failed to delete payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user?.uid) return

    try {
      setActionLoading(true)
      const formData = new FormData(e.target)

      const paymentData = {
        cardNumber: formData.get("cardNumber"),
        cardType: determineCardType(formData.get("cardNumber")),
        expiryDate: formData.get("expiryDate"),
        nameOnCard: formData.get("nameOnCard"),
        isDefault: formData.get("isDefault") === "on",
      }

      if (editingPaymentMethod) {
        // Update existing payment method
        const updatedMethod = await updatePaymentMethod(user.uid, editingPaymentMethod.id, paymentData)
        setPaymentMethods(
          paymentMethods.map((method) =>
            method.id === editingPaymentMethod.id
              ? updatedMethod
              : updatedMethod.isDefault
                ? { ...method, isDefault: false }
                : method,
          ),
        )

        toast({
          title: "Payment method updated",
          description: "The payment method has been updated successfully.",
        })
      } else {
        // Add new payment method
        const newMethod = await addPaymentMethod(user.uid, paymentData)

        // If the new method is default, update all other methods to not be default
        if (newMethod.isDefault) {
          setPaymentMethods([newMethod, ...paymentMethods.map((method) => ({ ...method, isDefault: false }))])
        } else {
          setPaymentMethods([newMethod, ...paymentMethods])
        }

        toast({
          title: "Payment method added",
          description: "The new payment method has been added successfully.",
        })
      }

      setOpen(false)
    } catch (err) {
      console.error("Error saving payment method:", err)
      toast({
        title: "Error",
        description: "Failed to save payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Simple function to determine card type based on first digit
  const determineCardType = (cardNumber) => {
    const firstDigit = cardNumber.charAt(0)
    if (firstDigit === "4") return "Visa"
    if (firstDigit === "5") return "Mastercard"
    if (firstDigit === "3") return "American Express"
    if (firstDigit === "6") return "Discover"
    return "Credit Card"
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Payment Methods</h2>
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="opacity-50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Loading...
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p>**** **** **** ****</p>
                  <p>Expires: --/--</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" disabled>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Payment Methods</h2>
        <Button onClick={handleAddPaymentMethod} disabled={actionLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {paymentMethods.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Payment Methods</h3>
          <p className="text-muted-foreground mb-4">You haven't added any payment methods yet.</p>
          <Button onClick={handleAddPaymentMethod}>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    {method.cardType}
                  </span>
                  {method.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Default</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p>{method.cardNumber}</p>
                  <p>Expires: {method.expiryDate}</p>
                  {method.nameOnCard && <p>Name: {method.nameOnCard}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPaymentMethod(method)}
                  disabled={actionLoading}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500"
                  onClick={() => handleDeletePaymentMethod(method.id)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPaymentMethod ? "Edit Payment Method" : "Add New Payment Method"}</DialogTitle>
            <DialogDescription>
              {editingPaymentMethod
                ? "Update your payment method information below."
                : "Enter your payment method information below."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                required
                defaultValue={editingPaymentMethod?.cardNumber?.replace(/\*/g, "") || ""}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  defaultValue={editingPaymentMethod?.expiryDate || ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" name="cvc" placeholder="123" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nameOnCard">Name on Card</Label>
              <Input id="nameOnCard" name="nameOnCard" defaultValue={editingPaymentMethod?.nameOnCard || ""} required />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                className="h-4 w-4 rounded border-gray-300"
                defaultChecked={editingPaymentMethod?.isDefault || false}
              />
              <Label htmlFor="isDefault" className="font-normal">
                Set as default payment method
              </Label>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingPaymentMethod ? "Saving..." : "Adding..."}
                  </>
                ) : editingPaymentMethod ? (
                  "Save Changes"
                ) : (
                  "Add Payment Method"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
