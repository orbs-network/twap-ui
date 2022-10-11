import "./App.css";
import { Box, styled } from "@mui/system";
import { useWeb3React } from "@web3-react/core";
import { injectedConnector } from "./connectors";
// import TWAP_Spiritswap from "@orbs-network/twap-ui-spiritswap";
import TWAP_Spiritswap from "@orbs-network/twap-ui-spiritswap";
import TWAP_Quickswap from "@orbs-network/twap-ui-quickswap";
import { CSSProperties, useMemo, useState } from "react";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const StyledLayoutQuickswap = styled(Box)({
  background: "#1b1e29",
  borderRadius: 20,
  padding: 20,
});

const StyledLayoutSpiritswap = styled(Box)({
  background: "rgb(16, 23, 38)",
  border: `1px solid rgb(55, 65, 81)`,
  borderRadius: 10,
  padding: "0.5rem",
  fontFamily: "Jost",
});

function ConnectBtn() {
  const { activate, deactivate, account } = useWeb3React();

  const disconnect = <button onClick={deactivate}>Disconnect {account}</button>;
  const connect = <button onClick={() => activate(injectedConnector)}>Connect</button>;

  return <div>{account ? disconnect : connect}</div>;
}

const clients = [
  { id: "1", Component: TWAP_Quickswap, text: "Quickswap", Layout: StyledLayoutQuickswap },
  { id: "2", Component: TWAP_Spiritswap, text: "Spiritswap", Layout: StyledLayoutSpiritswap },
];

function App() {
  const { account, activate } = useWeb3React();
  const [selectedClient, setSelectedClient] = useState("2");

  const onConnectClick = () => {
    console.log("on connect click");
    activate(injectedConnector);
  };

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedClient(event.target.value as string);
  };

  return (
    <StyledApp className="App">
      <ConnectBtn />
      <Box sx={{ minWidth: 120 }}>
        <Select value={selectedClient} label="Age" onChange={handleChange} style={{ color: "white" }}>
          {clients.map((client) => {
            return (
              <MenuItem key={client.id} value={client.id}>
                {client.text}
              </MenuItem>
            );
          })}
        </Select>
      </Box>
      <StyledContent>
        {clients.map((client) => {
          if (client.id === selectedClient) {
            const Component = client.Component;
            const Layout = client.Layout;
            return (
              <Layout key={client.id}>
                <Component provider={useWeb3React().library} connect={onConnectClick} account={account} />
              </Layout>
            );
          }
          return null;
        })}
      </StyledContent>
    </StyledApp>
  );
}

export default App;

const StyledApp = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  height: "100vh",
  gap: 48,
  paddingBottom: 50,
  "& *::-webkit-scrollbar": {
    display: "none",
    width: 0,
  },
});

const StyledContent = styled(Box)(({ styles }: { styles?: CSSProperties }) => ({
  flex: 1,
  width: 500,
  overflow: "auto",
  ...styles,
}));
