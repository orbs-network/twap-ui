import { StyledModalContent, StyledPancake, StyledPancakeBackdrop, StyledPancakeLayout, StyledPancakeOrders, StyledPancakeTwap } from "./styles";
import { TWAP } from "@orbs-network/twap-ui-pancake";
import { useConnectWallet, useGetTokens, useIsMobile, usePriceUSD, useTheme, useTrade } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Dapp, Popup, TokensList, UISelector } from "./Components";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { erc20s, network, zeroAddress } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
import { Box } from "@mui/system";
import { Button, styled, Typography } from "@mui/material";
import { Components, Configs, mapKeys } from "@orbs-network/twap-ui";
import BN from "bignumber.js";
import { DappProvider } from "./context";
const config = Configs.PancakeSwap;

let native = network(config.chainId).native;

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
    parse: parseListToken,
    modifyList: (tokens: any) => ({ ...mapKeys(tokens, (t: any) => t.address) }),
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
  return rawList.map((rawToken: any) => {
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
  return <Components.Base.Button onClick={connect}>Connect Wallet</Components.Base.Button>;
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

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset: any;
  onSelect: (value: any) => void;
  otherAsset: any;
}

const TokenSelectModal = ({ isOpen, onClose, onSelect }: TokenSelectModalProps) => {
  const { data: dappTokens } = useDappTokens();

  const parsedList = useMemo(() => parseList(dappTokens), [dappTokens]);

  return (
    <Popup isOpen={isOpen} onClose={onClose}>
      <StyledModalContent>
        <TokensList tokens={parsedList} onClick={onSelect} />
      </StyledModalContent>
    </Popup>
  );
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { isDarkTheme } = useTheme();
  const { account, library, chainId } = useWeb3React();
  const { data: dappTokens } = useDappTokens();
  const [fromToken, setFromToken] = useState(undefined);
  const [toToken, setToToken] = useState(undefined);
  const isMobile = useIsMobile();

  const _useTrade = (fromToken?: string, toToken?: string, amount?: string) => {
    return useTrade(fromToken, toToken, amount, dappTokens);
  };
  useEffect(() => {
    setFromToken(undefined);
    setToToken(undefined);
  }, [chainId]);

  useEffect(() => {
    const arr = Object.values(dappTokens) as any;

    if (!fromToken) {
      setFromToken(arr[1]);
    }
    if (!toToken) {
      setToToken(arr[2]);
    }
  }, [dappTokens, toToken, fromToken]);

  const connector = useMemo(() => {
    return {
      getProvider: () => library,
    };
  }, [library]);

  const onSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };
  return null;

  // return (
  //   <StyledPancakeTwap isDarkTheme={isDarkTheme ? 1 : 0}>
  //     <TWAP
  //       account={account}
  //       srcToken={fromToken}
  //       dstToken={toToken}
  //       dappTokens={dappTokens}
  //       isDarkTheme={isDarkTheme}
  //       limit={limit}
  //       ConnectButton={ConnectButton}
  //       usePriceUSD={usePriceUSD}
  //       connectedChainId={chainId}
  //       useTrade={_useTrade}
  //       TokenSelectModal={TokenSelectModal}
  //       Modal={Popup}
  //       nativeToken={native}
  //       connector={connector}
  //       isMobile={isMobile}
  //       Button={DappButton}
  //       ApproveModalContent={ApproveModalContent}
  //       SwapTransactionErrorContent={SwapTransactionErrorContent}
  //       SwapPendingModalContent={SwapPendingModalContent}
  //       SwapTransactionReceiptModalContent={SwapPendingModalContent}
  //       TradePrice={TradePrice}
  //       TradePriceToggle={TradePriceToggle}
  //       onSrcTokenSelected={(token: any) => setFromToken(token)}
  //       onDstTokenSelected={(token: any) => setToToken(token)}
  //       onSwitchTokens={onSwitchTokens}
  //     />
  //   </StyledPancakeTwap>
  // );
};

const logo = "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_%281%29.png?1629359065";
const DappComponent = () => {
  const { isDarkTheme } = useTheme();
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  return (
    <DappProvider config={config}>
      <StyledPancake isDarkTheme={isDarkTheme ? 1 : 0}>
        <StyledPancakeLayout name={config.name}>
          <UISelector selected={selected} select={setSelected} limit={true} />
          <Wrapper>
            <TWAPComponent limit={selected === SelectorOption.LIMIT} />
          </Wrapper>
          <Components.LimitPriceMessage />
        </StyledPancakeLayout>
      </StyledPancake>
    </DappProvider>
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
  configs: [config],
  path: config.name.toLowerCase(),
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
