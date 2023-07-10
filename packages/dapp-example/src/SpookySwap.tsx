import { StyledModalContent, StyledSpookySwap, StyledSpookySwapBox, StyledSpookySwapLayout } from "./styles";
import { TWAP, Orders } from "@orbs-network/twap-ui-spookyswap";
import { useConnectWallet, useGetTokensFromViaProtocol, useTheme } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Configs } from "@orbs-network/twap";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { SelectorOption, TokenListItem } from "./types";
import _ from "lodash";
import { erc20sData, zeroAddress } from "@defi.org/web3-candies";
import { useState } from "react";

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

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();

  const getTokenImageUrl = (symbol: string) => dappTokens?.find((t) => t.symbol === symbol)?.logoUrl;

  const getProvider = () => library;
  const { isDarkTheme } = useTheme();

  return (
    <TWAP
      getProvider={getProvider}
      connect={connect}
      account={account}
      srcToken={zeroAddress}
      dstToken={erc20sData.ftm.USDC.address}
      getTokenImageUrl={getTokenImageUrl}
      dappTokens={dappTokens}
      onSrcTokenSelected={(token: any) => console.log(token)}
      onDstTokenSelected={(token: any) => console.log(token)}
      TokenSelectModal={TokenSelectModal}
      isDarkTheme={isDarkTheme}
      limit={limit}
    />
  );
};

const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/9608.png";

const DappComponent = () => {
  const { isDarkTheme } = useTheme();
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  return (
    <StyledSpookySwap isDarkMode={isDarkTheme ? 1 : 0}>
      <StyledSpookySwapLayout name={config.name}>
        <UISelector limit={true} select={setSelected} selected={selected} />
        <StyledSpookySwapBox isDarkMode={isDarkTheme ? 1 : 0}>
          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledSpookySwapBox>

        <StyledSpookySwapBox isDarkMode={isDarkTheme ? 1 : 0}>
          <Orders />
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
