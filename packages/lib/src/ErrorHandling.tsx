import { styled } from "styled-components";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTwapContext } from ".";
import { analytics } from "./analytics";

const StyledContainer = styled("div")<{ isDarkTheme?: number }>(({ theme, isDarkTheme }) => {
  return {
    alignItems: "center",
    display: "flex",
    flexDirection: "column",
    p: {
      color: isDarkTheme ? "white" : "black",
      padding: 0,
      fontSize: 20,
      textAlign: "center",
    },
  };
});

const TwapFallbackUI = () => {
  const isDarkTheme = useTwapContext().dappProps.isDarkTheme;

  return (
    <StyledContainer isDarkTheme={isDarkTheme ? 1 : 0}>
      <p>Something went wrong</p>
      {/* <Button variant="contained" onClick={() => window.location.reload()}>
        Reload
      </Button> */}
    </StyledContainer>
  );
};

const OrdersFallbackUI = () => {
  const isDarkTheme = useTwapContext().dappProps.isDarkTheme;

  return (
    <StyledContainer isDarkTheme={isDarkTheme ? 1 : 0}>
      <p>Error in loading orders</p>
    </StyledContainer>
  );
};

export function TwapErrorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => {
        analytics.onUiCreashed(error);
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

export function OrdersErrorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => {
        analytics.onUiCreashed(error);
      }}
      fallbackRender={OrdersFallbackUI}
    >
      <>{children}</>
    </ErrorBoundary>
  );
}
