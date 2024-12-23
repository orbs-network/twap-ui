import { StyledModalContent, StyledPancake, StyledPancakeBackdrop, StyledPancakeLayout, StyledPancakeOrders, StyledPancakeTwap } from "./styles";
import { TWAP, Orders, useConfig as usePancakeConfig } from "@orbs-network/twap-ui-pancake";
import { useConnectWallet, useGetTokens, useIsMobile, usePriceUSD, useTheme, useTrade } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import Web3 from "web3";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import { erc20s, isNativeAddress, zeroAddress, eqIgnoreCase } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
import { Box } from "@mui/system";
import { Button, styled, Tooltip, Typography } from "@mui/material";
import { amountBNV2, Components, hooks, Styles } from "@orbs-network/twap-ui";
import BN from "bignumber.js";

const useConfig = () => {
  const { chainId } = useWeb3React();
  return usePancakeConfig(chainId);
};

const useParseListToken = () => {
  const config = useConfig();
  return useCallback(
    (tokenList: any) => {
      let tokens = tokenList.tokens.map(({ symbol, address, decimals, logoURI, name }: any) => ({
        decimals,
        symbol,
        name,
        address,
        logoURI: logoURI.replace("_1", ""),
      }));

      const native = {
        symbol: config.nativeToken.symbol,
        address: config.nativeToken.address,
        decimals: config.nativeToken.decimals,
        logoURI: config.nativeToken.logoUrl,
      };

      return [native, ...tokens];
    },
    [config.nativeToken]
  );
};
export const useDappTokens = () => {
  const parse = useParseListToken();
  const config = useConfig();

  const { url, baseAssets } = useMemo(() => {
    switch (config.chainId) {
      case Configs.Lynex.chainId:
        return {
          url: "https://tokens.pancakeswap.finance/pancakeswap-linea-default.json",
          baseAssets: erc20s.linea,
        };
      case Configs.BaseSwap.chainId:
        return {
          url: "https://tokens.pancakeswap.finance/pancakeswap-base-default.json",
          baseAssets: erc20s.linea,
        };
      case Configs.Arbidex.chainId:
        return {
          url: "https://tokens.pancakeswap.finance/pancakeswap-arbitrum-default.json",
          baseAssets: erc20s.linea,
        };

      default:
        return {
          url: "https://tokens.pancakeswap.finance/pancakeswap-extended.json",
          baseAssets: erc20s.bsc,
        };
    }
  }, [config.chainId]);

  return useGetTokens({
    chainId: config.chainId,
    parse,
    modifyList: (tokens: any) => ({ ..._.mapKeys(tokens, (t) => t.address) }),
    baseAssets,
    url,
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

const useDecimals = (fromTokenAddress?: string, toTokenAddress?: string) => {
  const { data: dappTokens } = useDappTokens();
  const { fromToken, toToken } = useMemo(() => {
    if (!dappTokens) {
      return { fromToken: undefined, toToken: undefined };
    }
    return {
      fromToken: fromTokenAddress && Object.values(dappTokens).find((it: any) => eqIgnoreCase(fromTokenAddress || "", it.address)),
      toToken: toTokenAddress && Object.values(dappTokens).find((it: any) => eqIgnoreCase(toTokenAddress || "", it.address)),
    };
  }, [dappTokens, fromTokenAddress, toTokenAddress]);

  return { fromTokenDecimals: (fromToken as any)?.decimals, toTokenDecimals: (toToken as any)?.decimals };
};

const useHandleAddress = () => {
  const config = useConfig();
  return useCallback(
    (address?: string) => {
      return address === config.nativeToken.symbol ? zeroAddress : address;
    },
    [config.nativeToken.symbol]
  );
};

const useTokenModal = (item1: any, item2: any, item3: any, isFrom?: boolean) => {
  const context = useContext(Context);
  return () => context.openModal(!!isFrom);
};

const useTooltip = (content: ReactNode, options?: any, children?: ReactNode) => {
  const targetRef = useRef<any>(null);

  const tooltip = (
    <Tooltip title={content}>
      <span>{children}</span>
    </Tooltip>
  );

  return {
    targetRef,
    tooltip,
  };
};

const DappButton = ({ isLoading, disabled, children, onClick }: any) => {
  return (
    <StyledButton variant="contained" fullWidth disabled={isLoading || disabled} onClick={onClick}>
      {children}
    </StyledButton>
  );
};

const StyledButton = styled(Button)({
  width: "100%",
});

const ApproveModalContent = ({ title, isBonus, isMM }: { title: string; isBonus: boolean; isMM: boolean }) => {
  return <p>Approving</p>;
};

const SwapTransactionErrorContent = ({ message }: { message: string }) => {
  return <p>{message}</p>;
};
const SwapPendingModalContent = ({ title }: { title: string }) => {
  return <p>{title}</p>;
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { isDarkTheme } = useTheme();
  const { account, library, chainId } = useWeb3React();
  const { data: dappTokens } = useDappTokens();
  const isMobile = useIsMobile();
  const config = useConfig();
  const [srcToken, setSrcToken] = useState<any>(undefined);
  const [dstToken, setDstToken] = useState<any>(undefined);

  useEffect(() => {
    if (!dappTokens) return;

    if (!srcToken) {
      setSrcToken((Object.values(dappTokens) as any)?.[1]);
    }

    if (!dstToken) {
      setDstToken((Object.values(dappTokens) as any)?.[2]);
    }
  }, [dappTokens, srcToken, dstToken]);

  useEffect(() => {
    setSrcToken(undefined);
    setDstToken(undefined);
  }, [chainId]);

  const _useTrade = (fromToken?: string, toToken?: string, amount?: string) => {
    const handleAddress = useHandleAddress();

    const fromAddress = handleAddress(fromToken);
    const toAddress = handleAddress(toToken);

    const { fromTokenDecimals, toTokenDecimals } = useDecimals(fromAddress, toAddress);
    return useTrade(fromAddress, toAddress, amount, fromTokenDecimals, toTokenDecimals);
  };

  const connector = useMemo(() => {
    return {
      getProvider: () => library,
    };
  }, [library]);

  return (
    <TWAP
      account={account}
      srcToken={srcToken?.symbol}
      dstToken={dstToken?.symbol}
      dappTokens={dappTokens}
      isDarkTheme={isDarkTheme}
      limit={limit}
      ConnectButton={ConnectButton}
      usePriceUSD={usePriceUSD}
      connectedChainId={chainId}
      useTrade={_useTrade}
      useTokenModal={useTokenModal}
      onDstTokenSelected={(it: any) => setSrcToken(it)}
      onSrcTokenSelected={(it: any) => setDstToken(it)}
      nativeToken={config.nativeToken}
      connector={connector}
      isMobile={isMobile}
      useTooltip={useTooltip}
      Button={DappButton}
      ApproveModalContent={ApproveModalContent}
      SwapTransactionErrorContent={SwapTransactionErrorContent}
      SwapPendingModalContent={SwapPendingModalContent}
      SwapTransactionReceiptModalContent={SwapPendingModalContent}
      TradePrice={TradePrice}
      TradePriceToggle={TradePriceToggle}
    />
  );
};

const logo = "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_%281%29.png?1629359065";
const DappComponent = () => {
  const { isDarkTheme } = useTheme();
  const [selected, setSelected] = useState(SelectorOption.TWAP);
  const isMobile = useIsMobile();
  const config = useConfig();
  return (
    <ContextWrapper>
      <Tokens />
      <StyledPancake isDarkTheme={isDarkTheme ? 1 : 0}>
        {isMobile && (
          <StyledPancakeOrders isDarkTheme={isDarkTheme ? 1 : 0}>
            <Orders />
          </StyledPancakeOrders>
        )}
        <StyledPancakeLayout name={config.name}>
          <UISelector selected={selected} select={setSelected} limit={true} />
          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledPancakeLayout>
        {!isMobile && (
          <StyledPancakeOrders isDarkTheme={isDarkTheme ? 1 : 0}>
            <Orders />
          </StyledPancakeOrders>
        )}
      </StyledPancake>
    </ContextWrapper>
  );
};

export const useParseToken = () => {
  const config = useConfig();
  return useCallback(
    (rawToken: any): any => {
      const { address, decimals, symbol, logoURI } = rawToken;

      if (!symbol) {
        console.error("Invalid token", rawToken);
        return;
      }
      if (!address || isNativeAddress(address) || address === "BNB") {
        return config?.nativeToken;
      }
      return {
        address: Web3.utils.toChecksumAddress(address),
        decimals,
        symbol,
        logoUrl: logoURI,
      };
    },
    [config?.nativeToken, config?.chainId]
  );
};

const Tokens = () => {
  const context = useContext(Context);
  const parseToken = useParseToken();

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

const StyledWrapper = styled(Box)({
  position: "relative",
  width: "100%",
});

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  config: Configs.PancakeSwap,
};

export default dapp;

const TradePriceToggle = ({ onClick }: { onClick: () => void }) => {
  return <button onClick={onClick}>T</button>;
};

const TradePrice = (props: { leftSymbol?: string; rightSymbol?: string; price?: string }) => {
  return (
    <Typography>
      1 {props.leftSymbol} = {props.price} {props.rightSymbol}
    </Typography>
  );
};

export const amountUi = (decimals?: number, amount?: BN) => {
  if (!decimals || !amount) return "";
  const percision = BN(10).pow(decimals || 0);
  return amount.times(percision).idiv(percision).div(percision).toString();
};
