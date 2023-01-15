import { StyledApp, StyledContent } from "./styles";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { Dapp, DappsMenu } from "./Components";
import { useEagerlyConnect, useDisconnectWallet } from "./hooks";
import { useCallback } from "react";
import { dapps, defaultDapp } from "./config";

function App() {
  const navigate = useNavigate();
  const disconnect = useDisconnectWallet();
  useEagerlyConnect();

  const onSelect = useCallback(
    (dapp: Dapp) => {
      navigate(dapp.config.partner.toLowerCase());
      disconnect();
    },
    [navigate]
  );

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
