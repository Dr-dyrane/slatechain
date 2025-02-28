"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import type { PreferencesProps, FormData } from "@/lib/types/onboarding"

// Define schema for preferences
const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  darkMode: z.boolean().optional(),
})

type PreferencesFormValues = z.infer<typeof preferencesSchema>

export function Preferences({ role, onComplete, data, onSkip }: PreferencesProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with default values or existing data
  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: (data?.theme as "light" | "dark" | "system") || "system",
      emailNotifications: (data?.emailNotifications as boolean) || false,
      smsNotifications: (data?.smsNotifications as boolean) || false,
      darkMode: (data?.darkMode as boolean) || false,
    },
  })

  // Update parent component with form values when they change
  useEffect(() => {
    const subscription = form.watch((value) => {
      onComplete(value)
    })
    return () => subscription.unsubscribe()
  }, [form, onComplete])

  // Handle skip button click
  const handleSkip = async () => {
    if (onSkip) {
      await onSkip("Will set preferences later")
    }
  }

  // Update the form submission
  const onSubmit = async (values: FormData) => {
    await onComplete(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <p className="text-gray-600 mb-4">
            Customize your SlateChain experience with these preferences. You can always change these settings later.
          </p>

          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Theme Preference</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="light" />
                          </FormControl>
                          <FormLabel className="font-normal">Light</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="dark" />
                          </FormControl>
                          <FormLabel className="font-normal">Dark</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="system" />
                          </FormControl>
                          <FormLabel className="font-normal">System (follows your device settings)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormLabel>Notification Preferences</FormLabel>

                <FormField
                  control={form.control}
                  name="emailNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Email Notifications</FormLabel>
                        <FormDescription>Receive updates and alerts via email</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smsNotifications"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">SMS Notifications</FormLabel>
                        <FormDescription>Receive important alerts via SMS</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* {onSkip && (
                <div className="pt-4 flex justify-end">
                  <Button type="button" variant="outline" onClick={handleSkip}>
                    Skip for Now
                  </Button>
                </div>
              )} */}
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  )
}

