import { Box, styled } from "@mui/system";
import { useWeb3React } from "@web3-react/core";
import { injectedConnector } from "./connectors";
import { CSSProperties, useEffect, useRef, useState } from "react";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import axios from "axios";
import { useQuery } from "react-query";
import { networks, erc20s, zeroAddress } from "@defi.org/web3-candies";
import _ from "lodash";
import { TWAP_Spiritswap, Orders } from "@orbs-network/twap-ui-spiritswap";
// import TWAP_Quickswap from "@orbs-network/twap-ui-quickswap";
import Modal from "@mui/material/Modal";
import { AiOutlineClose } from "react-icons/ai";

function App() {
  const { activate, library, chainId } = useWeb3React();
  const [selectedDapp, setSelectedDapp] = useState("1");
  const { data: list = [] } = useTokenList(chainId);

  return (
    <StyledApp className="App">
      {/* <Box sx={{ minWidth: 120 }}>
        <Select value={selectedDapp} label="Age" onChange={(event: SelectChangeEvent) => setSelectedDapp(event.target.value)} style={{ color: "white" }}>
          {dapps.map((client) => {
            return (
              <MenuItem key={client.id} value={client.id}>
                {client.text}
              </MenuItem>
            );
          })}
        </Select>
      </Box> */}
      <StyledContent>
        {dapps.map((dapp) => {
          if (dapp.id === selectedDapp) {
            const Component = dapp.Component;
            const Layout = dapp.Layout;
            return (
              <StyledContainer key={dapp.id}>
                <Layout>
                  <Component TokenSelectModal={TokenSelectModal} provider={library} connect={() => activate(injectedConnector)} tokensList={list} />
                </Layout>
                <Layout>
                  <Orders TokenSelectModal={TokenSelectModal} provider={library} connect={() => activate(injectedConnector)} tokensList={list} />
                </Layout>
              </StyledContainer>
            );
          }
          return null;
        })}
      </StyledContent>
    </StyledApp>
  );
}

export default App;

const StyledContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",

  gap: 30,
});

interface TokenInfo {
  symbol: string;
  address: string;
  decimals: number;
  logoUrl?: string;
}
const tokenlistsNetworkNames = {
  [networks.eth.id]: "ethereum",
  [networks.ftm.id]: "ftm",
};
const useTokenList = (chainId?: number) => {
  return useQuery(
    ["useList", chainId],
    async () => {
      const tokenlist = (await axios.get(`https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/${tokenlistsNetworkNames[chainId!]}.json`)).data;

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

interface Props {
  chainId: number;
  isOpen: boolean;
  selectedToken?: TokenInfo;
  onSelect: (token: TokenInfo) => void;
  onClose: () => void;
}

const TokenSelectModal = ({ chainId, isOpen, selectedToken, onSelect, onClose }: Props) => {
  const { data: list = [] } = useTokenList(chainId);
  return (
    <Modal open={isOpen} onClose={onClose} onBackdropClick={onClose}>
      <>
        <StyledCloseIcon onClick={onClose}>
          <AiOutlineClose className="icon" />
        </StyledCloseIcon>
        <StyledModalList>
          {list.map((token: TokenInfo) => {
            if (token.address === selectedToken?.address) {
              return null;
            }
            return (
              <StyledModalListItem onClick={() => onSelect(token)} key={token.address}>
                <img src={token.logoUrl || ""} width={20} height={20} alt="" />
                {token.symbol}
              </StyledModalListItem>
            );
          })}
        </StyledModalList>
      </>
    </Modal>
  );
};

const StyledCloseIcon = styled("button")({
  position: "absolute",
  background: "transparent",
  top: 30,
  right: 30,
  border: "unset",
  cursor: "pointer",
  "& .icon": {
    width: 20,
    height: 20,
    "* ": {
      fill: "white",
    },
  },
});

const StyledModalList = styled("ul")({
  listStyleType: "none",
  width: "500px",
  height: 500,
  overflow: "auto",
  background: "#18202F",
  border: "1px solid rgb(55, 65, 81)",
  display: "flex",
  flexDirection: "column",
  padding: 0,
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
});
const StyledModalListItem = styled("li")({
  cursor: "pointer",
  display: "flex",
  gap: 10,
  alignItems: "center",
  padding: "10px 30px",
  transition: "0.2s all",
  "&:hover": {
    background: "rgba(255,255,255, 0.07)",
  },
});

const StyledApp = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
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
