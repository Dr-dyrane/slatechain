import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container max-w-4xl px-4 py-24 mx-auto">
      <Skeleton className="h-12 w-[300px] mx-auto mb-16" />

      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-8 w-[200px]" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-[90%] mb-2" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
        ))}
      </div>
    </div>
  )
}

