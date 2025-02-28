"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Check, Clock, Edit, XCircle } from "lucide-react"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format } from "date-fns"
import Link from "next/link"

interface OnboardingStepData {
  [key: string]: string | boolean | number | object | null | undefined;
}

interface OnboardingStep {
  stepId: string;
  title: string;
  status: "COMPLETED" | "SKIPPED" | "PENDING";
  completedAt?: string;
  skippedAt?: string;
  data?: OnboardingStepData;
}

interface OnboardingProgress {
  steps: OnboardingStep[];
}

export function OnboardingHistory() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { stepsData } = useSelector((state: RootState) => state.onboarding)
  const [onboardingData, setOnboardingData] = useState<OnboardingProgress | null>(null)

  useEffect(() => {
    const loadOnboardingHistory = async () => {
      try {
        setLoading(true)
        console.log('stepsData', stepsData)
        const transformedData: OnboardingProgress = {
          steps: Object.entries(stepsData).map(([stepId, stepData]) => {
            const stepObj = stepData as Record<string, any>
            return {
              stepId,
              title: getStepTitle(stepId),
              status: stepObj.completedAt ? "COMPLETED" : stepObj.skippedAt ? "SKIPPED" : "PENDING",
              completedAt: stepObj.completedAt,
              skippedAt: stepObj.skippedAt,
              data: {
                ...stepObj,
                startedAt: stepObj.startedAt ? formatDate(stepObj.startedAt) : null,
                completedAt: stepObj.completedAt ? formatDate(stepObj.completedAt) : null,
                skippedAt: stepObj.skippedAt ? formatDate(stepObj.skippedAt) : null,
              },
            } as OnboardingStep;
          }),
        };
        setOnboardingData(transformedData);
      } catch (err) {
        setError("Failed to load onboarding history")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadOnboardingHistory()
  }, [])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"; // Handle missing values gracefully

    try {
      return format(new Date(dateString), "MMM dd, yyyy, h:mm a");
      // Example: Feb 28, 2025, 7:10 PM
    } catch (error) {
      console.error("Invalid date:", dateString);
      return "Invalid Date";
    }
  };


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const getStepIcon = (step: OnboardingStep) => {
    switch (step.status) {
      case "COMPLETED":
        return <Check className="h-4 w-4 text-green-500" />
      case "SKIPPED":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Check className="h-4 w-4 text-gray-500" />
    }
  }

  function getStepTitle(stepId: string): string {
    const titles: Record<string, string> = {
      "0": "Welcome",
      "1": "Personal Information",
      "2": "Purchase Frequency",
      "3": "Integrations",
      "4": "Preferences",
      "5": "Completion",
    }
    return titles[stepId] || `Step ${stepId}`
  }

  const formatStepData = (data: Record<string, any>): { key: string; value: string }[] => {
    return Object.entries(data)
      .map(([key, value]) => {
        if (key.startsWith("_") || value === null || value === undefined) return null;

        if (typeof value === "boolean") {
          return { key, value: value ? "Yes" : "No" };
        }

        if (Array.isArray(value)) {
          return { key, value: value.join(", ") };
        }

        if (typeof value === "object") {
          if (Object.keys(value).length > 0 && "enabled" in value) {
            return { key, value: value.enabled ? "Enabled" : "Disabled" };
          }
          return { key, value: JSON.stringify(value) }
        }

        return { key, value: String(value) };
      })
      .filter(Boolean) as { key: string; value: string }[];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Onboarding History</CardTitle>
          <CardDescription>Your onboarding progress and preferences</CardDescription>
        </div>
        <Link
          href="/onboarding"
          className="flex items-start"
        >
          <Edit className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible>
          {onboardingData?.steps.map((step) => (
            <AccordionItem key={step.stepId} value={step.stepId}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  {getStepIcon(step)}
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-2">
                  {formatStepData(step.data || {}).map(({ key, value }) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
