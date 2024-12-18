import { StyledBaseSwap, StyledBaseSwapBox, StyledBaseSwapLayout, StyledModalContent } from "./styles";
import { TWAP, config, OrdersPanel } from "@orbs-network/twap-ui-baseswap";
import { TooltipProps } from "@orbs-network/twap-ui";
import MuiTooltip from "@mui/material/Tooltip";
import { useConnectWallet, useGetTokens, usePriceUSD, useTheme, useTrade } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { SelectorOption, TokenListItem } from "./types";
import { erc20s, network } from "@defi.org/web3-candies";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DappProvider } from "./context";

const useDappTokens = () => {
  const { chainId } = useWeb3React();
  return useGetTokens({
    url: "https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/CoinGecko.8453.json",
    baseAssets: erc20s.base,
    parse: (data?: any) => {
      const native = chainId && network(chainId).native;
      return native ? [native, ...data.tokens] : data.tokens;
    },
  });
};

interface TokenSelectModalProps {
  finalFocusRef: "tokenIn" | "tokenOut";
  isOpen?: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const parseList = (rawList?: any): TokenListItem[] => {
  return rawList?.map((rawToken: any) => {
    return {
      token: {
        address: rawToken.address ?? rawToken.tokenInfo?.address,
        decimals: rawToken.decimals ?? rawToken.tokenInfo?.decimals,
        symbol: rawToken.symbol ?? rawToken.tokenInfo?.symbol,
        logoUrl: rawToken.logoURI,
      },
      rawToken,
    };
  });
};

export const TokenSelectModal = ({ finalFocusRef, isOpen, onClose }: TokenSelectModalProps) => {
  const tokensList = useDappTokens().data;

  const parsedList = parseList(tokensList);
  const { setSrcToken, setDstToken } = useContext(Context);

  const onClick = (token: any) => {
    if (finalFocusRef === "tokenIn") {
      setSrcToken(token);
    } else {
      setDstToken(token);
    }
    onClose();
  };

  return (
    <Popup isOpen={!!isOpen} onClose={onClose}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={onClick} />
      </StyledModalContent>
    </Popup>
  );
};

const Modal = ({ children, isOpen, onClose }: { children: ReactNode; isOpen: boolean; onClose: () => void }) => {
  return (
    <Popup isOpen={!!isOpen} onClose={onClose}>
     <StyledModalContent>
     {children}
     </StyledModalContent>
    </Popup>
  );
};

interface ContextProps {
  srcToken: any;
  dstToken: any;
  setSrcToken: (srcToken: any) => void;
  setDstToken: (dstToken: any) => void;
}
const Context = createContext({} as ContextProps);

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  const [srcToken, setSrcToken] = useState<any>(undefined);
  const [dstToken, setDstToken] = useState<any>(undefined);

  return <Context.Provider value={{ srcToken, dstToken, setSrcToken, setDstToken }}>{children}</Context.Provider>;
};

const _useTrade = (fromToken?: string, toToken?: string, amount?: string) => {
  const tokens = useDappTokens().data;
  return useTrade(fromToken, toToken, amount, tokens);
};

const useUSD = (address?: string) => {
  const res = usePriceUSD(address);
  return res?.toString();
};

const Tooltip = (props: TooltipProps) => {
  return (
    <MuiTooltip title={props.tooltipText} arrow>
      <span>{props.children}</span>
    </MuiTooltip>
  );
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { account, library, chainId } = useWeb3React();
  const connect = useConnectWallet();
  const { data: dappTokens } = useDappTokens();
  const { isDarkTheme } = useTheme();
  const { srcToken, dstToken, setDstToken, setSrcToken } = useContext(Context);
  const onSwitchTokens = useCallback(() => {
    setSrcToken(dstToken);
    setDstToken(srcToken);
  }, [srcToken, dstToken, setSrcToken, setDstToken]);

  useEffect(() => {
    if (!dappTokens) return;
    if (!srcToken) {
      setSrcToken(dappTokens[1]);
    }
    if (!dstToken) {
      setDstToken(dappTokens[2]);
    }
  }, [dappTokens, srcToken, dstToken]);

  return (
    <TWAP
      provider={library?.givenProvider}
      connect={connect}
      account={account}
      srcToken={srcToken}
      dstToken={dstToken}
      dappTokens={dappTokens}
      TokenSelectModal={TokenSelectModal}
      isDarkTheme={isDarkTheme}
      limit={limit}
      connectedChainId={chainId}
      onSwitchTokens={onSwitchTokens}
      useTrade={_useTrade}
      useUSD={useUSD}
      Tooltip={Tooltip}
      Modal={Modal}
    />
  );
};

const logo = "https://baseswap.fi/images/newlogo.png";

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  return (
    <DappProvider config={config}>
      <ContextWrapper>
        <StyledBaseSwap>
          <StyledBaseSwapLayout name={config.name}>
            <UISelector limit={true} select={setSelected} selected={selected} />
            <StyledBaseSwapBox>
              <TWAPComponent limit={selected === SelectorOption.LIMIT} />
            </StyledBaseSwapBox>
            <OrdersPanel />
          </StyledBaseSwapLayout>
        
        </StyledBaseSwap>
     
      </ContextWrapper>
    </DappProvider>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo,
  configs: [config],
  path: config.name.toLowerCase(),
};

export default dapp;
