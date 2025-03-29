import React from "react"

const AdminGuideSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-4">
      {/* Page Title Skeleton */}
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-muted rounded-lg mb-4"></div>
      </div>

      {/* Section Skeleton */}
      {[...Array(3)].map((_, index) => (
        <div key={index} className="animate-pulse space-y-2">
          <div className="h-6 w-32 bg-muted rounded-md"></div>
          <div className="h-4 w-full bg-muted rounded-md"></div>
          <div className="h-4 w-3/4 bg-muted rounded-md"></div>
          <div className="h-4 w-2/3 bg-muted rounded-md"></div>
        </div>
      ))}

      {/* Card Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="animate-pulse p-4 bg-muted rounded-lg space-y-2"
          >
            <div className="h-5 w-24 bg-muted rounded-md"></div>
            <div className="h-4 w-full bg-muted rounded-md"></div>
            <div className="h-4 w-3/4 bg-muted rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminGuideSkeleton
