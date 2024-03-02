import { StyledModalContent, StyledPancake, StyledPancakeBackdrop, StyledPancakeLayout, StyledPancakeOrders, StyledPancakeTwap } from "./styles";
import { TWAP, Orders } from "@orbs-network/twap-ui-pancake";
import { useConnectWallet, useGetTokens, usePriceUSD, useTheme, useTrade } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import _ from "lodash";
import { erc20s } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
import { Box } from "@mui/system";
import { styled } from "@mui/material";
import { Components } from "@orbs-network/twap-ui";

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
  modal: any;
  open: (modal: any) => void;
  close: () => void;
}
const Context = createContext({} as ContextProps);

const ContextWrapper = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<any>(undefined);

  return <Context.Provider value={{ modal, open: (modal: any) => setModal(modal), close: () => setModal(undefined) }}>{children}</Context.Provider>;
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

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { isDarkTheme } = useTheme();
  const { account, library, chainId } = useWeb3React();
  const { data: dappTokens } = useDappTokens();
  const [isFrom, setIsFrom] = useState(true);
  const [srcToken, setSrcToken] = useState("BNB");
  const [dstToken, setDstToken] = useState("0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d");
  const [open, setOpen] = useState(false);

  const onTokenSelectClick = (isFrom: boolean) => {
    setIsFrom(isFrom);
    setOpen(true);
  };

  const onCurrencySelect = (token: any) => {
    if (isFrom) {
      setSrcToken(token.address);
    } else {
      setDstToken(token.address);
    }
    setOpen(false);
  };

  return (
    <StyledPancakeTwap isDarkTheme={isDarkTheme ? 1 : 0}>
      <Popup isOpen={open} onClose={() => setOpen(false)}>
        <TokenSelectModal selectedCurrency={srcToken} otherSelectedCurrency={dstToken} onCurrencySelect={onCurrencySelect} />
      </Popup>
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
        useTrade={useTrade}
        provider={library}
        onTokenSelectClick={onTokenSelectClick}
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
