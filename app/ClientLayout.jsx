"use client";

import { useEffect } from "react";

const ClientLayout = ({ children }) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleChunkLoadError = (e) => {
        if (e.message.includes("ChunkLoadError")) {
          window.location.reload(); // Reload the page when a chunk load error occurs
        }
      };

      window.addEventListener("error", handleChunkLoadError);

      // Cleanup event listener on component unmount
      return () => {
        window.removeEventListener("error", handleChunkLoadError);
      };
    }
  }, []);

  return (
    <>
      {children}
    </>
  );
};

export default ClientLayout;
