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
          return <Route path={config.name.toLowerCase()} element={<Component />} key={config.name} />;
        })}
        <Route path="*" element={<Navigate to={defaultDapp.config.name.toLowerCase()} />} />
      </Routes>
    </StyledApp>
  );
}

export default App;
