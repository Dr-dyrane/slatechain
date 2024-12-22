// src/components/skeleton/ProfileSkeleton.tsx
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <h1 className="text-3xl font-bold">
         <Skeleton className='h-8 w-48'/>
      </h1>
          <div className='space-y-4'>
              <div className="flex flex-col items-center space-y-2">
              <Skeleton className='h-32 w-32 rounded-full'/>
                   <div className="flex flex-col items-center">
                      <Skeleton className="h-8 w-48" />
                     <div className='flex space-x-1'>
                            <Skeleton className="h-4 w-16"/>
                        </div>
                    </div>
                </div>
             <div className="space-y-4">
                <Skeleton className="h-12 w-full"/>
              <Skeleton className="h-12 w-full"/>
              <Skeleton className="h-12 w-full"/>
                </div>
            </div>
              <Skeleton className="h-8 w-32"/>
          <div className="grid grid-cols-2 gap-2 my-4">
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
          </div>
        </div>
  );
}