import { getTheme, globalStyle, StyledApp } from "./styles";
import { Route, Routes, Navigate } from "react-router-dom";
import { useEagerlyConnect, useSelectedDapp, useTheme } from "./hooks";
import { dapps, defaultDapp } from "./config";
import { GlobalStyles, ThemeProvider } from "@mui/material";
import { useMemo } from "react";
import { SnackbarProvider } from "notistack";
import Pancake from "./PancakeSwap";

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
      <SnackbarProvider>
        <StyledApp>
          <GlobalStyles styles={styles} />
          <Routes>
            <Route path="/" element={<Pancake.Component />} key={Pancake.config.name} />;
            <Route path="*" element={<Navigate to={defaultDapp.config.name.toLowerCase()} />} />
          </Routes>
        </StyledApp>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
