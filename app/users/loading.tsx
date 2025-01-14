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
           <div className="grid  gap-4">
                 <Card>
                    <CardHeader>
                    </CardHeader>
                     <CardContent>
                           <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                               <Skeleton className="h-9 w-9 rounded-full"/>
                                <div className="flex flex-col space-y-1">
                                <Skeleton className="h-5 w-[200px]" />
                                    <Skeleton className="h-4 w-[150px]"/>
                                   </div>
                            </div>
                              <div className="flex items-center space-x-4">
                               <Skeleton className="h-9 w-9 rounded-full"/>
                              <div className="flex flex-col space-y-1">
                                   <Skeleton className="h-5 w-[200px]"/>
                                   <Skeleton className="h-4 w-[150px]"/>
                                </div>
                            </div>
                             <div className="flex items-center space-x-4">
                                <Skeleton className="h-9 w-9 rounded-full"/>
                                 <div className="flex flex-col space-y-1">
                                   <Skeleton className="h-5 w-[200px]"/>
                                   <Skeleton className="h-4 w-[150px]"/>
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