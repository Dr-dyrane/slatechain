"use client"

import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plug } from "lucide-react"

import { setIntegration, toggleIntegration, type IntegrationCategory } from "@/lib/slices/integrationSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { AnimatePresence } from "framer-motion"
import { IntegrationCategories } from "./IntegrationCategories"
import { ServiceSelector } from "./ServiceSelector"
import { updateUser } from "@/lib/slices/user/user"

export function Integrations() {
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | null>(null)
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)


  const handleSaveIntegration = (service: string, apiKey: string, url?: string) => {
    if (selectedCategory && user) {
      const updatedUser = {
        ...user,
        integrations: {
          ...user.integrations,
          [selectedCategory]: {
            enabled: true,
            service,
            apiKey,
            ...(selectedCategory === "ecommerce" ? { storeUrl: url } : {}),
          },
        },
      }
      dispatch(updateUser(updatedUser))
      dispatch(
        setIntegration({
          category: selectedCategory,
          service,
          apiKey,
          storeUrl: url,
        }),
      )
    }
  }

  const handleToggleIntegration = (enabled: boolean) => {
    if (selectedCategory && user?.integrations[selectedCategory]) {
      const currentIntegration = user.integrations[selectedCategory]
      const updatedUser = {
        ...user,
        integrations: {
          ...user.integrations,
          [selectedCategory]: {
            ...currentIntegration,
            enabled,
          },
        },
      }
      dispatch(updateUser(updatedUser))
      dispatch(
        toggleIntegration({
          category: selectedCategory,
          enabled,
        })
      )
    }
  }

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center space-x-2">
          <Plug className="h-6 w-6" />
          <span>Integrations</span>
        </CardTitle>
        <CardDescription>Connect SlateChain with your existing systems.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {selectedCategory ? (
            <ServiceSelector
              key="service-selector"
              category={selectedCategory}
              onBack={() => setSelectedCategory(null)}
              integration={user?.integrations[selectedCategory]}
              onSave={handleSaveIntegration}
              onToggle={handleToggleIntegration}
            />
          ) : (
            <IntegrationCategories
              key="categories"
              selected={selectedCategory}
              onSelect={(category) => setSelectedCategory(category as IntegrationCategory)}
            />
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

