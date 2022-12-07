import { StyledApp, StyledContent } from "./styles";
import { Route, Routes, useNavigate } from "react-router-dom";
import pangolin from "./Pangolin";
import spiritswap from "./SpiritSwap";
import spookyswap from "./SpookySwap";
import { Dapp, DappsMenu } from "./Components";
import { Navigate } from "react-router-dom";
import { store } from "@orbs-network/twap-ui";
import { useEagerlyConnect, useSelectedDapp, useDisconnectWallet } from "./hooks";
import { useCallback } from "react";

const defaultDapp = spiritswap;
export const dapps = [spiritswap, pangolin, spookyswap];

function App() {
  const resetState = store.useTwapStore((state) => state.reset);
  const navigate = useNavigate();
  const { isSelected } = useSelectedDapp();
  const disconnect = useDisconnectWallet();
  useEagerlyConnect();

  const onSelect = useCallback(
    (dapp: Dapp) => {
      resetState();
      disconnect();
      navigate(dapp.config.partner.toLowerCase());
    },
    [navigate]
  );

  return (
    <StyledApp className="App">
      <DappsMenu onSelect={onSelect} isSelected={isSelected} />
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
