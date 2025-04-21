"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { useSettings } from "@/components/settings-provider"
import { formatCurrency, generateOrderNumber } from "@/lib/utils"
import CheckoutSummary from "@/components/checkout-summary"
import { createOrder } from "@/lib/firebase/orders"
import { clearCart } from "@/lib/firebase/cart"
import { getPaymentMethods } from "@/lib/firebase/payment-methods"
import { getUserAddresses } from "@/lib/firebase/addresses"
import { CreditCard, Loader2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { addAddress } from "@/lib/firebase/addresses"

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { cart, clearCart: clearLocalCart } = useCart()
  const { user } = useAuth()
  const { settings } = useSettings()
  const [loading, setLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [submittingAddress, setSubmittingAddress] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    shippingMethod: "standard",
    paymentMethod: "card",
  })

  // Calculate order summary using the settings
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = formData.shippingMethod === "express" ? 20 : subtotal >= settings.freeShippingThreshold ? 0 : 10
  const tax = subtotal * (settings.taxRate / 100)
  const total = subtotal + shipping + tax

  // Fetch user's saved payment methods and addresses
  useEffect(() => {
    async function fetchUserData() {
      if (!user?.uid) return

      try {
        // Fetch payment methods
        setLoadingPaymentMethods(true)
        const methods = await getPaymentMethods(user.uid)
        setPaymentMethods(methods)

        // Set default payment method if available
        const defaultMethod = methods.find((method) => method.isDefault)
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.id)
        } else if (methods.length > 0) {
          setSelectedPaymentMethod(methods[0].id)
        }

        // Fetch addresses
        setLoadingAddresses(true)
        const userAddresses = await getUserAddresses(user.uid)
        setAddresses(userAddresses)

        // Set default address if available
        const defaultAddress = userAddresses.find((addr) => addr.isDefault)
        if (defaultAddress) {
          setSelectedAddress(defaultAddress.id)
          // Pre-fill shipping information from default address
          setFormData((prev) => ({
            ...prev,
            address: defaultAddress.address,
            city: defaultAddress.city,
            state: defaultAddress.state,
            zipCode: defaultAddress.zipCode,
            country: defaultAddress.country,
          }))
        } else if (userAddresses.length > 0) {
          setSelectedAddress(userAddresses[0].id)
          // Pre-fill shipping information from first address
          setFormData((prev) => ({
            ...prev,
            address: userAddresses[0].address,
            city: userAddresses[0].city,
            state: userAddresses[0].state,
            zipCode: userAddresses[0].zipCode,
            country: userAddresses[0].country,
          }))
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
      } finally {
        setLoadingPaymentMethods(false)
        setLoadingAddresses(false)
      }
    }

    // Pre-fill user data if available
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
      }))

      fetchUserData()
    }
  }, [user])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddressChange = (addressId) => {
    setSelectedAddress(addressId)

    if (addressId === "new") {
      // Clear address fields if "Use a new address" is selected
      setFormData((prev) => ({
        ...prev,
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
      }))
      return
    }

    // Find the selected address and update form data
    const address = addresses.find((addr) => addr.id === addressId)
    if (address) {
      setFormData((prev) => ({
        ...prev,
        address: address.address,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
      }))
    }
  }

  const handleAddNewAddress = async (e) => {
    e.preventDefault()

    if (!user?.uid) return

    setSubmittingAddress(true)

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

      const newAddress = await addAddress(addressData)
      setAddresses([...addresses, newAddress])
      setSelectedAddress(newAddress.id)

      // Update shipping form with new address
      setFormData((prev) => ({
        ...prev,
        address: newAddress.address,
        city: newAddress.city,
        state: newAddress.state,
        zipCode: newAddress.zipCode,
        country: newAddress.country,
      }))

      toast({
        title: "Address added",
        description: "Your new address has been added successfully.",
      })

      setAddressDialogOpen(false)
    } catch (error) {
      console.error("Error adding address:", error)
      toast({
        title: "Error",
        description: "Failed to add the address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingAddress(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create order
      const orderData = {
        userId: user?.uid,
        items: cart,
        shipping: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          method: formData.shippingMethod,
        },
        payment: {
          method: formData.paymentMethod,
          paymentMethodId: selectedPaymentMethod,
        },
        subtotal,
        shippingCost: shipping,
        tax,
        total,
        status: "pending",
        orderNumber: generateOrderNumber(),
      }

      await createOrder(orderData)
      await clearCart(user?.uid)
      clearLocalCart()

      toast({
        title: "Order placed",
        description: "Your order has been placed successfully.",
      })

      router.push("/orders")
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    router.push("/cart")
    return null
  }

  return (
    <div className="container px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Информация за доставка</CardTitle>
                  <CardDescription>Въведете данните за вашия адрес за доставка</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium">
                        Вашите запазени адреси</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => setAddressDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Добави нов адрес
                        </Button>
                      </div>

                      {loadingAddresses ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <p>Зареждане на запазените адреси...</p>
                        </div>
                      ) : addresses.length > 0 ? (
                        <RadioGroup value={selectedAddress} onValueChange={handleAddressChange} className="space-y-3">
                          {addresses.map((address) => (
                            <div
                              key={address.id}
                              className="flex items-center justify-between space-x-2 rounded-md border p-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                                <Label htmlFor={`address-${address.id}`} className="font-normal">
                                  <div>
                                    <span className="font-medium">{address.name}</span>
                                    {address.isDefault && (
                                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {address.address}, {address.city}, {address.state} {address.zipCode}
                                  </div>
                                </Label>
                              </div>
                            </div>
                          ))}
                          <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="new" id="new-address" />
                              <Label htmlFor="new-address" className="font-normal">
                                Използвай нов адрес
                              </Label>
                            </div>
                          </div>
                        </RadioGroup>
                      ) : (
                        <div className="text-center py-4 border rounded-lg">
                          <p className="text-muted-foreground mb-2">Нямате запазени адреси.</p>
                          <Button type="button" variant="outline" size="sm" onClick={() => setAddressDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Добави нов адрес
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Първо име</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Фамилия</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Адрес</Label>
                    <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Град</Label>
                      <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Област</Label>
                      <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Пощенски код</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Страна</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        defaultValue="United States"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Метод на доставка</CardTitle>
                  <CardDescription>Изберете предпочитания от вас метод на доставка</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    defaultValue="standard"
                    className="space-y-3"
                    value={formData.shippingMethod}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, shippingMethod: value }))}
                  >
                    <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="font-normal">
                        Стандартна доставка (3-5 работни дни)
                        </Label>
                      </div>
                      <div>
                        {subtotal >= settings.freeShippingThreshold ? (
                          <span className="text-green-600">Безплатна</span>
                        ) : (
                          formatCurrency(10)
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="express" id="express" />
                        <Label htmlFor="express" className="font-normal">
                        Експресна доставка (1-2 работни дни)
                        </Label>
                      </div>
                      <div>{formatCurrency(20)}</div>
                    </div>
                  </RadioGroup>
                  {subtotal >= settings.freeShippingThreshold && (
                    <p className="text-sm text-green-600 mt-2">
                      Вие отговаряте на условията за безплатна стандартна доставка за поръчки над 100лв.{settings.freeShippingThreshold}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Метод за плащане</CardTitle>
                  <CardDescription>Изберете метод на плащането</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    defaultValue="card"
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="card">Дебитна карта</TabsTrigger>
                      <TabsTrigger value="paypal">PayPal</TabsTrigger>
                      <TabsTrigger value="apple">Apple Pay</TabsTrigger>
                    </TabsList>
                    <TabsContent value="card" className="space-y-4 pt-4">
                      {loadingPaymentMethods ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <p>Зарежда запазени карти...</p>
                        </div>
                      ) : paymentMethods.length > 0 ? (
                        <div className="space-y-4">
                          <div className="text-sm font-medium">Твойте запазени карти</div>
                          <RadioGroup
                            value={selectedPaymentMethod}
                            onValueChange={setSelectedPaymentMethod}
                            className="space-y-3"
                          >
                            {paymentMethods.map((method) => (
                              <div
                                key={method.id}
                                className="flex items-center justify-between space-x-2 rounded-md border p-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value={method.id} id={`card-${method.id}`} />
                                  <Label htmlFor={`card-${method.id}`} className="font-normal flex items-center">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    {method.cardType} {method.cardNumber}
                                    {method.isDefault && (
                                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                        Default
                                      </span>
                                    )}
                                  </Label>
                                </div>
                                <div className="text-sm text-muted-foreground">Изтичане: {method.expiryDate}</div>
                              </div>
                            ))}
                            <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="new" id="new-card" />
                                <Label htmlFor="new-card" className="font-normal">
                                  Използвай нова карта
                                </Label>
                              </div>
                            </div>
                          </RadioGroup>

                          {selectedPaymentMethod === "new" && (
                            <div className="space-y-4 mt-4 pt-4 border-t">
                              <div className="space-y-2">
                                <Label htmlFor="cardNumber">Номер на картата</Label>
                                <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="expiryDate">Дата на изтичане</Label>
                                  <Input id="expiryDate" placeholder="MM/YY" required />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="cvc">CVC</Label>
                                  <Input id="cvc" placeholder="123" required />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="nameOnCard">Име на картата</Label>
                                <Input id="nameOnCard" required />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="saveCard"
                                  name="saveCard"
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="saveCard" className="font-normal">
                                Запази тази карта за бъдещи покупки
                                </Label>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Номер на картата</Label>
                            <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="expiryDate">Дата на изтичане</Label>
                              <Input id="expiryDate" placeholder="MM/YY" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvc">CVC</Label>
                              <Input id="cvc" placeholder="123" required />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nameOnCard">Име на картата</Label>
                            <Input id="nameOnCard" required />
                          </div>
                          {user && (
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="saveCard"
                                name="saveCard"
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor="saveCard" className="font-normal">
                                Запази тази карта за бъдещи покупки
                              </Label>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="paypal" className="pt-4">
                      <div className="text-center py-4">
                        <p className="mb-4">Ще бъдете пренасочени към Paypal, за да завършите плащането си.</p>
                        <Button variant="outline" className="w-full">
                          Продължи с Paypal
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="apple" className="pt-4">
                      <div className="text-center py-4">
                        <p className="mb-4">Ще бъдете пренасочени към Apple Pay, за да завършите плащането си.</p>
                        <Button variant="outline" className="w-full">
                          Продължи с ApplePay
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  `Pay ${formatCurrency(total)}`
                )}
              </Button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1">
          <CheckoutSummary />
        </div>
      </div>

      {/* Add New Address Dialog */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добави нов адрес</DialogTitle>
            <DialogDescription>Въведете данни на адреса Ви.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddNewAddress} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Адрес</Label>
              <Input id="name" name="name" placeholder="Home, Work, etc." required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Улица</Label>
              <Input id="address" name="address" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Град</Label>
                <Input id="city" name="city" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Област</Label>
                <Input id="state" name="state" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zipCode">Пощенски код</Label>
                <Input id="zipCode" name="zipCode" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Държава</Label>
                <Input id="country" name="country" defaultValue="United States" required />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="isDefault" name="isDefault" className="h-4 w-4 rounded border-gray-300" />
              <Label htmlFor="isDefault" className="font-normal">
                Сложи като обичаен адрес
              </Label>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={submittingAddress}>
                {submittingAddress ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Добавяне...
                  </>
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
