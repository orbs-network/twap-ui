import { StyledModalContent, StyledSpookySwap, StyledSpookySwapBox, StyledSpookySwapLayout } from "./styles";
import { TWAP } from "@orbs-network/twap-ui-spookyswap";
import { useConnectWallet, useGetTokens, useNetwork, usePriceUSD, useTheme } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { SelectorOption, TokenListItem } from "./types";
import { erc20sData, zeroAddress, erc20s } from "@defi.org/web3-candies";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { mapKeys, Configs } from "@orbs-network/twap-ui";

const config = Configs.SpookySwap;

const parseListToken = (tokenList?: any[]) => {
  return tokenList?.map(({ symbol, address, decimals, logoURI, name, chainId }: any) => ({
    decimals,
    symbol,
    name,
    chainId,
    address,
    tokenInfo: { address, chainId, decimals, symbol, name, logoURI: (logoURI as string)?.replace("/logo_24.png", "/logo_48.png") },
    tags: [],
  }));
};

export const useDappTokens = () => {
  return useGetTokens({
    parse: parseListToken,
    modifyList: (tokens: any) => ({ ...mapKeys(tokens, (t: any) => t.address) }),
    url: "https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/ftm.json",
    baseAssets: erc20s.ftm,
  });
};

interface TokenSelectModalProps {
  isOpen: boolean;
  selectedCurrency?: any;
  onCurrencySelect: (token: any) => void;
  onDismiss: () => void;
}

const parseList = (rawList?: any): TokenListItem[] => {
  return rawList.map((rawToken: any) => {
    return {
      token: {
        address: rawToken.address ?? rawToken.tokenInfo?.address,
        decimals: rawToken.decimals ?? rawToken.tokenInfo?.decimals,
        symbol: rawToken.symbol ?? rawToken.tokenInfo?.symbol,
        logoUrl: rawToken.tokenInfo?.logoURI,
      },
      rawToken,
    };
  });
};

export const TokenSelectModal = ({ isOpen, onCurrencySelect, onDismiss }: TokenSelectModalProps) => {
  const tokensList = useDappTokens().data;
  const parsedList = parseList(tokensList);
  return (
    <Popup isOpen={isOpen} onClose={onDismiss}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={onCurrencySelect} />
      </StyledModalContent>
    </Popup>
  );
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();

  const { isDarkTheme } = useTheme();

  return (
    <TWAP
      provider={library?.givenProvider}
      connect={connect}
      account={account}
      // srcToken={zeroAddress}
      // dstToken={erc20sData.ftm.USDC.address}
      dappTokens={dappTokens}
      onSrcTokenSelected={(token: any) => console.log(token)}
      onDstTokenSelected={(token: any) => console.log(token)}
      TokenSelectModal={TokenSelectModal}
      isDarkTheme={isDarkTheme}
      limit={limit}
      usePriceUSD={usePriceUSD}
    />
  );
};

const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/9608.png";

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  return (
    <StyledSpookySwap>
      <StyledSpookySwapLayout name={config.name}>
        <UISelector limit={true} select={setSelected} selected={selected} />
        <StyledSpookySwapBox>
          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledSpookySwapBox>
      </StyledSpookySwapLayout>
    </StyledSpookySwap>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  configs: [config],
  path: config.name.toLowerCase(),
};

export default dapp;
