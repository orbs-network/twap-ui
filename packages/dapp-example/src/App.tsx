import { ThemeProvider } from "styled-components";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { Dapp } from "./Dapp";
import { useDappContext } from "./context";
import { GlobalStyles, darkTheme } from "./styles";
import { ConfigSelector } from "./Components";


function App() {
  const { config } = useDappContext();

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="app">
      <GlobalStyles config={config} />
      {/* <ToggleTheme /> */}
      <div className="navbar">
        <ConfigSelector />
      <ConnectButton />
      </div>
      <Dapp />
      </div>
    </ThemeProvider>
  );
}

export default App;
