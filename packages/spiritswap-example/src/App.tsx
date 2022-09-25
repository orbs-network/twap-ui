import "./App.css";
import { Box, styled } from "@mui/system";
import { useWeb3React } from "@web3-react/core";
import { injectedConnector } from "./connectors";
import TWAP_Spiritswap from "@orbs-network/twap-ui-spiritswap";

function App() {
  const { activate, deactivate, account, library } = useWeb3React();

  return (
    <StyledApp className="App">
      {ConnectBtn(activate, deactivate, account || "")}

      <TWAP_Spiritswap provider={library} />
    </StyledApp>
  );
}

export default App;

function ConnectBtn(activate: (connector: any) => void, deactivate: () => void, account: string) {
  const disconnect = <button onClick={deactivate}>Disconnect {account}</button>;
  const connect = <button onClick={() => activate(injectedConnector)}>Connect</button>;
  return <div>{account ? disconnect : connect}</div>;
}

const StyledApp = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  height: "100vh",
  gap: 48,
});
