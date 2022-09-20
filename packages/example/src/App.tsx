import "./App.css";
import { Box, styled } from "@mui/system";
import { useWeb3React } from "@web3-react/core";
import { injected } from "./connectors";
import { TWAP } from "@orbs-network/twap-ui";

function App() {
  const { library, activate, account, deactivate } = useWeb3React();

  const onConnectClick = () => activate(injected);

  return (
    <StyledApp className="App">
      {account ? (
        <div>
          <p>{account}</p>
          <button onClick={deactivate}>Disconnect</button>
        </div>
      ) : (
        <button onClick={onConnectClick}>Connect</button>
      )}
      <StyledTwap>
        <TWAP provider={library} />
      </StyledTwap>
    </StyledApp>
  );
}

export default App;

const StyledTwap = styled(Box)({
  width: 400,
});

const StyledApp = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  height: "100vh",
  gap: 49,
});
