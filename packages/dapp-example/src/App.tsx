import { StyledApp, StyledContent } from "./styles";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { Dapp, DappsMenu } from "./Components";
import { useEagerlyConnect, useDisconnectWallet } from "./hooks";
import { dapps, defaultDapp } from "./config";
import { hooks } from "@orbs-network/twap-ui";

function App() {
  const navigate = useNavigate();
  const disconnect = useDisconnectWallet();
  const reset = hooks.useReset();
  useEagerlyConnect();

  const onSelect = (dapp: Dapp) => {
    reset();
    disconnect();
    navigate(dapp.config.partner.toLowerCase());
  };

  return (
    <StyledApp className="App">
      <DappsMenu onSelect={onSelect} />
      <StyledContent>
        <Routes>
          {dapps.map(({ config, Component }) => {
            return <Route path={config.partner.toLowerCase()} element={<Component />} key={config.partner} />;
          })}
          <Route path="*" element={<Navigate to={defaultDapp.config.partner.toLowerCase()} />} />
        </Routes>
      </StyledContent>
    </StyledApp>
  );
}

export default App;
