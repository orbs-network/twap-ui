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
import { Components } from "@orbs-network/twap-ui";

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

      const parsed = tokenList.map(({ symbol, address, decimals, logoURI, name }: any) => ({
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
  open: boolean;
  onDismiss: () => null;
  onCurrencySelect: (value: any) => void;
  selectedCurrency?: any;
  otherSelectedCurrency?: any;
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

const TokenSelectModal = ({ open, onDismiss, onCurrencySelect, selectedCurrency, otherSelectedCurrency }: TokenSelectModalProps) => {
  const { data: dappTokens } = useDappTokens();

  const tokensListSize = _.size(dappTokens);
  const parsedList = useMemo(() => parseList(dappTokens), [tokensListSize]);

  console.log(selectedCurrency, otherSelectedCurrency);

  return (
    <Popup isOpen={open} onClose={onDismiss}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={onCurrencySelect} />
      </StyledModalContent>
    </Popup>
  );
};

const ConnectButton = () => {
  return <Components.SubmitButton isMain={true} />;
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { isDarkTheme } = useTheme();
  const connect = useConnectWallet();
  const { account, library } = useWeb3React();
  const { data: dappTokens } = useDappTokens();

  console.log({ dappTokens });

  const getProvider = async () => {
    return library;
  };

  return (
    <StyledPancakeTwap isDarkTheme={isDarkTheme ? 1 : 0} style={{ maxWidth: 330 }}>
      <TWAP
        connect={connect}
        account={account}
        srcToken="BNB"
        dstToken="0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
        dappTokens={dappTokens}
        TokenSelectModal={TokenSelectModal}
        isDarkTheme={isDarkTheme}
        limit={limit}
        ordersContainerId="orders"
        getProvider={getProvider}
        ConnectButton={ConnectButton}
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
