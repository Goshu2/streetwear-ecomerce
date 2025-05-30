"use client"

import { useState, useEffect } from "react"
import { Save, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import AdminSidebar from "@/components/admin-sidebar"
import ProtectedRoute from "@/components/protected-route"
import { updateStoreSettings, getStoreSettings, updateEmailSettings, getEmailSettings } from "@/lib/firebase/settings"
import { useSettings } from "@/components/settings-provider"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const { refreshSettings } = useSettings()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    currency: "",
    taxRate: "",
    freeShippingThreshold: "",
  })

  const [emailSettings, setEmailSettings] = useState({
    emailProvider: "smtp",
    smtpHost: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
    senderName: "",
    senderEmail: "",
    enableOrderConfirmation: true,
    enableShippingNotifications: true,
    enableMarketingEmails: true,
  })

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)

        // Load store settings
        const storeData = await getStoreSettings()
        setStoreSettings({
          storeName: storeData.storeName || "",
          storeEmail: storeData.storeEmail || "",
          storePhone: storeData.storePhone || "",
          storeAddress: storeData.storeAddress || "",
          currency: storeData.currency || "USD",
          taxRate: storeData.taxRate?.toString() || "8",
          freeShippingThreshold: storeData.freeShippingThreshold?.toString() || "100",
        })

        // Load email settings
        const emailData = await getEmailSettings()
        setEmailSettings({
          emailProvider: emailData.emailProvider || "smtp",
          smtpHost: emailData.smtpHost || "",
          smtpPort: emailData.smtpPort || "",
          smtpUsername: emailData.smtpUsername || "",
          smtpPassword: emailData.smtpPassword || "",
          senderName: emailData.senderName || "",
          senderEmail: emailData.senderEmail || "",
          enableOrderConfirmation: emailData.enableOrderConfirmation ?? true,
          enableShippingNotifications: emailData.enableShippingNotifications ?? true,
          enableMarketingEmails: emailData.enableMarketingEmails ?? true,
        })
      } catch (error) {
        console.error("Error loading settings:", error)
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [toast])

  const handleStoreSettingsChange = (e) => {
    const { name, value } = e.target
    setStoreSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleEmailSettingsChange = (e) => {
    const { name, value, type, checked } = e.target
    setEmailSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSwitchChange = (name, checked) => {
    setEmailSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)

    try {
      // Save store settings
      await updateStoreSettings({
        storeName: storeSettings.storeName,
        storeEmail: storeSettings.storeEmail,
        storePhone: storeSettings.storePhone,
        storeAddress: storeSettings.storeAddress,
        currency: storeSettings.currency,
        taxRate: Number(storeSettings.taxRate),
        freeShippingThreshold: Number(storeSettings.freeShippingThreshold),
      })

      // Save email settings
      await updateEmailSettings(emailSettings)

      // Refresh settings in the context
      await refreshSettings()

      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
          <AdminSidebar />
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <AdminSidebar />

        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="flex flex-1 items-center justify-between">
              <h1 className="text-xl font-semibold">Settings</h1>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Tabs defaultValue="general">
              <TabsList className="mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
              </TabsList>

              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>Store Information</CardTitle>
                    <CardDescription>Manage your store details and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="storeName">Store Name</Label>
                        <Input
                          id="storeName"
                          name="storeName"
                          value={storeSettings.storeName}
                          onChange={handleStoreSettingsChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Input
                          id="currency"
                          name="currency"
                          value={storeSettings.currency}
                          onChange={handleStoreSettingsChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="storeEmail">Store Email</Label>
                        <Input
                          id="storeEmail"
                          name="storeEmail"
                          type="email"
                          value={storeSettings.storeEmail}
                          onChange={handleStoreSettingsChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="storePhone">Store Phone</Label>
                        <Input
                          id="storePhone"
                          name="storePhone"
                          value={storeSettings.storePhone}
                          onChange={handleStoreSettingsChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="storeAddress">Store Address</Label>
                      <Textarea
                        id="storeAddress"
                        name="storeAddress"
                        value={storeSettings.storeAddress}
                        onChange={handleStoreSettingsChange}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="taxRate">Tax Rate (%)</Label>
                        <Input
                          id="taxRate"
                          name="taxRate"
                          type="number"
                          value={storeSettings.taxRate}
                          onChange={handleStoreSettingsChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="freeShippingThreshold">Free Shipping Threshold ($)</Label>
                        <Input
                          id="freeShippingThreshold"
                          name="freeShippingThreshold"
                          type="number"
                          value={storeSettings.freeShippingThreshold}
                          onChange={handleStoreSettingsChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>Configure your email provider and notification settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailProvider">Email Provider</Label>
                      <select
                        id="emailProvider"
                        name="emailProvider"
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={emailSettings.emailProvider}
                        onChange={handleEmailSettingsChange}
                      >
                        <option value="smtp">SMTP</option>
                        <option value="sendgrid">SendGrid</option>
                        <option value="mailchimp">Mailchimp</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpHost">SMTP Host</Label>
                        <Input
                          id="smtpHost"
                          name="smtpHost"
                          value={emailSettings.smtpHost}
                          onChange={handleEmailSettingsChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPort">SMTP Port</Label>
                        <Input
                          id="smtpPort"
                          name="smtpPort"
                          value={emailSettings.smtpPort}
                          onChange={handleEmailSettingsChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="smtpUsername">SMTP Username</Label>
                        <Input
                          id="smtpUsername"
                          name="smtpUsername"
                          value={emailSettings.smtpUsername}
                          onChange={handleEmailSettingsChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtpPassword">SMTP Password</Label>
                        <Input
                          id="smtpPassword"
                          name="smtpPassword"
                          type="password"
                          value={emailSettings.smtpPassword}
                          onChange={handleEmailSettingsChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="senderName">Sender Name</Label>
                        <Input
                          id="senderName"
                          name="senderName"
                          value={emailSettings.senderName}
                          onChange={handleEmailSettingsChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="senderEmail">Sender Email</Label>
                        <Input
                          id="senderEmail"
                          name="senderEmail"
                          type="email"
                          value={emailSettings.senderEmail}
                          onChange={handleEmailSettingsChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <h3 className="text-lg font-medium">Notification Settings</h3>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="enableOrderConfirmation">Order Confirmation</Label>
                          <p className="text-sm text-muted-foreground">
                            Send email notifications when orders are placed
                          </p>
                        </div>
                        <Switch
                          id="enableOrderConfirmation"
                          checked={emailSettings.enableOrderConfirmation}
                          onCheckedChange={(checked) => handleSwitchChange("enableOrderConfirmation", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="enableShippingNotifications">Shipping Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Send email notifications when orders are shipped
                          </p>
                        </div>
                        <Switch
                          id="enableShippingNotifications"
                          checked={emailSettings.enableShippingNotifications}
                          onCheckedChange={(checked) => handleSwitchChange("enableShippingNotifications", checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="enableMarketingEmails">Marketing Emails</Label>
                          <p className="text-sm text-muted-foreground">Send promotional emails and newsletters</p>
                        </div>
                        <Switch
                          id="enableMarketingEmails"
                          checked={emailSettings.enableMarketingEmails}
                          onCheckedChange={(checked) => handleSwitchChange("enableMarketingEmails", checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payment">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                    <CardDescription>Configure payment methods and processing options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-md border p-4">
                        <p className="text-sm text-muted-foreground">Payment settings will be available soon.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shipping">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Settings</CardTitle>
                    <CardDescription>Configure shipping methods and delivery options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-md border p-4">
                        <p className="text-sm text-muted-foreground">Shipping settings will be available soon.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="integrations">
                <Card>
                  <CardHeader>
                    <CardTitle>Integrations</CardTitle>
                    <CardDescription>Connect with third-party services and APIs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-md border p-4">
                        <p className="text-sm text-muted-foreground">Integration settings will be available soon.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
