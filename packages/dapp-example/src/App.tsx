import { StyledApp, StyledContent } from "./styles";
import { Route, Routes, useNavigate } from "react-router-dom";
import pangolin from "./Pangolin";
import spiritswap from "./SpiritSwap";
import spookyswap from "./SpookySwap";
import { Dapp, DappsMenu } from "./Components";
import { Navigate } from "react-router-dom";
import { hooks } from "@orbs-network/twap-ui";
import { useSelectedDapp } from "./hooks";
import { useCallback } from "react";

const defaultDapp = spiritswap;
const dapps = [spiritswap, pangolin, spookyswap];

function App() {
  const reset = hooks.resetState();
  const navigate = useNavigate();
  const isSelected = useSelectedDapp();

  const onSelect = useCallback(
    (dapp: Dapp) => {
      reset();
      navigate(dapp.path);
    },
    [navigate]
  );

  return (
    <StyledApp className="App">
      <DappsMenu onSelect={onSelect} dapps={dapps} isSelected={isSelected} />
      <StyledContent>
        <Routes>
          {dapps.map(({ path, Component }) => {
            return <Route path={path} element={<Component />} key={path} />;
          })}
          <Route path="*" element={<Navigate to={defaultDapp.path} />} />
        </Routes>
      </StyledContent>
    </StyledApp>
  );
}

export default App;
