import React from "react";
import { ErrorBoundary } from "react-error-boundary";

const TwapFallbackUI = () => {
  return (
    <div className="twap-error-fallback">
      <p>Something went wrong</p>
      {/* <Button variant="contained" onClick={() => window.location.reload()}>
        Reload
      </Button> */}
    </div>
  );
};

export function TwapErrorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => {
        // You can also log the error to an error reporting service like AppSignal
        // logErrorToMyService(error, errorInfo);
        console.error(error);
      }}
      FallbackComponent={TwapFallbackUI}
    >
      <>{children}</>
    </ErrorBoundary>
  );
}
