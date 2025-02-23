"use client";

import { useEffect, useState } from "react";

export default function TestDBPage() {
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function checkDB() {
      try {
        const res = await fetch("/api/test-db");
        const data = await res.json();
        setStatus(data);
      } catch (error) {
        setStatus({ success: false, message: "Failed to fetch API response 😭" });
      }
    }
    checkDB();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      {status ? (
        <div className="p-6 border-2 rounded-lg shadow-lg text-lg">
          {status.success ? (
            <div>
              <p className="text-4xl">😀</p>
              <p className="mt-2 text-green-400">{status.message}</p>
            </div>
          ) : (
            <div>
              <p className="text-4xl">❌</p>
              <p className="mt-2 text-red-400">{status.message}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-yellow-300">Checking MongoDB connection... ⏳</p>
      )}
    </div>
  );
}
