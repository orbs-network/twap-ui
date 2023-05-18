import { globalStyle, StyledApp } from "./styles";
import { Route, Routes, Navigate } from "react-router-dom";
import { useEagerlyConnect } from "./hooks";
import { dapps, defaultDapp } from "./config";
import { GlobalStyles } from "@mui/material";

function App() {
  useEagerlyConnect();

  return (
    <StyledApp>
      <GlobalStyles styles={globalStyle} />
      <Routes>
        {dapps.map(({ config, Component }) => {
          return <Route path={config.partner.toLowerCase()} element={<Component />} key={config.partner} />;
        })}
        <Route path="*" element={<Navigate to={defaultDapp.config.partner.toLowerCase()} />} />
      </Routes>
    </StyledApp>
  );
}

export default App;
