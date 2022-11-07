import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Web3ReactProvider } from "@web3-react/core";
import Web3 from "web3";
import { QueryClient, QueryClientProvider } from "react-query";
import { GlobalStyles } from "@mui/material";

const client = new QueryClient();

const globalStyle = {
  "& *": {
    color: "white",
  },
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <Web3ReactProvider getLibrary={(provider) => new Web3(provider)}>
        <GlobalStyles styles={globalStyle as any} />
        <App />
      </Web3ReactProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
