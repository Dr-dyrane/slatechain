import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { tokenManager } from '@/lib/helpers/tokenManager';
import { logout } from '@/lib/slices/authSlice';

interface ErrorStateProps {
  title: string;
  description: string;
  message: string;
  onRetry: () => void;
  onCancel: () => void;
}

export const ErrorState = ({
  title = "Onboarding Unavailable",
  description = "We encountered an issue while loading your onboarding process.",
  message,
  onRetry,
  onCancel
}: ErrorStateProps) => {

  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const handleLogout = async () => {
    await dispatch(logout())
    router.push("/login")
  }

  useEffect(() => {
    // Check if error is a session expiration error or if token is undefined
    const isSessionExpired =
      message.includes("session expired") || message.includes("please log in again...")

    const hasNoToken = !tokenManager.getAccessToken()

    if (isSessionExpired || hasNoToken) {
      // If session expired or no token, log the user out
      handleLogout()
    }
  }, [message])

  return (
    <Card className="w-[350px] sm:w-[500px]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>Back</Button>
        <Button onClick={onRetry}>Retry</Button>
      </CardFooter>
    </Card>
  );
}
