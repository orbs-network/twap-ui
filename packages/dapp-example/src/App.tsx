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
            Typography: {
              colorText: "#fff",
            },
          },
        }}
      >
        <div className="app">
          <GlobalStyles config={config} />
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
