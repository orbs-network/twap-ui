import { StyledModalContent, StyledPancake, StyledPancakeLayout, StyledPancakeOrders, StyledPancakeTwap } from "./styles";
import { TWAP, Orders, useConfig as usePancakeConfig, ToastProps } from "@orbs-network/twap-ui-pancake";
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
import { Button, styled, Tooltip as MuiTooltip } from "@mui/material";
import { Components, hooks, Styles } from "@orbs-network/twap-ui";
import BN from "bignumber.js";
import { useSnackbar } from "notistack";

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
  srcToken?: any;
  dstToken?: any;
  onSrcTokenSelected: (it: any) => void;
  onDstTokenSelected: (it: any) => void;
}
const Context = createContext({} as ContextProps);

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  const { chainId } = useWeb3React();
  const [showModal, setShowModal] = useState(false);
  const [isFrom, setIsFrom] = useState(true);
  const [srcToken, setSrcToken] = useState<any>(undefined);
  const [dstToken, setDstToken] = useState<any>(undefined);
  const { data: dappTokens } = useDappTokens();

  const openModal = (value: boolean) => {
    setIsFrom(value);
    setShowModal(true);
  };

  useEffect(() => {
    setSrcToken(undefined);
    setDstToken(undefined);
  }, [chainId]);

  useEffect(() => {
    if (!dappTokens) return;

    if (!srcToken) {
      setSrcToken((Object.values(dappTokens) as any)?.[1]);
    }

    if (!dstToken) {
      setDstToken((Object.values(dappTokens) as any)?.[2]);
    }
  }, [dappTokens, srcToken, dstToken]);

  const onSrcTokenSelected = useCallback(
    (it: any) => {
      if (eqIgnoreCase(it.address || "", dstToken?.address || "")) {
        setSrcToken(it);
        setDstToken(srcToken);
      } else {
        setSrcToken(it);
      }
    },
    [dstToken, srcToken]
  );

  const onDstTokenSelected = useCallback(
    (it: any) => {
      if (eqIgnoreCase(it.address || "", srcToken?.address || "")) {
        setDstToken(it);
        setSrcToken(dstToken);
      } else {
        setDstToken(it);
      }
    },
    [dstToken, srcToken]
  );

  return (
    <Context.Provider value={{ onSrcTokenSelected, onDstTokenSelected, srcToken, dstToken, isFrom, setIsFrom, showModal, openModal, close: () => setShowModal(false) }}>
      {children}
    </Context.Provider>
  );
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

const useAppContext = () => {
  return useContext(Context);
};

const useTokenModal = (item1: any, item2: any, item3: any, isFrom?: boolean) => {
  const context = useAppContext();
  return () => context.openModal(!!isFrom);
};

const Tooltip = ({ content, children }: { content: ReactNode; children?: ReactNode }) => {
  return (
    <MuiTooltip title={content}>
      <span>{children}</span>
    </MuiTooltip>
  );
};

const TxErrorContent = ({ message, onClick }: { message?: string; onClick: () => void }) => {
  return (
    <div>
      <p>{message}</p>
      <button onClick={onClick}>Close</button>
    </div>
  );
};

const useTooltip = (content: ReactNode, options?: any, children?: ReactNode) => {
  const targetRef = useRef<any>(null);

  const tooltip = (
    <MuiTooltip title={content}>
      <span>{children}</span>
    </MuiTooltip>
  );

  return {
    targetRef,
    tooltip,
  };
};

const ToastContent = ({ title, message }: ToastProps) => {
  return (
    <div>
      <p>{title}</p>
      <div>{message}</div>
    </div>
  );
};

const useToast = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  return useCallback(
    (props: ToastProps) => {
      enqueueSnackbar(<ToastContent {...props} />, {
        action: props.autoCloseMillis ? undefined : (key) => <button onClick={() => closeSnackbar(key)}>Dismiss</button>,
        variant: props.variant,
        autoHideDuration: props.autoCloseMillis,
      });
    },
    [enqueueSnackbar, closeSnackbar]
  );
};

const _Button = ({ children, disabled, onClick }: { children: ReactNode; disabled: boolean; onClick: () => void }) => {
  return (
    <StyledButton onClick={onClick} disabled={disabled}>
      {children}
    </StyledButton>
  );
};

const StyledButton = styled("button")(({ disabled }) => {
  return {
    background: "#1FC7D4",
    borderRadius: 16,
    height: 48,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 16,
    fontWeight: 600,
    border: "none",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };
});

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { isDarkTheme } = useTheme();
  const { account, library, chainId } = useWeb3React();
  const { data: dappTokens } = useDappTokens();
  const isMobile = useIsMobile();
  const config = useConfig();
  const { srcToken, onDstTokenSelected, onSrcTokenSelected, dstToken } = useAppContext();
  const toast = useToast();

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
      srcToken={srcToken}
      dstToken={dstToken}
      dappTokens={dappTokens}
      isDarkTheme={isDarkTheme}
      limit={limit}
      ConnectButton={ConnectButton}
      usePriceUSD={usePriceUSD}
      connectedChainId={chainId}
      useTrade={_useTrade}
      useTokenModal={useTokenModal}
      onDstTokenSelected={onDstTokenSelected}
      onSrcTokenSelected={onSrcTokenSelected}
      nativeToken={config.nativeToken}
      connector={connector}
      isMobile={isMobile}
      useTooltip={useTooltip}
      Tooltip={Tooltip}
      TransactionErrorContent={TxErrorContent}
      Button={_Button}
      toast={toast}
    />
  );
};

const logo = "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_%281%29.png?1629359065";
const DappComponent = () => {
  const { isDarkTheme } = useTheme();
  const [selected, setSelected] = useState(SelectorOption.LIMIT);
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
  const { onSrcTokenSelected, onDstTokenSelected } = useAppContext();

  const onSelect = useCallback(
    (token: any) => {
      if (context.isFrom) {
        onSrcTokenSelected(token);
      } else {
        onDstTokenSelected(token);
      }
      context.close();
    },
    [context.isFrom, context.close, onSrcTokenSelected, onDstTokenSelected]
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
