import { StyledModalContent, StyledSpookySwap, StyledSpookySwapBox, StyledSpookySwapLayout } from "./styles";
import { Orders, TWAP, SpookySwapTWAPProps, SpookySwapOrdersProps, Limit } from "@orbs-network/twap-ui-spookyswap";
import { useConnectWallet, useGetTokensFromViaProtocol, useTheme } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Configs } from "@orbs-network/twap";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { TokenListItem } from "./types";
import _ from "lodash";
import { erc20sData, zeroAddress } from "@defi.org/web3-candies";

const config = Configs.SpookySwap;

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

export const TokenSelectModal = ({ isOpen, onSelect, onClose }: TokenSelectModalProps) => {
  const tokensList = useDappTokens().data;
  const parsedList = parseList(tokensList);
  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={onSelect} />
      </StyledModalContent>
    </Popup>
  );
};

const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/9608.png";

const DappComponent = () => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();

  const getTokenImageUrl = (symbol: string) => dappTokens?.find((t) => t.symbol === symbol)?.logoUrl;

  const getProvider = () => library;
  const { isDarkTheme } = useTheme();

  const twapProps: SpookySwapTWAPProps = {
    getProvider,
    connect,
    account,
    srcToken: zeroAddress,
    dstToken: erc20sData.ftm.USDC.address,
    getTokenImageUrl,
    dappTokens,
    onSrcTokenSelected: (token: any) => console.log(token),
    onDstTokenSelected: (token: any) => console.log(token),
    TokenSelectModal,
    isDarkTheme,
  };
  const ordersProps: SpookySwapOrdersProps = { account, getTokenImageUrl, dappTokens, getProvider, isDarkTheme };

  return (
    <StyledSpookySwap isDarkMode={isDarkTheme ? 1 : 0}>
      <StyledSpookySwapLayout name={config.name}>
        <UISelector
          options={[
            {
              title: "TWAP",
              component: (
                <StyledSpookySwapBox isDarkMode={isDarkTheme ? 1 : 0}>
                  <TWAP {...twapProps} />
                </StyledSpookySwapBox>
              ),
            },
            {
              title: "LIMIT",
              component: (
                <StyledSpookySwapBox isDarkMode={isDarkTheme ? 1 : 0}>
                  <Limit {...twapProps} />
                </StyledSpookySwapBox>
              ),
            },
          ]}
        />

        <StyledSpookySwapBox isDarkMode={isDarkTheme ? 1 : 0}>
          <Orders {...ordersProps} />
        </StyledSpookySwapBox>
      </StyledSpookySwapLayout>
    </StyledSpookySwap>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
};

export default dapp;
