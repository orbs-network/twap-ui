import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { structuralSharing } from "@wagmi/core/query";
import { BrowserRouter } from "react-router-dom";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

import { darkTheme, lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./config";
import { DappProvider, useDappContext } from "./context";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      structuralSharing,
    },
  },
});

const Root = () => {
  const { theme } = useDappContext();

  return (
    <RainbowKitProvider modalSize="compact" theme={theme === "dark" ? darkTheme() : lightTheme()}>
      <App />
    </RainbowKitProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <DappProvider>
            <Root />
          </DappProvider>
        </QueryParamProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  </WagmiProvider>,
);
