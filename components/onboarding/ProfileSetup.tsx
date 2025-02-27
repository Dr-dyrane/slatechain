"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileFields } from "./ProfileFields"
import type { UserRole } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import type { FormData } from "@/lib/types/onboarding"

// Define schema for profile data
const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  companyName: z.string().optional(),
  businessType: z.string().optional(),
  employeeCount: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileSetupProps {
  role: UserRole
  onComplete: (data: Record<string, any>) => void
  data?: Record<string, any>
}

// Update the ProfileFields props interface
interface ProfileFieldsProps {
  formData: FormData
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

// In the ProfileSetup component
export function ProfileSetup({ role, onComplete, data }: ProfileSetupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with default values or existing data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: data?.firstName || "",
      lastName: data?.lastName || "",
      email: data?.email || "",
      phoneNumber: data?.phoneNumber || "",
      companyName: data?.companyName || "",
      businessType: data?.businessType || "",
      employeeCount: data?.employeeCount || "",
    },
  })

  // Update parent component with form values when they change
  useEffect(() => {
    const subscription = form.watch((value) => {
      onComplete(value)
    })
    return () => subscription.unsubscribe()
  }, [form, onComplete])

  // Handle form submission
  const onSubmit = (values: ProfileFormValues) => {
    setIsSubmitting(true)
    try {
      onComplete(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Setup</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company information fields */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-3">Company Information</h3>
              <div className="space-y-4">
                <ProfileFields
                  formData={form.getValues()}
                  onInputChange={(e) => {
                    const value = e.target.type === "number" ? Number.parseInt(e.target.value, 10) : e.target.value
                    form.setValue(e.target.name as any, value)
                  }}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

