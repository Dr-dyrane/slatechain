"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { register } from '@/lib/slices/authSlice';
import { AppDispatch, RootState } from '@/lib/store';
import Link from 'next/link';
import { UserRole } from '@/lib/types';
import { z } from 'zod';
import { Eye, EyeOff, Check, X, User, Mail, Lock, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const steps = ['Basic Info'];

// Zod schema for validation
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
  phoneNumber: z.string(),
  role: z.enum(['customer', 'admin', 'staff']).default('customer')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [currentStep, setStep] = useState(0);
  const [formData, setFormData] = useState<RegisterFormValues>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'customer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  const [passwordStrength, setPasswordStrength] = useState<{ hasUppercase: boolean; hasLowercase: boolean; hasNumber: boolean; isLongEnough: boolean } | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [formErrors, setFormErrors] = useState<z.ZodError | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors(null);
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
    e.preventDefault();
    setFormErrors(null);

    try {
      // Validate form data using Zod
      registerSchema.parse(formData);

      if (currentStep < steps.length - 1) {
        setStep(currentStep + 1);
      } else {
        const registerData = {
          ...formData,
          name: `${formData.firstName} ${formData.lastName}`,
          role: formData.role as UserRole,
        };
        const result = await dispatch(register(registerData)).unwrap();

        if (register.fulfilled.match(result)) {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.log('Validation failed', err);
        setFormErrors(err);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1);
    }
  };

  const handleGoBack = () => {
    router.push('/');

  };

  const validatePasswordStrength = (password: string) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isLongEnough = password.length >= 8;
    return { hasUppercase, hasLowercase, hasNumber, isLongEnough };
  };

  const getFieldError = (fieldName: keyof RegisterFormValues) => {
    return formErrors?.flatten().fieldErrors[fieldName]?.[0];
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="flex flex-col space-y-1.5">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Label htmlFor="firstName" className='flex items-center gap-1'>
                      <User className="h-4 w-4 text-muted-foreground" /> First Name
                    </Label>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                      Enter your first name
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              {getFieldError('firstName') && <p className="text-sm text-red-500">{getFieldError('firstName')}</p>}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Label htmlFor="lastName" className='flex items-center gap-1'>
                      <User className="h-4 w-4 text-muted-foreground" /> Last Name
                    </Label>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                      Enter your last name
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
              {getFieldError('lastName') && <p className="text-sm text-red-500">{getFieldError('lastName')}</p>}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Label htmlFor="email" className='flex items-center gap-1'>
                      <Mail className="h-4 w-4 text-muted-foreground" /> Email
                    </Label>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                      Enter your email address
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              {getFieldError('email') && <p className="text-sm text-red-500">{getFieldError('email')}</p>}
            </div>
            <div className="flex flex-col space-y-2">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Label htmlFor="password" className='flex items-center gap-1'>
                      <Lock className="h-4 w-4 text-muted-foreground" /> Password
                    </Label>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                      Enter your new account password
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
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
              {getFieldError('password') && <p className="text-sm text-red-500">{getFieldError('password')}</p>}
            </div>
            <div className="flex flex-col space-y-2">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Label htmlFor="confirmPassword" className='flex items-center gap-1'>
                      <Lock className="h-4 w-4 text-muted-foreground" /> Confirm Password
                    </Label>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                      Confirm your new account password
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
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
              {getFieldError('confirmPassword') && <p className="text-sm text-red-500">{getFieldError('confirmPassword')}</p>}
            </div>
            <div className="flex flex-col space-y-1.5">
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Label htmlFor="phoneNumber" className='flex items-center gap-1'>
                      <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                    </Label>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                      Enter your phone number
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
              {getFieldError('phoneNumber') && <p className="text-sm text-red-500">{getFieldError('phoneNumber')}</p>}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen h-auto p-8 items-center justify-center bg-none">
      <Card className="w-[350px] sm:w-[400px] relative">
        <CardHeader className='text-center'>
          <Logo />
          <CardTitle className="text-2xl mt-2">SlateChain</CardTitle>
          <CardDescription>Create your SlateChain account</CardDescription>
          <Button variant='ghost'
            size={'icon'}
            onClick={handleGoBack}
            className="absolute top-2 rounded-full right-3">
            <X size={16} />
          </Button>
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
          <div className={cn(
            'flex  w-full items-center',
            currentStep > 0 ? 'justify-between' : 'justify-end'
          )
          }>
            {
              currentStep > 0 && <Button
                variant="outline"
                onClick={handleBack}
                className="gap-1"
              >
                <ArrowLeft size={16} />
                Back
              </Button>
            }

            <Button onClick={handleSubmit} disabled={loading} className="gap-1 w-full">
              {loading ? 'Registering...' : currentStep === steps.length - 1 ? 'Register' : 'Next'}
              <ArrowRight size={16} />
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
  );
}