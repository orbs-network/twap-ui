import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { analytics } from "./analytics";

const FallbackUI = () => {
  return <div style={{ background: "yellow" }}>Error</div>;
};

export function TwapErrorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => {
        analytics.uiCrashed("twap", error);
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

export function OrdersErrorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => {
        analytics.uiCrashed("orders", error);
      }}
      fallbackRender={() => <></>}
    >
      <>{children}</>
    </ErrorBoundary>
  );
}
