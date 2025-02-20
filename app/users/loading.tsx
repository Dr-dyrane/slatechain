// src/app/users/loading.tsx
import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const UsersPageSkeleton = () => {
    return (
        <div className="space-y-4 p-4">
            <h1 className="text-3xl font-bold">
                <Skeleton className='h-8 w-48' />
            </h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <div className="h-4 w-[100px] bg-muted animate-pulse rounded"></div>
                            </CardTitle>
                            <div className="h-4 w-4 bg-muted animate-pulse rounded-full"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                <div className="h-7 w-[80px] bg-muted animate-pulse rounded"></div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                <div className="h-3 w-[120px] bg-muted animate-pulse rounded mt-1"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="grid  gap-4">
                <Card>
                    <CardHeader>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="flex flex-col space-y-1">
                                    <Skeleton className="h-5 w-[200px]" />
                                    <Skeleton className="h-4 w-[150px]" />
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="flex flex-col space-y-1">
                                    <Skeleton className="h-5 w-[200px]" />
                                    <Skeleton className="h-4 w-[150px]" />
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="flex flex-col space-y-1">
                                    <Skeleton className="h-5 w-[200px]" />
                                    <Skeleton className="h-4 w-[150px]" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default UsersPageSkeleton