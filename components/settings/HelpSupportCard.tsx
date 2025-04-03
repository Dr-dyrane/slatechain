// components/settings/HelpSupportCard.tsx

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import Link from "next/link"

export function HelpSupportCard() {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center space-x-2">
                    <HelpCircle className="h-6 w-6" />
                    <span>Help & Support</span>
                </CardTitle>
                <CardDescription>Get help with using SupplyCycles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Need assistance with SupplyCycles? Our comprehensive help center provides guides, FAQs, and direct support
                    options.
                </p>
                <Button asChild className="w-full">
                    <Link href="/settings/help-support">Visit Help Center</Link>
                </Button>
            </CardContent>
        </Card>
    )
}

