import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserRole } from "@/lib/types"
import { WelcomeProps } from "@/lib/types/onboarding";


export function Welcome({ role, name, onComplete }: WelcomeProps) {
  const getRoleMessage = () => {
    switch (role) {
      case UserRole.ADMIN:
        return "Manage and oversee your entire supply chain in one place.";
      case UserRole.SUPPLIER:
        return "Streamline inventory and orders with our platform.";
      case UserRole.MANAGER:
        return "Monitor and optimize team performance.";
      case UserRole.CUSTOMER:
        return "Browse, shop, and track orders seamlessly.";
      default:
        return "Welcome to SlateChain!";
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to SlateChain, {name}!</CardTitle>
        <CardDescription>Let's get you set up and ready to go.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{getRoleMessage()}</p>
        <p>We'll guide you through the setup process to ensure you get the most out of our platform.</p>
      </CardContent>
    </Card>
  )
}

