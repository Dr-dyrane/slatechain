"use client"

import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RootState, AppDispatch } from '@/lib/store'
import { setCurrentStep, completeStep, setRoleSpecificData } from '@/lib/slices/onboardingSlice'

const onboardingSteps = [
  { title: 'Welcome', description: 'Welcome to SlateChain! Let\'s get you set up.' },
  { title: 'Profile Setup', description: 'Let\'s set up your profile information.' },
  { title: 'Service-Specific Questions', description: 'Tell us more about your business.' },
  { title: 'Preferences', description: 'Set your account preferences.' },
  { title: 'Completion', description: 'You\'re all set! Let\'s get started.' },
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

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      dispatch(completeStep(currentStep))
      dispatch(setCurrentStep(currentStep + 1))
    } else {
      // Onboarding complete, redirect to dashboard
      router.push('/dashboard')
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <p>Welcome to SlateChain, {user?.name}!</p>
            <p>We're excited to have you on board. Let's get your account set up.</p>
          </div>
        )
      case 1:
        return (
          <div>
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              value={roleSpecificData.company || ''}
              onChange={(e) => dispatch(setRoleSpecificData({ company: e.target.value }))}
            />
          </div>
        )
      case 2:
        return (
          <div>
            {user?.role === 'supplier' && (
              <>
                <Label htmlFor="productTypes">What types of products do you supply?</Label>
                <Input
                  id="productTypes"
                  value={roleSpecificData.productTypes || ''}
                  onChange={(e) => dispatch(setRoleSpecificData({ productTypes: e.target.value }))}
                />
              </>
            )}
            {user?.role === 'manager' && (
              <>
                <Label htmlFor="team">Which team will you oversee?</Label>
                <Input
                  id="team"
                  value={roleSpecificData.team || ''}
                  onChange={(e) => dispatch(setRoleSpecificData({ team: e.target.value }))}
                />
              </>
            )}
          </div>
        )
      case 3:
        return (
          <div>
            <Label htmlFor="notifications">Enable notifications?</Label>
            <Input
              id="notifications"
              type="checkbox"
              checked={roleSpecificData.notifications || false}
              onChange={(e) => dispatch(setRoleSpecificData({ notifications: e.target.checked }))}
            />
          </div>
        )
      case 4:
        return (
          <div>
            <p>Congratulations! You've completed the onboarding process.</p>
            <p>Click 'Finish' to go to your dashboard and start using SlateChain.</p>
          </div>
        )
      default:
        return null
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
          <Progress value={(currentStep + 1) / onboardingSteps.length * 100} className="w-full mb-4" />
          {renderStepContent()}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => currentStep > 0 && dispatch(setCurrentStep(currentStep - 1))}
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

