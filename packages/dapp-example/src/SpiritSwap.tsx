import { StyledSpiritSwapBox, StyledModalContent, StyledSpiritSwapLayout, StyledSpiritSwap } from "./styles";
import { Orders, TWAP, SpiritSwapTWAPProps, SpiritSwapOrdersProps } from "@orbs-network/twap-ui-spiritswap";
import { useConnectWallet, useGetTokensFromViaProtocol, useTheme } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList } from "./Components";
import { Popup } from "./Components";
import { TokenListItem } from "./types";
import _ from "lodash";

const config = Configs.SpiritSwap;

const useDappTokens = () => {
  return useGetTokensFromViaProtocol(config.chainId);
};

interface TokenSelectModalProps {
  isOpen: boolean;
  selectedToken?: any;
  onSelect: (token: any) => void;
  onClose: () => void;
}

const parseList = (rawList?: any): TokenListItem[] => {
  return _.map(rawList, (rawToken) => {
    return {
      token: {
        address: rawToken.address,
        decimals: rawToken.decimals,
        symbol: rawToken.symbol,
        logoUrl: rawToken.logoUrl,
      },
      rawToken,
    };
  });
};

const TokenSelectModal = ({ isOpen, onSelect, onClose }: TokenSelectModalProps) => {
  const { data: tokensList } = useDappTokens();
  const parsedList = parseList(tokensList);

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={onSelect} />
      </StyledModalContent>
    </Popup>
  );
};
const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/10239.png";
const DappComponent = () => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();

  const getTokenImageUrl = (symbol: string) => dappTokens?.find((t) => t.symbol === symbol)?.logoUrl;

  const twapProps: SpiritSwapTWAPProps = {
    getProvider: () => library,
    connect,
    account,
    srcToken: "FTM",
    dstToken: "ORBS",
    getTokenImageUrl,
    dappTokens,
    onSrcTokenSelected: (token: any) => console.log(token),
    onDstTokenSelected: (token: any) => console.log(token),
    TokenSelectModal,
    isDarkTheme,
  };
  const ordersProps: SpiritSwapOrdersProps = { account, getTokenImageUrl, dappTokens, getProvider: () => library, isDarkTheme };

  return (
    <StyledSpiritSwap isDarkMode={isDarkTheme ? 1 : 0}>
      <StyledSpiritSwapLayout name={config.partner}>
        <StyledSpiritSwapBox isDarkMode={isDarkTheme ? 1 : 0}>
          <TWAP {...twapProps} />
        </StyledSpiritSwapBox>
        <StyledSpiritSwapBox isDarkMode={isDarkTheme ? 1 : 0}>
          <Orders {...ordersProps} />
        </StyledSpiritSwapBox>
      </StyledSpiritSwapLayout>
    </StyledSpiritSwap>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
};

export default dapp;
