"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleSpecificQuestions } from "./RoleSpecificQuestions"
import { ROLE_SPECIFIC_STEPS } from "@/lib/constants/onboarding-steps"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form } from "@/components/ui/form"
import type { ServiceQuestionsProps, FormData } from "@/lib/types/onboarding"

// Update the component props
export function ServiceQuestions({ role, onComplete, data }: ServiceQuestionsProps) {
  // Get role-specific configuration
  const roleConfig = ROLE_SPECIFIC_STEPS[role]

  // Create dynamic schema based on role fields
  const createSchemaForRole = () => {
    const schemaFields: Record<string, any> = {}

    if (roleConfig && roleConfig.fields) {
      roleConfig.fields.forEach((field) => {
        if (field.required) {
          schemaFields[field.name] = z.string().min(1, `${field.label} is required`)
        } else {
          schemaFields[field.name] = z.string().optional()
        }

        // Convert number fields
        if (field.type === "number") {
          schemaFields[field.name] = field.required
            ? z.coerce.number().min(1, `${field.label} is required`)
            : z.coerce.number().optional()
        }

        // Handle multiselect fields
        if (field.type === "multiselect") {
          schemaFields[field.name] = field.required
            ? z.array(z.string()).min(1, `Select at least one ${field.label}`)
            : z.array(z.string()).optional()
        }
      })
    }

    return z.object(schemaFields)
  }

  const schema = createSchemaForRole()
  type FormValues = z.infer<typeof schema>

  // Initialize form with default values or existing data
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: data || {},
  })

  // Update parent component with form values when they change
  useEffect(() => {
    const subscription = form.watch((value) => {
      onComplete(value)
    })
    return () => subscription.unsubscribe()
  }, [form, onComplete])

  // Update the form submission
  const onSubmit = async (values: FormData) => {
    await onComplete(values)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{roleConfig?.title || "Role Setup"}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">{roleConfig?.description || "Configure your role-specific settings."}</p>

          <Form {...form}>
            <form className="space-y-4">
              <RoleSpecificQuestions
                role={role}
                formData={form.getValues()}
                onInputChange={(e) => {
                  form.setValue(e.target.name as any, e.target.value)
                }}
              />
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  )
}

