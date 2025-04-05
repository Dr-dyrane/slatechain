// components/shared/LoadingIndicator.tsx

"use client"

import { cn } from "@/lib/utils"

interface LoadingIndicatorProps {
    size?: "sm" | "md" | "lg"
    className?: string
    message?: string
}

export function LoadingIndicator({ size = "md", className, message }: LoadingIndicatorProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    }

    return (
        <div className={cn("flex flex-col items-center justify-center", className)}>
            <div
                className={cn("relative animate-[spin_1.5s_cubic-bezier(0.68,-0.55,0.27,1.55)_infinite]", sizeClasses[size])}
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-full border-t-2 border-primary opacity-75",
                        size === "sm" ? "border-t-1" : "border-t-2",
                    )}
                />
                <div
                    className={cn(
                        "absolute inset-0 rounded-full border-l-2 border-primary opacity-75 animate-pulse",
                        size === "sm" ? "border-l-1" : "border-l-2",
                    )}
                />
                <div
                    className={cn(
                        "absolute inset-0 rounded-full border-b-2 border-transparent",
                        size === "sm" ? "border-b-1" : "border-b-2",
                    )}
                />
                <div
                    className={cn(
                        "absolute inset-0 rounded-full border-r-2 border-transparent",
                        size === "sm" ? "border-r-1" : "border-r-2",
                    )}
                />
            </div>
            {message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}
        </div>
    )
}

