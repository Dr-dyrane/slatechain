"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRole } from "@/lib/types"
import type { WelcomeProps } from "@/lib/types/onboarding"
import { useEffect } from "react"

export function Welcome({ role, name, onComplete }: WelcomeProps) {
  // Initialize data on component mount
  useEffect(() => {
    const initializeWelcome = async () => {
      try {
        await onComplete({
          welcomeCompleted: true,
          startedAt: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Error completing welcome step:", error)
      }
    }

    // Call the async function
    initializeWelcome()

    // No cleanup needed since we're just initializing data
    return () => { }
  }, [onComplete])

  const getRoleMessage = () => {
    switch (role) {
      case UserRole.ADMIN:
        return "Manage and oversee your entire supply chain in one place."
      case UserRole.SUPPLIER:
        return "Streamline inventory and orders with our platform."
      case UserRole.MANAGER:
        return "Monitor and optimize team performance."
      case UserRole.CUSTOMER:
        return "Browse, shop, and track orders seamlessly."
      default:
        return "Welcome to SlateChain!"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to SlateChain, {name}!</CardTitle>
        <CardDescription>Let's get you set up and ready to go.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700 mb-2">{getRoleMessage()}</p>
            <p className="text-blue-700">
              We'll guide you through the setup process to ensure you get the most out of our platform.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">What to expect:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Complete your profile information</li>
              <li>Set up your {role.toLowerCase()}-specific settings</li>
              <li>Connect your existing services (optional)</li>
              <li>Configure your preferences</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

