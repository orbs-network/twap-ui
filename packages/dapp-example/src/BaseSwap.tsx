import { StyledBaseSwap, StyledBaseSwapBox, StyledBaseSwapLayout, StyledModalContent } from "./styles";
import { TWAP, Orders } from "@orbs-network/twap-ui-baseswap";
import { useConnectWallet, useNetwork, useTheme } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Configs } from "@orbs-network/twap";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { SelectorOption, TokenListItem } from "./types";
import _ from "lodash";
import { erc20sData, zeroAddress, erc20s } from "@defi.org/web3-candies";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

const config = { ...Configs.SpookySwap };
config.name = "BaseSwap";
export const useDappTokens = () => {
  const { account } = useWeb3React();
  const { isInValidNetwork } = useNetwork(config.chainId);

  return useQuery(
    ["useGetTokens", config.chainId],
    async () => {
      const response = await fetch(`https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/ftm.json`);
      const tokenList = await response.json();
      const parsed = tokenList.map(({ symbol, address, decimals, logoURI, name, chainId }: any) => ({
        decimals,
        symbol,
        name,
        chainId,
        address,
        tokenInfo: { address, chainId, decimals, symbol, name, logoURI: (logoURI as string)?.replace("/logo_24.png", "/logo_48.png") },
        tags: [],
      }));
      const candiesAddresses = [zeroAddress, ..._.map(erc20s.poly, (t) => t().address)];

      const _tokens = _.sortBy(parsed, (t: any) => {
        const index = candiesAddresses.indexOf(t.address);
        return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
      });

      return { ..._.mapKeys(_tokens, (t) => t.address) } as any;
    },
    { enabled: !!account && !isInValidNetwork }
  );
};

interface TokenSelectModalProps {
  isOpen: boolean;
  selectedCurrency?: any;
  onCurrencySelect: (token: any) => void;
  onDismiss: () => void;
}

const parseList = (rawList?: any): TokenListItem[] => {
  return _.map(rawList, (rawToken) => {
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
      srcToken={zeroAddress}
      dstToken={erc20sData.ftm.USDC.address}
      dappTokens={dappTokens}
      onSrcTokenSelected={(token: any) => console.log(token)}
      onDstTokenSelected={(token: any) => console.log(token)}
      TokenSelectModal={TokenSelectModal}
      isDarkTheme={isDarkTheme}
      limit={limit}
    />
  );
};

const logo = "https://baseswap.fi/images/newlogo.png";

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  return (
    <StyledBaseSwap>
      <StyledBaseSwapLayout name={config.name}>
        <UISelector limit={true} select={setSelected} selected={selected} />
        <StyledBaseSwapBox>
          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledBaseSwapBox>

        <StyledBaseSwapBox>
          <Orders />
        </StyledBaseSwapBox>
      </StyledBaseSwapLayout>
    </StyledBaseSwap>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
  workInProgress: true,
};

export default dapp;
