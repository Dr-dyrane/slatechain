"use client"

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RootState, AppDispatch } from '@/lib/store'
import {
  fetchProgress,
  updateStep,
  finishOnboarding,
  setCurrentStep,
  completeStep,
  setRoleSpecificData,
  cancelOnboarding,
} from '@/lib/slices/onboardingSlice'
import { Welcome } from '@/components/onboarding/Welcome'
import { ProfileSetup } from '@/components/onboarding/ProfileSetup'
import { ServiceQuestions } from '@/components/onboarding/ServiceQuestions'
import { Preferences } from '@/components/onboarding/Preferences'
import { UserRole } from '@/lib/types'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const getOnboardingSteps = (role: UserRole) => {
  const commonSteps = [
    { title: 'Welcome', component: Welcome },
    { title: 'Profile Setup', component: ProfileSetup },
    { title: 'Preferences', component: Preferences },
  ]

  const roleSpecificSteps = {
    [UserRole.ADMIN]: [
      { title: 'Admin Setup', component: ServiceQuestions },
    ],
    [UserRole.SUPPLIER]: [
      { title: 'Supplier Questions', component: ServiceQuestions },
    ],
    [UserRole.MANAGER]: [
      { title: 'Team Setup', component: ServiceQuestions },
    ],
    [UserRole.CUSTOMER]: [
      { title: 'Customer Preferences', component: ServiceQuestions },
    ],
  }

  return [...commonSteps, ...(role ? roleSpecificSteps[role] || [] : []), { title: 'Completion', component: null }]
}

const ErrorState = ({ message, onRetry, onCancel }: { message: string, onRetry: () => void, onCancel: () => void }) => (
  <Card className="w-[350px] sm:w-[500px]">
    <CardHeader>
      <CardTitle>Onboarding Unavailable</CardTitle>
      <CardDescription>We encountered an issue while loading your onboarding process.</CardDescription>
    </CardHeader>
    <CardContent>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Button variant='outline' onClick={onCancel}>Back</Button>
      <Button onClick={onRetry}>Retry</Button>
    </CardFooter>
  </Card>
)

export default function OnboardingPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentStep, completedSteps, roleSpecificData, completed, cancelled } = useSelector((state: RootState) => state.onboarding)

  const [onboardingSteps, setOnboardingSteps] = useState<Array<{ title: string; component: React.ComponentType<any> | null }>>(user ? getOnboardingSteps(user.role) : [])
  const [stepData, setStepData] = useState<Record<string, any>>({})

  useEffect(() => {
    if (user) {
      dispatch(fetchProgress())
      setOnboardingSteps(getOnboardingSteps(user.role))
    }
  }, [user, dispatch])

  const handleStepComplete = (data: Record<string, any>) => {
    setStepData({ ...stepData, ...data })
  }

  const handleNext = async () => {
    if (!user) {
      console.error("User is missing. Unable to save progress or complete onboarding.")
      return
    }

    dispatch(setRoleSpecificData(stepData))

    if (currentStep < onboardingSteps.length - 1) {
      await dispatch(updateStep({ stepId: currentStep, status: "COMPLETED", data: stepData }))
      dispatch(completeStep(currentStep))
      dispatch(setCurrentStep(currentStep + 1))
    } else {
      await dispatch(finishOnboarding())
      router.push('/dashboard')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      dispatch(setCurrentStep(currentStep - 1))
    }
  }

  const handleCancel = () => {
    dispatch(cancelOnboarding())
    router.push('/dashboard')
  }

  const handleRetry = () => {
    if (user) {
      dispatch(fetchProgress())
    } else {
      router.push('/login')
    }
  }

  if (!user || completed || cancelled) {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <ErrorState
          message={!user ? "User information not found. Please log in and try again." : "Onboarding process is not available at the moment."}
          onRetry={handleRetry}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  const CurrentStepComponent = onboardingSteps[currentStep]?.component

  return (
    <div className="flex h-full items-center justify-center bg-none">
      <Card className="w-[350px] sm:w-[500px]">
        <CardHeader className='flex flex-row justify-between'>
          <div>
            <CardTitle>{onboardingSteps[currentStep]?.title}</CardTitle>
            <CardDescription>Step {currentStep + 1} of {onboardingSteps.length}</CardDescription>
          </div>
          <Button
            variant="destructive"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </CardHeader>
        <CardContent>
          <Progress value={(currentStep + 1) / onboardingSteps.length * 100} className="w-full mb-4" />
          {CurrentStepComponent && (
            <CurrentStepComponent
              role={user.role}
              name={user.name}
              onComplete={handleStepComplete}
              data={roleSpecificData}
            />
          )}
          {currentStep === onboardingSteps.length - 1 && (
            <div>
              <p>Congratulations! You've completed the onboarding process.</p>
              <p>Click 'Finish' to go to your dashboard and start using SlateChain.</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

