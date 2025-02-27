"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRole } from "@/lib/types"

interface CompletionProps {
  role: UserRole
  name?: string
  onComplete: (data: any) => void
}

export function Completion({ role, name, onComplete }: CompletionProps) {
  const [loading, setLoading] = useState(false)

  const handleFinish = () => {
    setLoading(true)
    onComplete({
      completedAt: new Date().toISOString(),
    })
  }

  const getRoleSpecificMessage = () => {
    switch (role) {
      case UserRole.ADMIN:
        return "You now have access to the admin dashboard where you can manage users, monitor system performance, and configure global settings."
      case UserRole.SUPPLIER:
        return "You can now manage your inventory, track shipments, and connect with customers through your supplier dashboard."
      case UserRole.MANAGER:
        return "Your manager dashboard is ready with tools to oversee operations, manage teams, and analyze performance metrics."
      case UserRole.CUSTOMER:
        return "You're all set to browse products, place orders, and track your shipments through your customer dashboard."
      default:
        return "Your SlateChain account is now fully set up and ready to use."
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
          Onboarding Complete!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p>Thank you for setting up your SlateChain account, {name}.</p>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">What's Next?</h3>
            <p className="text-green-700 mb-2">{getRoleSpecificMessage()}</p>
            <ul className="list-disc pl-5 space-y-1 text-green-700">
              <li>Explore your personalized dashboard</li>
              <li>Complete your profile with additional information</li>
              <li>Set up any remaining integrations</li>
              <li>Check out our documentation for more information</li>
            </ul>
          </div>

          <div className="flex justify-center mt-4">
            <Button onClick={handleFinish} disabled={loading} className="px-8">
              {loading ? "Loading..." : "Go to Dashboard"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

