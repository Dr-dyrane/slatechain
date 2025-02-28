"use client"

import { useState, useEffect, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import type { RootState, AppDispatch } from "@/lib/store"
import {
  fetchProgress,
  updateStep,
  finishOnboarding,
  setCurrentStep,
  cancelOnboarding,
  skipStep,
  completeStep, // Add this import
  setLoading,
  goBack, // Import setLoading
} from "@/lib/slices/onboardingSlice"
import { Welcome } from "@/components/onboarding/Welcome"
import { ProfileSetup } from "@/components/onboarding/ProfileSetup"
import { ServiceQuestions } from "@/components/onboarding/ServiceQuestions"
import { IntegrationsStep } from "@/components/onboarding/IntegrationsSteps"
import { Preferences } from "@/components/onboarding/Preferences"
import { Completion } from "@/components/onboarding/Completion"
import { OnboardingStatus, OnboardingStepStatus } from "@/lib/types"
import { ErrorState } from "@/components/ui/error"
import { MAX_STEPS, ONBOARDING_STEPS, STEP_DETAILS } from "@/lib/constants/onboarding-steps"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import OnboardingProgress from "@/components/onboarding/OnboardingProgress"
import type { FormData } from "@/lib/types/onboarding"

// Define step components mapping
const StepComponents = {
  [ONBOARDING_STEPS.WELCOME]: Welcome,
  [ONBOARDING_STEPS.PROFILE_SETUP]: ProfileSetup,
  [ONBOARDING_STEPS.ROLE_SPECIFIC]: ServiceQuestions,
  [ONBOARDING_STEPS.INTEGRATIONS]: IntegrationsStep, // Use the correct component
  [ONBOARDING_STEPS.PREFERENCES]: Preferences,
  [ONBOARDING_STEPS.COMPLETION]: Completion,
}

export default function OnboardingPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const { loading, completedSteps, roleSpecificData, cancelled, error, totalSteps } =
    useSelector((state: RootState) => state.onboarding)
  const currentStep = useSelector((state: RootState) => state.onboarding.currentStep)
  const completed = useSelector((state: RootState) => state.onboarding.completedSteps[currentStep])
  const [stepData, setStepData] = useState<Record<string, any>>({})
  const [isInitialized, setIsInitialized] = useState(false)
  const isComplete = completed || user?.onboardingStatus === OnboardingStatus.COMPLETED

  // Initialize onboarding on component mount
  useEffect(() => {
    const initializeOnboarding = async () => {
      if (user && !isInitialized) {
        try {
          dispatch(setLoading(true)); // Start loading
          await dispatch(fetchProgress()).unwrap()
          setIsInitialized(true)
        } catch (error) {
          console.error("Error initializing onboarding:", error)
        } finally {
          dispatch(setLoading(false)); // End loading regardless of success/failure
        }
      }
    }

    initializeOnboarding()
  }, [user, dispatch, isInitialized])

  // Handle step data changes
  const handleStepComplete = useCallback(async (data: FormData) => {
    // Make handleStepComplete async
    setStepData(data)
    return Promise.resolve() // Resolve a promise
  }, [])

  // Handle next button click
  const handleNext = async () => {
    if (!user) {
      console.error("User is missing. Unable to save progress or complete onboarding.")
      return
    }

    try {
      dispatch(setLoading(true)); // Start loading
      // Update current step as completed
      await dispatch(
        updateStep({
          stepId: currentStep,
          status: OnboardingStepStatus.COMPLETED,
          data: stepData,
        }),
      ).unwrap()

      dispatch(completeStep(currentStep))

      // If this is the last step, finish onboarding
      if (currentStep === MAX_STEPS - 1) {
        await dispatch(finishOnboarding()).unwrap()
        router.push("/dashboard")
      } else {
        // Otherwise, move to next step
        dispatch(setCurrentStep(Math.min(currentStep + 1, MAX_STEPS - 1)))
        setStepData({}) // Reset step data for the next step
      }
    } catch (error) {
      console.error("Error saving step:", error)
    } finally {
      dispatch(setLoading(false)); // End loading regardless of success/failure
    }
  }

   // Handle back button click
   const handleBack = () => {
    if (currentStep > 0) {
       dispatch(goBack());
    }
  };

  // Handle skip button click
  const handleSkip = async (reason = "User skipped this step") => {
    if (!user) return

    try {
      dispatch(setLoading(true));
      await dispatch(
        skipStep({
          stepId: currentStep,
          reason,
        }),
      ).unwrap()

      // Move to next step
      dispatch(setCurrentStep(currentStep + 1))
      setStepData({}) // Reset step data for the next step
    } catch (error) {
      console.error("Error skipping step:", error)
    } finally {
      dispatch(setLoading(false));
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
  if (!user) {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <ErrorState
          title="Onboarding Unavailable"
          description="We encountered an issue while loading your onboarding process."
          message={
            !user
              ? "User information not found. Please log in and try again."
              : 'No onboarding process found. Please contact support for assistance.'
          }
          onRetry={handleRetry}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  // Get current step component
  const CurrentStepComponent = StepComponents[currentStep]

  // Get current step details
  const currentStepDetails = STEP_DETAILS[currentStep] || { title: "Unknown Step", description: "" }
  const isCurrentStepSkippable = currentStepDetails.isSkippable || false

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
              {/* <CardDescription>
                Step {currentStep + 1} of {MAX_STEPS}
              </CardDescription> */}
            </div>
            {loading && (
              <div className="flex justify-center items-center">
                <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          <OnboardingProgress currentStep={currentStep} totalSteps={MAX_STEPS} completedSteps={completedSteps || []} />
        </CardHeader>

        <CardContent>
          {CurrentStepComponent && (
            <CurrentStepComponent
              role={user.role}
              name={user.name}
              onComplete={handleStepComplete}
              data={roleSpecificData}
              onSubmit={handleNext}
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
              <Button variant="ghost" onClick={() => handleSkip()} disabled={loading}>
                Skip
              </Button>
            )}

            <Button onClick={handleNext} disabled={loading}>
              {loading ? "Processing..." : currentStep === MAX_STEPS - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Optional: Add a cancel button outside the card */}
      <Button variant="destructive" onClick={handleCancel} className="mt-4 ">
        Cancel Onboarding
      </Button>
    </div>
  )
}

