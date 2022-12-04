import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Web3ReactProvider } from "@web3-react/core";
import Web3 from "web3";
import { GlobalStyles } from "@mui/material";
import { globalStyle } from "./styles";
import CssBaseline from "@mui/material/CssBaseline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { MetaTags } from "./defaults";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Web3ReactProvider getLibrary={(provider) => new Web3(provider)}>
    <GlobalStyles styles={globalStyle as any} />
    <CssBaseline />
    <QueryClientProvider client={queryClient}>
      <Router basename={process.env.PUBLIC_URL}>
        <App />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </Web3ReactProvider>
);
