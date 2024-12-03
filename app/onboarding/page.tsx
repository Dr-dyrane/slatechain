"use client"

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RootState } from '@/lib/store'

const onboardingSteps = [
  { title: 'Welcome', description: 'Welcome to SlateChain! Let\'s get you set up.' },
  { title: 'Profile Setup', description: 'Let\'s set up your profile information.' },
  { title: 'Preferences', description: 'Set your account preferences.' },
  { title: 'Completion', description: 'You\'re all set! Let\'s get started.' },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const user = useSelector((state: RootState) => state.auth.user)
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Onboarding complete, redirect to dashboard
      router.push('/dashboard')
    }
  }

  if (!user) return null

  return (
    <div className="flex h-full items-center justify-center bg-none">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>{onboardingSteps[currentStep].title}</CardTitle>
          <CardDescription>{onboardingSteps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(currentStep + 1) / onboardingSteps.length * 100} className="w-full" />
          {/* Add more content for each step here */}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStep === onboardingSteps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

