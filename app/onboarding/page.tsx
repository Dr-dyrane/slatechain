"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import type { RootState, AppDispatch } from "@/lib/store"
import {
  fetchProgress,
  updateStep,
  finishOnboarding,
  setCurrentStep,
  completeStep,
  cancelOnboarding,
  setLoading,
  skipStep,
} from "@/lib/slices/onboardingSlice"
import { Welcome } from "@/components/onboarding/Welcome"
import { ProfileSetup } from "@/components/onboarding/ProfileSetup"
import { ServiceQuestions } from "@/components/onboarding/ServiceQuestions"
import { Preferences } from "@/components/onboarding/Preferences"
import { Completion } from "@/components/onboarding/Completion"
import { OnboardingStepStatus } from "@/lib/types"
import { ErrorState } from "@/components/ui/error"
import { MAX_STEPS, ONBOARDING_STEPS, STEP_DETAILS, TOTAL_STEPS } from "@/lib/constants/onboarding-steps"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import OnboardingProgress from "@/components/onboarding/OnboardingProgress"


// Define step components mapping
const StepComponents = {
  [ONBOARDING_STEPS.WELCOME]: Welcome,
  [ONBOARDING_STEPS.PROFILE_SETUP]: ProfileSetup,
  [ONBOARDING_STEPS.ROLE_SPECIFIC]: ServiceQuestions,
  [ONBOARDING_STEPS.INTEGRATIONS]: Preferences, // Reusing Preferences for now, should be replaced with IntegrationsStep
  [ONBOARDING_STEPS.PREFERENCES]: Preferences,
  [ONBOARDING_STEPS.COMPLETION]: Completion,
}

export default function OnboardingPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const { loading, currentStep, completedSteps, roleSpecificData, completed, cancelled, error } = useSelector(
    (state: RootState) => state.onboarding,
  )

  const [stepData, setStepData] = useState<Record<string, any>>({})
  const [isInitialized, setIsInitialized] = useState(false)
  const isComplete = user?.onboardingStatus === "COMPLETED" || completed

  // Initialize onboarding on component mount
  useEffect(() => {
    setLoading(false)
    const initializeOnboarding = async () => {
      if (user && !isInitialized) {
        await dispatch(fetchProgress())
        setIsInitialized(true)
      }
    }

    initializeOnboarding()
  }, [user, dispatch, isInitialized])

  // Handle step data changes
  const handleStepComplete = (data: Record<string, any>) => {
    setStepData({ ...stepData, ...data })
  }

  // Handle next button click
  const handleNext = async () => {
    if (!user) {
      console.error("User is missing. Unable to save progress or complete onboarding.")
      return
    }

    dispatch(setLoading(true))

    try {
      // Update current step as completed
      await dispatch(
        updateStep({
          stepId: currentStep,
          status: OnboardingStepStatus.COMPLETED,
          data: stepData,
        }),
      )

      dispatch(completeStep(currentStep))

      // If this is the last step, finish onboarding
      if (currentStep === MAX_STEPS - 1) {
        await dispatch(finishOnboarding())
        router.push("/dashboard")
      } else {
        // Otherwise, move to next step
        dispatch(setCurrentStep(Math.min(currentStep + 1, MAX_STEPS - 1)))
        setStepData({}) // Reset step data for the next step
      }
    } catch (error) {
      console.error("Error saving step:", error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  // Handle back button click
  const handleBack = () => {
    if (currentStep > 0) {
      dispatch(setCurrentStep(Math.max(currentStep - 1, 0)))
      setStepData({})
    }
  }

  // Handle skip button click
  const handleSkip = async () => {
    if (!user) return

    dispatch(setLoading(true))

    try {
      // Skip the current step
      await dispatch(
        skipStep({
          stepId: currentStep,
          reason: "User skipped this step",
        }),
      )

      // Move to next step
      dispatch(setCurrentStep(currentStep + 1))
      setStepData({}) // Reset step data for the next step
    } catch (error) {
      console.error("Error skipping step:", error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  // Handle cancel button click
  const handleCancel = () => {
    dispatch(cancelOnboarding())
    router.push("/dashboard")
  }

  // Handle retry button click
  const handleRetry = () => {
    if (user) {
      dispatch(fetchProgress())
    } else {
      router.push("/login")
    }
  }

  // If user is not logged in or onboarding is complete, show error state
  if (!user || isComplete) {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <ErrorState
          title="Onboarding Unavailable"
          description="We encountered an issue while loading your onboarding process."
          message={
            !user
              ? "User information not found. Please log in and try again."
              : isComplete
                ? "Onboarding process is already completed."
                : "Onboarding process has been cancelled."
          }
          onRetry={handleRetry}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  // Get current step component
  const CurrentStepComponent = StepComponents[currentStep]

  // Check if current step is skippable
  const isCurrentStepSkippable = STEP_DETAILS[currentStep]?.isSkippable || false

  // Get current step details
  const currentStepDetails = STEP_DETAILS[currentStep] || { title: "Unknown Step", description: "" }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-none p-4 md:p-8">
      {error && (
        <Alert variant="destructive" className="mb-4 max-w-[600px]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="w-full max-w-[600px]">
        <CardHeader className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{currentStepDetails.title}</CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {TOTAL_STEPS}
              </CardDescription>
            </div>
            {loading && (
              <div className="flex justify-center items-center">
                <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} completedSteps={completedSteps} />
        </CardHeader>

        <CardContent>
          {CurrentStepComponent && (
            <CurrentStepComponent
              role={user.role}
              name={user.name}
              onComplete={handleStepComplete as any}
              data={roleSpecificData}
              onSkip={isCurrentStepSkippable ? handleSkip : undefined}
            />
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <div>
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0 || loading}>
              Back
            </Button>
          </div>

          <div className="flex space-x-2">
            {isCurrentStepSkippable && (
              <Button variant="ghost" onClick={handleSkip} disabled={loading}>
                Skip
              </Button>
            )}

            <Button onClick={handleNext} disabled={loading}>
              {loading ? "Processing..." : currentStep === TOTAL_STEPS - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Optional: Add a cancel button outside the card */}
      <Button variant="ghost" onClick={handleCancel} className="mt-4 text-gray-500">
        Cancel Onboarding
      </Button>
    </div>
  )
}
