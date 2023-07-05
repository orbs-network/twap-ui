import { StyledModalContent, StyledPancake, StyledPancakeBackdrop, StyledPancakeLayout, StyledPancakeTwap } from "./styles";
import { TWAP } from "@orbs-network/twap-ui-pancake";
import { useConnectWallet, useTheme } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { ReactNode, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { erc20s, zeroAddress, isNativeAddress } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
import { Box } from "@mui/system";
import { styled } from "@mui/material";

const config = Configs.PancakeSwap;

const nativeTokenLogo = "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png";
export const useDappTokens = () => {
  const { account } = useWeb3React();

  // const { isInValidNetwork } = useNetwork(config.chainId);
  const isInValidNetwork = false;
  return useQuery(
    ["useDappTokens", config.chainId],
    async () => {
      const response = await fetch(`https://api.thena.fi/api/v1/assets`);

      const tokenList = (await response.json()).data;
      const tokens = [config.nativeToken, ...tokenList];

      const parsed = tokens.map(({ symbol, address, decimals, logoURI, name }: any) => ({
        decimals,
        symbol,
        name,
        address,
        logoURI: isNativeAddress(address) ? nativeTokenLogo : logoURI,
      }));
      const candiesAddresses = [zeroAddress, ..._.map(erc20s.bsc, (t) => t().address)];

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
  popup: boolean;
  setPopup: (value: boolean) => void;
  selectedAsset: any;
  setSelectedAsset: (value: any) => void;
  otherAsset: any;
  setOtherAsset: (value: any) => void;
  baseAssets: any[];
  onAssetSelect: () => void;
}

const parseList = (rawList?: any): TokenListItem[] => {
  return _.map(rawList, (rawToken) => {
    return {
      token: {
        address: rawToken.address,
        decimals: rawToken.decimals,
        symbol: rawToken.symbol,
        logoUrl: rawToken.logoURI || nativeTokenLogo,
      },
      rawToken,
    };
  });
};

const TokenSelectModal = ({ popup, setPopup, setSelectedAsset, baseAssets }: TokenSelectModalProps) => {
  const tokensListSize = _.size(baseAssets);
  const parsedList = useMemo(() => parseList(baseAssets), [tokensListSize]);

  return (
    <Popup isOpen={popup} onClose={() => setPopup(true)}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={setSelectedAsset} />
      </StyledModalContent>
    </Popup>
  );
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { isDarkTheme } = useTheme();
  const connect = useConnectWallet();
  const { account, library } = useWeb3React();
  const { data: dappTokens } = useDappTokens();

  return (
    <StyledPancakeTwap isDarkTheme={isDarkTheme ? 1 : 0} style={{ maxWidth: 330 }}>
      <TWAP
        connect={connect}
        account={account}
        srcToken="BNB"
        dstToken="0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
        dappTokens={dappTokens}
        TokenSelectModal={TokenSelectModal}
        provider={library}
        isDarkTheme={isDarkTheme}
        limit={limit}
        ordersContainerId="orders"
      />
    </StyledPancakeTwap>
  );
};

const logo = "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_%281%29.png?1629359065";
const DappComponent = () => {
  const { isDarkTheme } = useTheme();

  const [selected, setSelected] = useState(SelectorOption.TWAP);

  return (
    <StyledPancake isDarkTheme={isDarkTheme ? 1 : 0}>
      <StyledPancakeLayout name={config.name}>
        <UISelector selected={selected} select={setSelected} limit={true} />
        <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        <StyledPancakeOrders>
          <StyledPancakeTwap id="orders" isDarkTheme={isDarkTheme ? 1 : 0} />
        </StyledPancakeOrders>
      </StyledPancakeLayout>
    </StyledPancake>
  );
};

const Wrapper = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const { isDarkTheme } = useTheme();

  return (
    <StyledWrapper className={className}>
      <StyledPancakeBackdrop isDarkTheme={isDarkTheme ? 1 : 0} />
      <div style={{ position: "relative", width: "100%" }}>{children}</div>
    </StyledWrapper>
  );
};

export const StyledPancakeOrders = styled(Wrapper)({
  maxWidth: 700,
});

const StyledWrapper = styled(Box)({
  position: "relative",
  width: "100%",
});

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
  workInProgress: true,
};

export default dapp;