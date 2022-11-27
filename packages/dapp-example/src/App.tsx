import { Box, styled } from "@mui/system";
import { useWeb3React } from "@web3-react/core";
import { injectedConnector } from "./connectors";
import { CSSProperties, useEffect, useState } from "react";
import { erc20s, networks, zeroAddress } from "@defi.org/web3-candies";
import _ from "lodash";
import { Orders as Orders_Spiritswap, TWAP_Spiritswap } from "@orbs-network/twap-ui-spiritswap";
import { Orders as Orders_Spookyswap, TWAP_Spookyswap } from "@orbs-network/twap-ui-spookyswap";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

// import TWAP_Quickswap from "@orbs-network/twap-ui-quickswap";
import Modal from "@mui/material/Modal";
import { AiOutlineClose } from "react-icons/ai";
const StyledLayoutSpiritswap = styled(Box)({
  background: "rgb(16, 23, 38)",
  border: `1px solid rgb(55, 65, 81)`,
  borderRadius: 10,
  padding: "0.5rem",
  fontFamily: "Jost",
});

const StyledSelect = styled(Select)({});

const StyledLayoutSpookyswap = styled(Box)({
  background: "linear-gradient(rgb(49, 65, 94) 0%, rgba(49, 65, 94, 0) 100%), rgba(18, 17, 34, 0.6)",
  borderRadius: 10,
  padding: "0.5rem",
});

enum Dapps {
  Spiritswap = "Spiritswap",
  Spookyswap = "Spookyswap",
}

const dapps = [
  {
    Orders: Orders_Spiritswap,
    Twap: TWAP_Spiritswap,
    id: Dapps.Spiritswap,
    Layout: StyledLayoutSpiritswap,
  },
  {
    Orders: Orders_Spookyswap,
    Twap: TWAP_Spookyswap,
    id: Dapps.Spookyswap,
    Layout: StyledLayoutSpookyswap,
  },
];

function App() {
  const { activate, library, chainId, account } = useWeb3React();
  const [selectedDapp, setSelectedDapp] = useState(Dapps.Spiritswap);
  const tokensList = useTokenList(chainId);

  const args = {
    connectedChainId: chainId,
    getProvider: () => {
      return library;
    },
    account,
    TokenSelectModal,
    connect: () => activate(injectedConnector),
    tokensList,
    onSrcTokenSelected: (value: any) => {},
    onDstTokenSelected: (value: any) => {},
    initialSrcToken: undefined,
    initialDstToken: undefined,
  };

  return (
    <StyledApp className="App">
      <Box sx={{ minWidth: 120 }}>
        <Select
          MenuProps={{
            TransitionProps: { style: { background: "black" } },
          }}
          value={selectedDapp}
          label="Dapp"
          onChange={(event: SelectChangeEvent) => setSelectedDapp(event.target.value as Dapps)}
          style={{ color: "white" }}
        >
          {dapps.map((dapp) => {
            return (
              <MenuItem key={dapp.id} value={dapp.id}>
                {dapp.id}
              </MenuItem>
            );
          })}
        </Select>
      </Box>
      <StyledContent>
        {dapps.map((dapp) => {
          const { Orders, Twap, Layout } = dapp;
          if (dapp.id === selectedDapp) {
            return (
              <StyledContainer key={dapp.id}>
                <Layout>
                  <Twap {...args} />
                </Layout>
                <Layout>
                  <Orders {...args} />
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
  const [tokens, setTokens] = useState<any[]>([]);

  useEffect(() => {
    if (!chainId) return;
    (async () => {
      const response = await fetch(`https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/${tokenlistsNetworkNames[chainId!]}.json`);
      const tokenList = await response.json();
      const parsed = tokenList.map(({ symbol, address, decimals, logoURI }: any) => ({ symbol, address, decimals, logoUrl: logoURI }));

      const networkShortName = _.find(networks, (n) => n.id === chainId)!.shortname;
      const topTokens = [
        zeroAddress,
        ..._.chain(erc20s)
          .find((it: any, k) => k === networkShortName)
          .map((t: any) => t().address)
          .value(),
      ];

      const _tokens = _.sortBy(parsed, (t: any) => {
        const index = topTokens.indexOf(t.address);
        return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
      });
      setTokens(_tokens);
    })();
  }, [chainId]);

  return tokens;
};

interface Props {
  chainId: number;
  isOpen: boolean;
  selectedToken?: TokenInfo;
  onSelect: (token: TokenInfo) => void;
  onClose: () => void;
}

const TokenSelectModal = ({ chainId, isOpen, selectedToken, onSelect, onClose }: Props) => {
  const list = useTokenList(chainId);

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
  maxWidth: 500,
  width: "calc(100vw - 20px)",
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
  background: "black",
  minHeight: "100vh",
  "& *::-webkit-scrollbar": {
    display: "none",
    width: 0,
  },
});

const StyledContent = styled(Box)(({ styles }: { styles?: CSSProperties }) => ({
  flex: 1,
  maxWidth: 500,
  width: "calc(100% - 30px)",
  overflow: "auto",
  ...styles,
}));
