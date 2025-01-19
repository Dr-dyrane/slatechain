"use client"

import { AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ReactNode, Component } from 'react';

import { connect } from 'react-redux'; // To connect Redux state and dispatch to the class component

import { useRouter } from 'next/router'; // We still use router, but we can use it in a functional context
import { LogoutError } from '@/lib/api/apiClient';
import { logout } from '@/lib/slices/authSlice';

interface ErrorBoundaryProps {
  children: ReactNode;
  logout: () => void; // logout action provided by redux
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

  async componentDidCatch(error: any, info: any) {
    console.error('Error caught by ErrorBoundary:', error, info);

    if (error instanceof LogoutError) {
      const { logout } = this.props;
      const router = useRouter();

      // Perform the async logout operation
      await logout();

      // After logout, redirect to login page
      router.push('/login');
    }
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
          <div className="text-center flex gap-4 flex-col">
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Oops! Something went wrong.
            </h1>
            <p className="mt-6 text-base leading-7 text-muted-foreground">
              {typeof error === 'object' && error !== null && 'message' in error
                ? error.message
                : 'An unexpected error occurred.'}
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
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

const mapDispatchToProps = {
  logout,
};

export default connect(null, mapDispatchToProps)(ErrorBoundary);
