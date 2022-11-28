import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Web3ReactProvider } from "@web3-react/core";
import Web3 from "web3";
import { GlobalStyles } from "@mui/material";
import { globalStyle } from "./styles";
import CssBaseline from "@mui/material/CssBaseline";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={(provider) => new Web3(provider)}>
      <GlobalStyles styles={globalStyle as any} />
      <CssBaseline />
      <App />
    </Web3ReactProvider>
  </React.StrictMode>
);
