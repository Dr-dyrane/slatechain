import * as React from "react"

export function LayoutLoader() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 bg-gray-200 animate-pulse" />
      <div className="flex-1 container items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)_200px] lg:gap-10">
        <aside className="hidden md:block w-[220px] lg:w-[240px]">
          <div className="h-[calc(100vh-4rem)] bg-gray-200 animate-pulse" />
        </aside>
        <main className="flex w-full flex-col overflow-hidden py-6">
          <div className="h-96 bg-gray-200 animate-pulse" />
        </main>
        <div className="hidden lg:block w-[200px]">
          <div className="h-[calc(100vh-4rem)] bg-gray-200 animate-pulse" />
        </div>
      </div>
      <div className="h-24 bg-gray-200 animate-pulse" />
    </div>
  )
}

