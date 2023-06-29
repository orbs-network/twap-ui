"use client";

import React from "react";
import { ErrorBoundary } from "react-error-boundary";

const FallbackUI = () => {
  return <div style={{ background: "yellow" }}>Error</div>;
};

export function AdapterWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => {
        // You can also log the error to an error reporting service like AppSignal
        // logErrorToMyService(error, errorInfo);
        console.error(error);
      }}
      FallbackComponent={FallbackUI}
    >
      <>{children}</>
    </ErrorBoundary>
  );
}

export default AdapterWrapper;
