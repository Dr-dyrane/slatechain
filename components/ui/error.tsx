import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
}: ErrorStateProps) => (
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
