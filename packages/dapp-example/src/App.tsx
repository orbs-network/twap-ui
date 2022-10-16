import "./App.css";
import { Box, styled } from "@mui/system";
import { useWeb3React } from "@web3-react/core";
import { injectedConnector } from "./connectors";
import { CSSProperties, useState } from "react";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import axios from "axios";
import { useQuery } from "react-query";
import { networks, erc20s, zeroAddress } from "@defi.org/web3-candies";
import _ from "lodash";
import TWAP_Spiritswap from "@orbs-network/twap-ui-spiritswap";
// import TWAP_Quickswap from "@orbs-network/twap-ui-quickswap";

function App() {
  const { account, activate, library, chainId } = useWeb3React();
  const [selectedDapp, setSelectedDapp] = useState("1");

  const [isSelectModalOpen, setSelectModalOpen] = useState(false);

  return (
    <StyledApp className="App">
      <Box sx={{ minWidth: 120 }}>
        <Select value={selectedDapp} label="Age" onChange={(event: SelectChangeEvent) => setSelectedDapp(event.target.value)} style={{ color: "white" }}>
          {dapps.map((client) => {
            return (
              <MenuItem key={client.id} value={client.id}>
                {client.text}
              </MenuItem>
            );
          })}
        </Select>
      </Box>
      <StyledContent>
        {dapps.map((dapp) => {
          if (dapp.id === selectedDapp) {
            const Component = dapp.Component;
            const Layout = dapp.Layout;
            return (
              <Layout key={dapp.id}>
                <Component
                  provider={library}
                  connect={() => activate(injectedConnector)}
                  account={account}
                  // selectedSrcToken={}
                  // selectedDstToken={}
                  // onClickSelectSrcToken={() => setOpen(true)}
                  // onClickSelectDstToken={() => setOpen(true)}
                  // setOpen={setOpen}
                />
              </Layout>
            );
          }
          return null;
        })}
      </StyledContent>

      {/*<button onClick={() => setSelectModalOpen(true)}>Select Token</button>*/}
      {/*<TokenSelectModal chainId={chainId} isOpen={isSelectModalOpen} />*/}
    </StyledApp>
  );
}

export default App;

// tokens={tokens}
// commonTokens={commonTokens()}
// tokenSelected={token}
// bridge={bridge}
// onSelect={handleSelect}
// isOpen={isOpen}
// onClose={onClose}
// chainID={chainID}
// notSearchToken={notSearchToken}

interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
  logoUrl?: string;
}

const useTokenList = (chainId: number) => {
  const tokenlistsNetworkNames = {
    [networks.eth.id]: "ethereum",
    [networks.ftm.id]: "ftm",
  };
  return useQuery(
    ["useList", chainId],
    async () => {
      const tokenlist = (await axios.get(`https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/${tokenlistsNetworkNames[chainId]}.json`)).data;
      const parsed = tokenlist.map(({ symbol, address, decimals, logoURI }: any) => ({ symbol, address, decimals, logoUrl: logoURI }));

      const networkShortName = _.find(networks, (n) => n.id === chainId)!.shortname;
      const topTokens = [
        zeroAddress,
        ..._.chain(erc20s)
          .find((it: any, k) => k === networkShortName)
          .map((t: any) => t().address)
          .value(),
      ];

      return _.sortBy(parsed, (t: any) => {
        const index = topTokens.indexOf(t.address);
        return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
      });
    },
    { enabled: !!chainId }
  );
};

const TokenListItem = ({ token }: any) => {
  return (
    <li>
      <img src={token.logoUrl || ""} width={20} height={20} alt="" />
      {token.symbol}
    </li>
  );
};

const TokenSelectModal = ({ chainId, isOpen, onClose, selectedToken, onSelect }: any) => {
  const { data: list = [] } = useTokenList(chainId);
  return (
    isOpen && (
      <div>
        <ul>
          {list.map((m: TokenInfo) => {
            return <TokenListItem key={m.address} token={m} />;
          })}
        </ul>
      </div>
    )
  );
};

const StyledApp = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  height: "100vh",
  gap: 48,
  paddingBottom: 50,
  paddingTop: 40,
  "& *::-webkit-scrollbar": {
    display: "none",
    width: 0,
  },
});

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

const StyledContent = styled(Box)(({ styles }: { styles?: CSSProperties }) => ({
  flex: 1,
  width: 500,
  overflow: "auto",
  ...styles,
}));

const dapps = [
  { id: "1", text: "Spiritswap", Component: TWAP_Spiritswap, Layout: StyledLayoutSpiritswap },
  // { id: "1", text: "Quickswap", Component: TWAP_Quickswap, Layout: StyledLayoutQuickswap },
];
