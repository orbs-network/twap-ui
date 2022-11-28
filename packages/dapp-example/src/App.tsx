import { useWeb3React } from "@web3-react/core";
import { injectedConnector } from "./connectors";
import { useEffect, useState } from "react";
import { erc20s, networks, zeroAddress } from "@defi.org/web3-candies";
import _ from "lodash";
import { Orders as Orders_Spiritswap, Twap as TWAP_Spiritswap } from "@orbs-network/twap-ui-spiritswap";
import { Orders as Orders_Spookyswap, Twap as TWAP_Spookyswap } from "@orbs-network/twap-ui-spookyswap";
import { Orders as Orders_Pangolin, Twap as TWAP_Pangolin } from "@orbs-network/twap-ui-pangolin";

import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Modal from "@mui/material/Modal";
import { AiOutlineClose } from "react-icons/ai";
import { Configs } from "@orbs-network/twap";
import {
  StyledApp,
  StyledCloseIcon,
  StyledContent,
  StyledDappContainer,
  StyledDappSelector,
  StyledLayoutPangolin,
  StyledLayoutSpiritswap,
  StyledLayoutSpookyswap,
  StyledModalList,
  StyledModalListItem,
} from "./styles";

enum Dapps {
  Spiritswap = "Spiritswap",
  Spookyswap = "Spookyswap",
}

const dapps = [
  {
    Orders: Orders_Spiritswap,
    Twap: TWAP_Spiritswap,
    id: Configs.SpiritSwap.partner,
    Layout: StyledLayoutSpiritswap,
  },
  {
    Orders: Orders_Spookyswap,
    Twap: TWAP_Spookyswap,
    id: Configs.SpookySwap.partner,
    Layout: StyledLayoutSpookyswap,
  },
  {
    Orders: Orders_Pangolin,
    Twap: TWAP_Pangolin,
    id: Configs.Pangolin.partner,
    Layout: StyledLayoutPangolin,
  },
];

function App() {
  const [selectedDapp, setSelectedDapp] = useState(Configs.SpiritSwap.partner);
  const { activate, library, chainId, account } = useWeb3React();
  const tokensList = useTokenList(chainId);

  const props = {
    connectedChainId: chainId,
    getProvider: () => library,
    account,
    TokenSelectModal,
    connect: () => activate(injectedConnector),
    tokensList,
    onSrcTokenSelected: (value: any) => {},
    onDstTokenSelected: (value: any) => {},
    srcToken: undefined,
    dstToken: undefined,
    provider: library,
  };

  return (
    <StyledApp className="App">
      <DappSelector selectedDapp={selectedDapp} selectDapp={(dapp) => setSelectedDapp(dapp)} />
      <StyledContent>
        {dapps.map((dapp) => {
          const { Orders, Twap, Layout } = dapp;
          if (dapp.id === selectedDapp) {
            return (
              <StyledDappContainer key={dapp.id}>
                <Layout>
                  <Twap {...props} />
                </Layout>
                <Layout>
                  <Orders {...props} />
                </Layout>
              </StyledDappContainer>
            );
          }
        })}
      </StyledContent>
    </StyledApp>
  );
}

export default App;

const DappSelector = ({ selectedDapp, selectDapp }: { selectedDapp: string; selectDapp: (value: string) => void }) => {
  return (
    <StyledDappSelector>
      <Select
        MenuProps={{
          TransitionProps: { style: { background: "black" } },
        }}
        value={selectedDapp}
        label="Dapp"
        onChange={(event: SelectChangeEvent) => selectDapp(event.target.value)}
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
    </StyledDappSelector>
  );
};

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
