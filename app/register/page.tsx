"use client"

import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { register } from '@/lib/slices/authSlice'
import { AppDispatch, RootState } from '@/lib/store'
import Link from 'next/link'
import { UserRole } from '@/lib/types'
import { z } from 'zod'
import { Eye, EyeOff, Check, X } from 'lucide-react'

const steps = ['Basic Info']

// Zod schema for validation (without password specifics initially)
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
  phoneNumber: z.string(), // Add phoneNumber to the schema
  role: z.enum(['customer', 'admin', 'staff']).default('customer') // Add role to the schema
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [currentStep, setStep] = useState(0)
  const [formData, setFormData] = useState<RegisterFormValues>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'customer',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { error, loading } = useSelector((state: RootState) => state.auth)
  const router = useRouter()

  const [passwordStrength, setPasswordStrength] = useState<{ hasUppercase: boolean; hasLowercase: boolean; hasNumber: boolean; isLongEnough: boolean } | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  }

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(validatePasswordStrength(formData.password));
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password]);

  useEffect(() => {
    if (formData.confirmPassword && formData.password) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordsMatch(false);
    }
  }, [formData.confirmPassword, formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validate form data using Zod
      registerSchema.parse(formData)

      if (currentStep < steps.length - 1) {
        setStep(currentStep + 1)
      } else {
        const registerData = {
          ...formData,
          name: `${formData.firstName} ${formData.lastName}`,
          role: formData.role as UserRole, // Cast the role to UserRole
        }
        const result = await dispatch(register(registerData)).unwrap()

        if (register.fulfilled.match(result)) {
          router.push('/dashboard')
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error('Validation failed', err.errors)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1)
    } else {
      router.push('/')
    }
  }

  const validatePasswordStrength = (password: string) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= 8;
    return { hasUppercase, hasLowercase, hasNumber, isLongEnough };
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
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
            <div className="flex flex-col space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  variant="ghost"
                  onClick={handlePasswordVisibility}
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={16} className='text-muted-foreground' /> : <Eye size={16} className='text-muted-foreground' />}
                </Button>
              </div>
              {passwordStrength && (
                <div className="space-y-1 mt-3 bg-muted p-2 rounded-md">
                  <p className={`text-sm ${passwordStrength.isLongEnough ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordStrength.isLongEnough ? <Check className="inline mr-1" /> : <X className="inline mr-1" />}
                    At least 8 characters
                  </p>
                  <p className={`text-sm ${passwordStrength.hasUppercase ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordStrength.hasUppercase ? <Check className="inline mr-1" /> : <X className="inline mr-1" />}
                    Contains uppercase letter
                  </p>
                  <p className={`text-sm ${passwordStrength.hasLowercase ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordStrength.hasLowercase ? <Check className="inline mr-1" /> : <X className="inline mr-1" />}
                    Contains lowercase letter
                  </p>
                  <p className={`text-sm ${passwordStrength.hasNumber ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordStrength.hasNumber ? <Check className="inline mr-1" /> : <X className="inline mr-1" />}
                    Contains number
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <Button
                  variant="ghost"
                  onClick={handleConfirmPasswordVisibility}
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff size={16} className='text-muted-foreground' /> : <Eye size={16} className='text-muted-foreground' />}
                </Button>
              </div>
              {formData.password && formData.confirmPassword && passwordsMatch && (
                <p className="text-sm text-green-500 flex items-center mt-1">
                  <Check className="inline mr-1" />
                  Passwords match
                </p>
              )}
              {!passwordsMatch && formData.confirmPassword && formData.password && (
                <p className="text-sm text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen h-auto p-8 items-center justify-center bg-none">
      <Card className="w-[350px] sm:w-[400px]">
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
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              {currentStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Registering...' : currentStep === steps.length - 1 ? 'Register' : 'Next'}
            </Button>
          </div>
          <div className="text-sm text-center">
            Already have an account?{" "}
            <Button variant="link" asChild className="p-0">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}