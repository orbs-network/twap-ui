import { StyledModalContent, StyledPancake, StyledPancakeBackdrop, StyledPancakeLayout, StyledPancakeOrders, StyledPancakeTwap } from "./styles";
import { TWAP, Orders, parseToken } from "@orbs-network/twap-ui-pancake";
import { useConnectWallet, useGetTokens, usePriceUSD, useTheme, useTrade } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { erc20s, isNativeAddress, zeroAddress } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
import { Box } from "@mui/system";
import { styled } from "@mui/material";
import { Components, hooks } from "@orbs-network/twap-ui";

const config = Configs.PancakeSwap;

let native = {
  ...config.nativeToken,
  logoURI: config.nativeToken.logoUrl,
};

const parseListToken = (tokenList: any) => {
  const result = tokenList.tokens.map(({ symbol, address, decimals, logoURI, name }: any) => ({
    decimals,
    symbol,
    name,
    address,
    logoURI: logoURI.replace("_1", ""),
  }));

  return [native, ...result];
};
export const useDappTokens = () => {
  return useGetTokens({
    chainId: config.chainId,
    parse: parseListToken,
    modifyList: (tokens: any) => ({ ..._.mapKeys(tokens, (t) => t.address) }),
    baseAssets: erc20s.bsc,
    url: `https://tokens.pancakeswap.finance/pancakeswap-extended.json`,
  });
};

interface TokenSelectModalProps {
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
        logoUrl: rawToken.logoURI,
      },
      rawToken,
    };
  });
};

const ConnectButton = () => {
  const connect = useConnectWallet();
  return (
    <div onClick={connect}>
      <Components.SubmitButton isMain={true} />
    </div>
  );
};

interface ContextProps {
  openModal: (value: boolean) => void;
  close: () => void;
  showModal?: boolean;
  isFrom?: boolean;
  setIsFrom?: (value: boolean) => void;
}
const Context = createContext({} as ContextProps);

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  const [showModal, setShowModal] = useState(false);
  const [isFrom, setIsFrom] = useState(true);

  const openModal = (value: boolean) => {
    setIsFrom(value);
    setShowModal(true);
  };

  return <Context.Provider value={{ isFrom, setIsFrom, showModal, openModal, close: () => setShowModal(false) }}>{children}</Context.Provider>;
};

const TokenSelectModal = ({ onCurrencySelect }: TokenSelectModalProps) => {
  const { data: dappTokens } = useDappTokens();

  const tokensListSize = _.size(dappTokens);
  const parsedList = useMemo(() => parseList(dappTokens), [tokensListSize]);

  return (
    <StyledModalContent>
      <TokensList tokens={parsedList} onClick={onCurrencySelect} />
    </StyledModalContent>
  );
};

const useDecimals = (fromToken?: string, toToken?: string) => {
  const { data: dappTokens } = useDappTokens();
  const fromTokenDecimals = dappTokens?.[fromToken || ""]?.decimals;
  const toTokenDecimals = dappTokens?.[toToken || ""]?.decimals;

  return { fromTokenDecimals, toTokenDecimals };
};

const handleAddress = (address?: string) => {
  return !address ? "" : "BNB" ? zeroAddress : address;
};

const useTokenModal = (item1: any, item2: any, item3: any, isFrom?: boolean) => {
  const context = useContext(Context);
  return () => context.openModal(!!isFrom);
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { isDarkTheme } = useTheme();
  const { account, library, chainId } = useWeb3React();
  const { data: dappTokens } = useDappTokens();

  const _useTrade = (fromToken?: string, toToken?: string, amount?: string) => {
    const { fromTokenDecimals, toTokenDecimals } = useDecimals(handleAddress(fromToken), handleAddress(toToken));
    return useTrade(fromToken, toToken, amount, fromTokenDecimals, toTokenDecimals);
  };

  const connector = useMemo(() => {
    return {
      options: {
        getProvider: () => library,
      },
    };
  }, [library]);

  return (
    <StyledPancakeTwap isDarkTheme={isDarkTheme ? 1 : 0}>
      <TWAP
        account={account}
        srcToken="BNB"
        dstToken="0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
        dappTokens={dappTokens}
        isDarkTheme={isDarkTheme}
        limit={limit}
        ConnectButton={ConnectButton}
        usePriceUSD={usePriceUSD}
        connectedChainId={chainId}
        useTrade={_useTrade}
        useTokenModal={useTokenModal}
        onDstTokenSelected={(it: any) => console.log(it)}
        nativeToken={native}
        connector={connector}
      />
    </StyledPancakeTwap>
  );
};

const logo = "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_%281%29.png?1629359065";
const DappComponent = () => {
  const { isDarkTheme } = useTheme();
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  return (
    <ContextWrapper>
      <Tokens />
      <StyledPancake isDarkTheme={isDarkTheme ? 1 : 0}>
        <StyledPancakeLayout name={config.name}>
          <UISelector selected={selected} select={setSelected} limit={true} />
          <Wrapper>
            <TWAPComponent limit={selected === SelectorOption.LIMIT} />
          </Wrapper>
        </StyledPancakeLayout>
        <StyledPancakeOrders isDarkTheme={isDarkTheme ? 1 : 0}>
          <Orders />
        </StyledPancakeOrders>
      </StyledPancake>
    </ContextWrapper>
  );
};

const Tokens = () => {
  const context = useContext(Context);

  const selectToken = hooks.useSelectTokenCallback(parseToken);

  const onSelect = useCallback(
    (token: any) => {
      selectToken({ isSrc: !!context.isFrom, token });
      context.close();
    },
    [selectToken, context.isFrom, context.close]
  );

  return (
    <Popup isOpen={!!context.showModal} onClose={context.close}>
      <TokenSelectModal onCurrencySelect={onSelect} />;
    </Popup>
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

const StyledWrapper = styled(Box)({
  position: "relative",
  width: "100%",
});

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config,
};

export default dapp;
