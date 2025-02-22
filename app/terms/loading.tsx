import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container max-w-4xl px-4 py-24 mx-auto">
      <Skeleton className="h-12 w-[300px] mx-auto mb-16" />

      <div className="space-y-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-8 w-[200px] mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ))}
      </div>
    </div>
  )
}

