"use client"

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RootState, AppDispatch } from '@/lib/store'
import { setCurrentStep, completeStep, setRoleSpecificData, completeOnboarding, cancelOnboarding } from '@/lib/slices/onboardingSlice'
import { Welcome } from '@/components/onboarding/Welcome'
import { ProfileSetup } from '@/components/onboarding/ProfileSetup'
import { ServiceQuestions } from '@/components/onboarding/ServiceQuestions'
import { Preferences } from '@/components/onboarding/Preferences'

const onboardingSteps = [
  { title: 'Welcome', component: Welcome },
  { title: 'Profile Setup', component: ProfileSetup },
  { title: 'Service-Specific Questions', component: ServiceQuestions },
  { title: 'Preferences', component: Preferences },
  { title: 'Completion', component: null },
]

export default function OnboardingPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentStep, completedSteps, roleSpecificData } = useSelector((state: RootState) => state.onboarding)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleNext = (data: any) => {
    // Ensure we're only passing serializable data
    const serializableData = Object.entries(data).reduce((acc, [key, value]) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        acc[key] = value;
      }
      return acc;
    }, {} as { [key: string]: string | number | boolean });

    dispatch(setRoleSpecificData(serializableData));
    if (currentStep < onboardingSteps.length - 1) {
      dispatch(completeStep(currentStep));
      dispatch(setCurrentStep(currentStep + 1));
    } else {
      // Onboarding complete
      dispatch(completeOnboarding());
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      dispatch(setCurrentStep(currentStep - 1))
    }
  }

  const handleCancel = () => {
    dispatch(cancelOnboarding())
    router.push('/dashboard')
  }

  const CurrentStepComponent = onboardingSteps[currentStep].component

  if (!user) return null

  return (
    <div className="flex h-full items-center justify-center bg-none">
      <Card className="w-[350px] sm:w-[500px]">
        <CardHeader className='flex flex-row justify-between'>
          <div>
            <CardTitle>{onboardingSteps[currentStep].title}</CardTitle>
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
              onComplete={handleNext}
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

          {currentStep === onboardingSteps.length - 1 ? (
            <Button onClick={() => handleNext({})}>
              Finish
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

