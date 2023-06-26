import { globalStyle, StyledApp } from "./styles";
import { Route, Routes, Navigate } from "react-router-dom";
import { useEagerlyConnect, useSelectedDapp } from "./hooks";
import { dapps, defaultDapp } from "./config";
import { GlobalStyles } from "@mui/material";

const useGlobalStyles = () => {
  const dapp = useSelectedDapp();
  return globalStyle(dapp.selectedDapp?.config.name);
};

function App() {
  useEagerlyConnect();
  const styles = useGlobalStyles();

  return (
    <StyledApp>
      <GlobalStyles styles={styles} />
      <Routes>
        {dapps.map(({ config, Component }) => {
          return <Route path={config.name.toLowerCase()} element={<Component />} key={config.name} />;
        })}
        <Route path="*" element={<Navigate to={defaultDapp.config.name.toLowerCase()} />} />
      </Routes>
    </StyledApp>
  );
}

export default App;
