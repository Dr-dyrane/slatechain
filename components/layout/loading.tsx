import * as React from "react"


const LayoutLoader = () => {

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}></div>
  );

  return (
    <div className="bg-white flex items-center justify-center z-50">
      <div className="flex flex-col bg-layout overflow-y-hidden min-h-screen w-full">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - hidden on mobile */}
          <div className="w-[22.5%] max-w-[240px] bg-layout hidden md:flex flex-col p-6">
            <div className={`flex items-center h-8 w-32 mb-14 rounded-md bg-gray-300`} />
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full bg-gray-300" />
              ))}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex flex-col w-full">
            {/* Navbar */}
            <div className="bg-layout py-4 px-8 flex justify-between items-center">
              <Skeleton className="h-8 w-32 bg-gray-300" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full bg-gray-300" />
                <Skeleton className="h-8 w-24 bg-gray-300" />
              </div>
            </div>

            {/* Dashboard content */}
            <div className="flex-1 p-8 bg-[#f5f8fa] md:rounded-[32px] overflow-y-auto">
              {/* Header section */}
              <div className="flex justify-between items-center mb-5">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-32" />
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mb-10">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
              </div>

              {/* Table header */}
              <Skeleton className="h-8 w-64 mb-4" />

              {/* Table rows */}
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded" />
                ))}
              </div>
            </div>
          </div>

          {/* Right padding - hidden on mobile */}
          <div className="w-[40px] bg-layout hidden md:block"></div>
        </div>

        {/* Footer */}
        <footer className="w-full px-4 py-2.5 bg-layout text-gray-500 text-center">
          <Skeleton className="h-6 w-64 mx-auto bg-gray-30" />
        </footer>
      </div>
    </div>
  );
};


export default LayoutLoader; 