"use client"

import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { ReactNode, Component } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, info);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">Oops! Something went wrong.</h1>
            <p className="mt-6 text-base leading-7 text-muted-foreground">
              {typeof error === 'object' && error !== null && 'message' in error
                ? error.message
                : "An unexpected error occurred."}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button onClick={this.resetError} variant="default">
                Try again
              </Button>
              <Button variant="outline" asChild>
                <a href="/">Go back home</a>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
