"use client"

import { useState, useEffect } from "react"
import { Edit, Loader2, Plus, Trash } from "lucide-react"

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
import { getUserAddresses, addAddress, updateAddress, deleteAddress } from "@/lib/firebase/addresses"

export default function AccountAddresses() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchAddresses() {
      if (!user?.uid) return

      try {
        setLoading(true)
        const userAddresses = await getUserAddresses(user.uid)
        setAddresses(userAddresses)
      } catch (err) {
        console.error("Error fetching addresses:", err)
        toast({
          title: "Error",
          description: "Failed to load your addresses. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAddresses()
  }, [user, toast])

  const handleAddAddress = () => {
    setEditingAddress(null)
    setOpen(true)
  }

  const handleEditAddress = (address) => {
    setEditingAddress(address)
    setOpen(true)
  }

  const handleDeleteAddress = async (id) => {
    if (!user?.uid) return

    try {
      await deleteAddress(id)
      setAddresses(addresses.filter((address) => address.id !== id))

      toast({
        title: "Address deleted",
        description: "The address has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting address:", error)
      toast({
        title: "Error",
        description: "Failed to delete the address. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user?.uid) return

    setSubmitting(true)

    try {
      const formData = new FormData(e.target)
      const addressData = {
        userId: user.uid,
        name: formData.get("name"),
        address: formData.get("address"),
        city: formData.get("city"),
        state: formData.get("state"),
        zipCode: formData.get("zipCode"),
        country: formData.get("country"),
        isDefault: formData.get("isDefault") === "on",
      }

      if (editingAddress) {
        const updatedAddress = await updateAddress(editingAddress.id, addressData)
        setAddresses(addresses.map((address) => (address.id === editingAddress.id ? updatedAddress : address)))

        toast({
          title: "Address updated",
          description: "The address has been updated successfully.",
        })
      } else {
        const newAddress = await addAddress(addressData)
        setAddresses([...addresses, newAddress])

        toast({
          title: "Address added",
          description: "The new address has been added successfully.",
        })
      }

      setOpen(false)
    } catch (error) {
      console.error("Error saving address:", error)
      toast({
        title: "Error",
        description: "Failed to save the address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Addresses</h2>
        <Button onClick={handleAddAddress}>
          <Plus className="mr-2 h-4 w-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">You haven't added any addresses yet.</p>
          <Button onClick={handleAddAddress} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{address.name}</span>
                  {address.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Default</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p>{address.address}</p>
                  <p>
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p>{address.country}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEditAddress(address)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500"
                  onClick={() => handleDeleteAddress(address.id)}
                >
                  <Trash className="mr-2 h-4 w-4" />
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
            <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
            <DialogDescription>
              {editingAddress ? "Update your address information below." : "Enter your address information below."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Address Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingAddress?.name || ""}
                placeholder="Home, Work, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input id="address" name="address" defaultValue={editingAddress?.address || ""} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={editingAddress?.city || ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" defaultValue={editingAddress?.state || ""} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input id="zipCode" name="zipCode" defaultValue={editingAddress?.zipCode || ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue={editingAddress?.country || "United States"} required />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                className="h-4 w-4 rounded border-gray-300"
                defaultChecked={editingAddress?.isDefault || false}
              />
              <Label htmlFor="isDefault" className="font-normal">
                Set as default address
              </Label>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingAddress ? "Saving..." : "Adding..."}
                  </>
                ) : editingAddress ? (
                  "Save Changes"
                ) : (
                  "Add Address"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
