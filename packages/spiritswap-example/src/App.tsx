import "./App.css";
import { Box, styled } from "@mui/system";
import { useWeb3React } from "@web3-react/core";
import { injectedConnector } from "./connectors";
import TWAP_Spiritswap from "@orbs-network/twap-ui-spiritswap";

function ConnectBtn() {
  const { activate, deactivate, account } = useWeb3React();

  const disconnect = <button onClick={deactivate}>Disconnect {account}</button>;
  const connect = <button onClick={() => activate(injectedConnector)}>Connect</button>;

  return <div>{account ? disconnect : connect}</div>;
}

function App() {
  return (
    <StyledApp className="App">
      <ConnectBtn />

      <TWAP_Spiritswap provider={useWeb3React().library} />
    </StyledApp>
  );
}

export default App;

const StyledApp = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  height: "100vh",
  gap: 48,
});
