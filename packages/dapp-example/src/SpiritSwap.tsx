import { StyledSpiritSwapBox, StyledModalContent, StyledSpiritSwapLayout, StyledSpiritSwap } from "./styles";
import { TWAP, Orders } from "@orbs-network/twap-ui-spiritswap";
import { useConnectWallet, useGetTokens, useTheme } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList } from "./Components";
import { Popup } from "./Components";
import { TokenListItem } from "./types";
import _ from "lodash";
import { erc20sData, zeroAddress, erc20s } from "@defi.org/web3-candies";
import { useCallback } from "react";

const config = Configs.SpiritSwap;

const parseListToken = (tokenList?: any[]) => {
  return tokenList?.map((token: any) => ({
    symbol: token.symbol,
    address: token.address,
    decimals: token.decimals,
    logoUrl: token.logoURI?.replace("/logo_24.png", "/logo_48.png"),
  }));
};

const useDappTokens = () => {
  return useGetTokens({
    chainId: config.chainId,
    url: "https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/ftm.json",
    baseAssets: erc20s.ftm,
    parse: parseListToken,
  });
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

const TWAPComponent = () => {
  const { account, library } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();

  const getTokenImageUrl = useCallback((symbol: string) => dappTokens?.find((t: any) => t.symbol === symbol)?.logoUrl, [_.size(dappTokens)]);
  return (
    <TWAP
      getProvider={() => library}
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
    />
  );
};

const DappComponent = () => {
  return (
    <StyledSpiritSwap>
      <StyledSpiritSwapLayout name={config.name}>
        <StyledSpiritSwapBox>
          <TWAPComponent />
        </StyledSpiritSwapBox>
        <StyledSpiritSwapBox>
          <Orders />
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
