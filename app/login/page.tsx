"use client";

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppDispatch, RootState } from '@/lib/store';
import { login, googleLogin, resetLoading } from '@/lib/slices/authSlice';
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, LogIn, X } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [showForgotPassowrd, setShowForgotPassowrd] = useState(false);
  const { error, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(resetLoading());
    };
  }, [dispatch]);

  const handleForgotPassword = () => {
    setShowForgotPassowrd(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      router.push('/dashboard');
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleGoogleSignIn = () => {
    dispatch(googleLogin());
  };
  const handleGoBack = () => {
    router.push('/')
  }

  return (
    <div className="flex h-auto min-h-screen p-8 items-center justify-center bg-none">
      <Card className="w-[350px] relative">
        <CardHeader className="text-center">
          <Logo />
          <CardTitle className="text-2xl mt-2">SlateChain</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
          <Button variant='ghost' size={'icon'} onClick={handleGoBack} className="absolute top-2 rounded-full right-3">
              <X size={16}/>
            </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
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
                        Enter your registered email address
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Tooltip.Provider>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Label htmlFor="password" className='flex items-center gap-1'>
                        <Lock className="h-4 w-4 text-muted-foreground" /> Password
                      </Label>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                        Enter your account password
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
                <div className="relative">
                  <Input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={togglePasswordVisibility}
                  >
                    {passwordVisible ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex justify-end w-full items-center">
            <Button variant='link' size={'sm'} onClick={handleForgotPassword} className="">
              Forgot password?
            </Button>
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full gap-2">
            {loading ? 'Logging in...' : 'Login'} <LogIn size={16} />
          </Button>
          <GoogleSignInButton onClick={handleGoogleSignIn} className="w-full gap-2">
            Sign in with Google
          </GoogleSignInButton>
          <div className="text-sm text-center">
            Don't have a chain?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
      <ForgotPasswordModal isOpen={showForgotPassowrd} onClose={() => setShowForgotPassowrd(false)} />
    </div>
  );
}