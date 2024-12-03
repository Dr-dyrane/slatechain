"use client"

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { registerUser } from '@/lib/slices/authSlice'
import { AppDispatch } from '@/lib/store'
import Link from 'next/link';

const steps = ['Basic Info', 'Role Selection', 'KYC Verification']

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    idDocument: null,
    taxDocument: null,
  })
  const [error, setError] = useState('')
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        await dispatch(registerUser(formData)).unwrap()
        router.push('/onboarding')
      } catch (error) {
        setError('Registration failed. Please try again.')
      }
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        )
      case 1:
        return (
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      case 2:
        return (
          <>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="idDocument">ID Document</Label>
              <Input
                id="idDocument"
                name="idDocument"
                type="file"
                onChange={(e) => handleFileUpload(e, 'idDocument')}
                required
              />
            </div>
            {formData.role === 'supplier' && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="taxDocument">Tax Document</Label>
                <Input
                  id="taxDocument"
                  name="taxDocument"
                  type="file"
                  onChange={(e) => handleFileUpload(e, 'taxDocument')}
                  required
                />
              </div>
            )}
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-none">
      <Card className="w-[400px]">
        <CardHeader className='text-center'>
          <Logo />
          <CardTitle className="text-2xl mt-2">SlateChain</CardTitle>
          <CardDescription>Create your SlateChain account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              {renderStepContent()}
            </div>
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            >
              {currentStep === 0 ? <Link href="/">Cancel</Link> : "Back"}

            </Button>
            <Button onClick={handleSubmit}>
              {currentStep === steps.length - 1 ? 'Register' : 'Next'}
            </Button>
          </div>
          <div className="text-sm text-center">
            <Link href="/">
              <Button variant="outline" asChild>Cancel</Button>
            </Link>
            Already have an account?{" "}
            <Button variant="link" asChild className="p-0">
              <a href="/login">Sign in</a>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

