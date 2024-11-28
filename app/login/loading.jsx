import React from 'react';

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}></div>
);

const AuthLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full p-4 min-h-screen">
      <div className="my-14 flex flex-col items-center justify-center w-full text-center">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="bg-white rounded-3xl p-10 w-full mt-10 flex flex-col max-w-sm lg:max-w-md">
        <div className="mb-5 flex flex-col">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="mb-5 flex flex-col">
          <div className="flex justify-between mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-full" />
        </div>

        <Skeleton className="h-12 w-full rounded-md mt-4" />
      </div>
    </div>
  );
};

export default AuthLoading;

