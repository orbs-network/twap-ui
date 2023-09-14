import { StyledModalContent, StyledPancake, StyledPancakeBackdrop, StyledPancakeLayout, StyledPancakeTwap } from "./styles";
import { TWAP, Orders } from "@orbs-network/twap-ui-pancake";
import { useConnectWallet, useNetwork, useTheme } from "./hooks";
import { Configs } from "@orbs-network/twap";
import { useWeb3React } from "@web3-react/core";
import { Dapp, TokensList, UISelector } from "./Components";
import { Popup } from "./Components";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { erc20s, zeroAddress } from "@defi.org/web3-candies";
import { SelectorOption, TokenListItem } from "./types";
import { Box } from "@mui/system";
import { styled } from "@mui/material";
import { Components } from "@orbs-network/twap-ui";

const config = Configs.PancakeSwap;

const useDappTokens = () => {
  const { account } = useWeb3React();

  const { isInValidNetwork } = useNetwork(config.chainId);
  return useQuery(
    ["useDappTokens", config.chainId],
    async () => {
      // change api
      const response = await fetch(`https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/bsc.json`);

      const tokens = await response.json();

      const parsed = tokens.map(({ symbol, address, decimals, logoURI, name }: any) => ({
        decimals,
        symbol,
        name,
        address,
        logoURI: logoURI.replace("_1", ""),
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

const useModal = (Component: any) => {
  const { open } = useContext(Context);

  const onClick = () => {
    open(Component);
  };

  return [onClick];
};

const TokenSelectModal = ({ onCurrencySelect }: TokenSelectModalProps) => {
  const { data: dappTokens } = useDappTokens();

  const tokensListSize = _.size(dappTokens);
  const parsedList = useMemo(() => parseList(dappTokens), [tokensListSize]);
  const { close } = useContext(Context);

  const onSelect = (token: any) => {
    onCurrencySelect(token);
    close();
  };

  return (
    <StyledModalContent>
      <TokensList tokens={parsedList} onClick={onSelect} />
    </StyledModalContent>
  );
};

const nativeToken = {
  chainId: 56,
  decimals: 18,
  symbol: "BNB",
  name: "Binance Chain Native Token",
  isNative: true,
  isToken: false,
};

const TWAPComponent = ({ limit }: { limit?: boolean }) => {
  const { isDarkTheme } = useTheme();
  const { account, library } = useWeb3React();
  const { data: dappTokens } = useDappTokens();

  const connector = {
    getProvider: () => library,
  };

  return (
    <StyledPancakeTwap isDarkTheme={isDarkTheme ? 1 : 0}>
      <TWAP
        account={account}
        srcToken="BNB"
        dstToken="0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
        dappTokens={dappTokens}
        TokenSelectModal={TokenSelectModal}
        isDarkTheme={isDarkTheme}
        limit={limit}
        connector={connector}
        ConnectButton={ConnectButton}
        useModal={useModal}
        onSrcTokenSelected={() => {}}
        onDstTokenSelected={() => {}}
        nativeToken={nativeToken}
      />
    </StyledPancakeTwap>
  );
};

const ListPopup = () => {
  const { modal, close } = useContext(Context);

  return (
    <Popup isOpen={!!modal} onClose={close}>
      {modal}
    </Popup>
  );
};

const logo = "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_%281%29.png?1629359065";
const DappComponent = () => {
  const { isDarkTheme } = useTheme();
  const [selected, setSelected] = useState(SelectorOption.TWAP);

  return (
    <ContextWrapper>
      <ListPopup />
      <StyledPancake isDarkTheme={isDarkTheme ? 1 : 0}>
        <StyledPancakeLayout name={config.name}>
          <UISelector selected={selected} select={setSelected} limit={true} />
          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
          <StyledPancakeOrders>
            <StyledPancakeTwap isDarkTheme={isDarkTheme ? 1 : 0}>
              <Orders />
            </StyledPancakeTwap>
          </StyledPancakeOrders>
        </StyledPancakeLayout>
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

export const StyledPancakeOrders = styled(Wrapper)({});

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
