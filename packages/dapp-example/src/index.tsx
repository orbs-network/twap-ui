import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Web3ReactProvider } from "@web3-react/core";
import Web3 from "web3";
import { GlobalStyles } from "@mui/material";
import Wrapper from "./Wrapper";

const globalStyle = {
  "& *": {
    color: "white",
  },
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={(provider) => new Web3(provider)}>
      <GlobalStyles styles={globalStyle as any} />
      <Wrapper />
    </Web3ReactProvider>
  </React.StrictMode>
);
