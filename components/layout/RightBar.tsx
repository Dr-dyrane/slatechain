import * as React from "react"

export function RightBar() {
  return (
    <div className="hidden xl:block w-64 p-4 bg-background">
      <h2 className="text-lg font-semibold mb-4">Notifications</h2>
      <div className="space-y-4">
        <div className="p-3 bg-secondary rounded-md">
          <p className="text-sm">New feature: Dark mode is now available!</p>
        </div>
        <div className="p-3 bg-secondary rounded-md">
          <p className="text-sm">Your subscription will renew in 5 days.</p>
        </div>
      </div>
    </div>
  )
}

