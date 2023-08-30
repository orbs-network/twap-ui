import { getTheme, globalStyle, StyledApp } from "./styles";
import { Route, Routes, Navigate } from "react-router-dom";
import { useEagerlyConnect, useSelectedDapp, useTheme } from "./hooks";
import { dapps, defaultDapp } from "./config";
import { GlobalStyles, ThemeProvider } from "@mui/material";
import { useMemo } from "react";

const useGlobalStyles = () => {
  const dapp = useSelectedDapp();
  return globalStyle(dapp.selectedDapp?.config.name);
};

function App() {
  useEagerlyConnect();
  const styles = useGlobalStyles();
  const { isDarkTheme } = useTheme();

  const theme = useMemo(() => getTheme(isDarkTheme), [isDarkTheme]);

  return (
    <ThemeProvider theme={theme}>
      <StyledApp>
        <GlobalStyles styles={styles} />
        <Routes>
          {dapps.map(({ config, Component }) => {
            return <Route path={config.name.toLowerCase()} element={<Component />} key={config.name} />;
          })}
          <Route path="*" element={<Navigate to={defaultDapp.config.name.toLowerCase()} />} />
        </Routes>
      </StyledApp>
    </ThemeProvider>
  );
}

export default App;
