"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "../components/ui/button"
import { type ReactNode, Component, useEffect } from "react"
import { connect } from "react-redux"
import { LogoutError } from "@/lib/api/apiClient"
import { logout } from "@/lib/slices/authSlice"
import { useRouter } from "next/navigation"

interface ErrorBoundaryProps {
  children: ReactNode
  logout: () => void // logout action provided by redux
}

interface ErrorBoundaryState {
  hasError: boolean
  error: any
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private sessionExpiredHandler: (() => void) | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }

  componentDidMount() {
    // Listen for the custom session expired event
    this.sessionExpiredHandler = this.handleSessionExpired.bind(this)
    window.addEventListener("auth:sessionExpired", this.sessionExpiredHandler)
  }

  componentWillUnmount() {
    // Clean up event listener
    if (this.sessionExpiredHandler) {
      window.removeEventListener("auth:sessionExpired", this.sessionExpiredHandler)
    }
  }

  async handleSessionExpired() {
    try {
      await this.props.logout() // Dispatch logout action
    } catch (logoutError) {
      console.error("Logout failed:", logoutError)
    } finally {
      window.location.href = "/login" // Redirect manually
    }
  }

  async componentDidCatch(error: any, info: any) {
    console.error("Error caught by ErrorBoundary:", error, info)

    // Handle LogoutError specifically
    if (error instanceof LogoutError) {
      await this.handleSessionExpired()
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    const { hasError, error } = this.state
    const { children } = this.props

    if (hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center flex gap-4 flex-col">
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Oops! Something went wrong.
            </h1>
            <p className="mt-6 text-base leading-7 text-muted-foreground">
              {typeof error === "object" && error !== null && "message" in error
                ? error.message
                : "An unexpected error occurred."}
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
      )
    }

    return children
  }
}

// Wrapper component to use hooks with class component
function ErrorBoundary(props: ErrorBoundaryProps) {
  const router = useRouter()

  useEffect(() => {
    // Global listener for session expired events
    const handleGlobalSessionExpired = async () => {
      try {
        await props.logout()
        router.push("/login")
      } catch (error) {
        console.error("Global logout failed:", error)
        window.location.href = "/login" // Fallback
      }
    }

    window.addEventListener("auth:sessionExpired", handleGlobalSessionExpired)

    return () => {
      window.removeEventListener("auth:sessionExpired", handleGlobalSessionExpired)
    }
  }, [props.logout, router])

  return <ErrorBoundaryClass {...props} />
}

const mapDispatchToProps = {
  logout,
}

export default connect(null, mapDispatchToProps)(ErrorBoundary)

