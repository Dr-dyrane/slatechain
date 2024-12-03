import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface WelcomeProps {
  role: string;
  name: string;
}

export function Welcome({ role, name }: WelcomeProps) {
  const getRoleMessage = () => {
    switch (role) {
      case 'admin':
        return "Manage and oversee your entire supply chain in one place.";
      case 'supplier':
        return "Streamline inventory and orders with our platform.";
      case 'manager':
        return "Monitor and optimize team performance.";
      case 'customer':
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

