"use client"
import Link from "next/link"
import { CreditCard, LogOut, Package, Settings, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import AccountProfile from "@/components/account-profile"
import AccountOrders from "@/components/account-orders"
import AccountAddresses from "@/components/account-addresses"
import AccountPaymentMethods from "@/components/account-payment-methods"
import ProtectedRoute from "@/components/protected-route"

export default function AccountPage() {
  const { signOut, user } = useAuth()

  return (
    <ProtectedRoute>
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="flex flex-col space-y-1 px-2">
                  <Link href="/account">
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Link href="/account/orders">
                    <Button variant="ghost" className="w-full justify-start">
                      <Package className="mr-2 h-4 w-4" />
                      Orders
                    </Button>
                  </Link>
                  <Link href="/account/addresses">
                    <Button variant="ghost" className="w-full justify-start">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Addresses
                    </Button>
                  </Link>
                  <Link href="/account/payment-methods">
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Payment Methods
                    </Button>
                  </Link>
                </nav>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </CardFooter>
            </Card>
          </aside>

          <div className="flex-1">
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="pt-6">
                <AccountProfile />
              </TabsContent>
              <TabsContent value="orders" className="pt-6">
                <AccountOrders />
              </TabsContent>
              <TabsContent value="addresses" className="pt-6">
                <AccountAddresses />
              </TabsContent>
              <TabsContent value="payment" className="pt-6">
                <AccountPaymentMethods />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
