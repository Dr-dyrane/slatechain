// components/shared/TypingIndicator.tsx

"use client"

import { cn } from "@/lib/utils"

interface TypingIndicatorProps {
    className?: string
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
    return (
        <div className={cn("flex items-center gap-1 py-2 px-3 rounded-lg bg-muted max-w-[80px]", className)}>
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
    )
}

