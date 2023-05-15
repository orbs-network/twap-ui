import { StyledApp } from "./styles";
import { Route, Routes, Navigate } from "react-router-dom";
import { useEagerlyConnect } from "./hooks";
import { dapps, defaultDapp } from "./config";

function App() {
  useEagerlyConnect();

  return (
    <StyledApp>
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
