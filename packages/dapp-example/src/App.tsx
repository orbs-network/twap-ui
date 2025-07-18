import { ThemeProvider } from "styled-components";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { Dapp } from "./dapp";
import { useDappContext } from "./context";
import { GlobalStyles, darkTheme } from "./styles";
import { ConfigSelector } from "./Components";
import { ConfigProvider } from "antd";

function App() {
  const { config } = useDappContext();

  return (
    <ThemeProvider theme={darkTheme}>
      <ConfigProvider
        theme={{
          components: {
            Table: {
              colorBgContainer: "#141414",
              colorText: "#fff",
              colorLink: "#fff",
              colorTextHeading: "#fff",
            },
            Dropdown: {
              colorBgElevated: "#141414",
              colorText: "#fff",
              colorBorder: "transparent",
            },
            Input: {
              colorBgContainer: "#141414",
              colorText: "#fff",
              colorBorder: "transparent",
            },
            Typography: {
              colorText: "#fff",
            },
            Button: {
              colorText: "#fff",
              colorTextDisabled: "#fff",
              colorBgContainerDisabled: "#131313",
              borderColorDisabled: "transparent",
              colorBgBase: "#141414",
            },
          },
        }}
      >
        <div className="app">
          <GlobalStyles config={config} />
          {/* <ToggleTheme /> */}
          <div className="navbar">
            <ConfigSelector />
            <ConnectButton />
          </div>
          <Dapp />
        </div>
      </ConfigProvider>
    </ThemeProvider>
  );
}

export default App;
