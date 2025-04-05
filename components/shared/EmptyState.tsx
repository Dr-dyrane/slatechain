// components/shared/EmptyState.tsx

"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { File, MessageSquare } from "lucide-react"

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    "File": File,
    "MessageSquare": MessageSquare,
};

interface EmptyStateProps {
    icon: string
    title: string
    description: string
    actionLabel?: string
    onAction?: () => void
    className?: string
}

export function EmptyState({ icon: icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
    const Icon = icons[icon] || File

    return (
        <div className={cn("flex flex-col items-center justify-center text-center p-8", className)}>
            <Icon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>
            {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
        </div>
    )
}

