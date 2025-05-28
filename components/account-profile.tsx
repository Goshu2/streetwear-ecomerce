"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { doc, updateDoc } from "firebase/firestore"
import { updateProfile as updateFirebaseProfile } from "firebase/auth"
import { db, auth } from "@/lib/firebase/config"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AccountProfile() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!name.trim()) {
      setError("Името е задължително.")
      return
    }

    setLoading(true)

    try {
      // Обновяване на профила във Firebase Auth
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: name,
        })
      }

      // Обновяване на документа в Firestore
      if (user?.uid) {
        await updateDoc(doc(db, "users", user.uid), {
          name,
          updatedAt: new Date(),
        })
      }

      toast({
        title: "Профилът е обновен",
        description: "Вашият профил беше успешно обновен.",
      })

      setSuccess(true)
    } catch (error) {
      console.error("Грешка при обновяване на профила:", error)
      setError("Неуспешно обновяване на профила. Моля, опитайте отново.")

      toast({
        title: "Грешка при обновяване",
        description: "Възникна грешка при обновяване на вашия профил. Моля, опитайте отново.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Информация за профила</CardTitle>
        <CardDescription>Обновете информацията за вашия акаунт</CardDescription>
      </CardHeader>

      {error && (
        <div className="px-6">
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {success && (
        <div className="px-6">
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">Вашият профил беше успешно обновен.</AlertDescription>
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Пълно име</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Имейл</Label>
            <Input id="email" type="email" value={email} disabled={true} className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Имейл адресът не може да бъде променен. Свържете се с поддръжката, ако желаете да го актуализирате.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Запазване...
              </>
            ) : (
              "Запази промените"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
