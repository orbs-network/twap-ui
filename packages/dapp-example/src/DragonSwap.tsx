import { StyledSushiLayout, StyledSushi, StyledSushiModalContent } from "./styles";
import { SushiModalProps, TWAP } from "@orbs-network/twap-ui-generic";
import { useConnectWallet, useGetTokens, usePriceUSD, useTheme, useTrade } from "./hooks";
import { useWeb3React } from "@web3-react/core";
import { Dapp, Popup, TokensList, UISelector } from "./Components";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import MuiTooltip from "@mui/material/Tooltip";
import { SelectorOption, TokenListItem } from "./types";
import { mapCollection, size, TooltipProps, Configs } from "@orbs-network/twap-ui";
import { DappProvider } from "./context";
import { baseSwapTokens } from "./BaseSwap";
import { zeroAddress } from "@orbs-network/twap-sdk";

const config = Configs.DragonSwap;

const getLogo = (address: string) => {
  return `https://raw.githubusercontent.com/dragonswap-app/assets/main/logos/${address}/logo.png`;
};

// const nativeToken = {
//   address: zeroAddress,
//   decimals: 18,
//   name: "SEI",
//   symbol: "SEI",
//   logoUrl: getLogo("0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"),
// };

export const useDappTokens = () => {
  const parseListToken = useCallback(
    (tokenList?: any) => {
      console.log({ tokenList });

      return tokenList?.tokens.map((t: any) => {
        return {
          decimals: t.decimals,
          symbol: t.symbol,
          name: t.name,
          address: t.address === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ? zeroAddress : t.address,
          logoURI: getLogo(t.address),
        };
      });
    },
    [config?.chainId],
  );

  return useGetTokens({
    url: "https://raw.githubusercontent.com/dragonswap-app/assets/main/tokenlist-sei-mainnet.json",
    parse: parseListToken,
    // modifyList: (tokens: any) => tokens.slice(0, 20),
  });
};

const parseList = (rawList?: any): TokenListItem[] => {
  return mapCollection(rawList, (rawToken: any) => {
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

const TokenSelectModal = ({ children, onSelect, selected }: { children: ReactNode; onSelect: (value: any) => void; selected: any }) => {
  const { data: baseAssets } = useDappTokens();
  const [open, setOpen] = useState(false);
  const { isDarkTheme } = useTheme();
  const tokensListSize = size(baseAssets);
  const parsedList = useMemo(() => parseList(baseAssets), [tokensListSize]);

  const _onSelect = (value: any) => {
    setOpen(false);
    onSelect(value);
  };

  return (
    <>
      <Popup isOpen={open} onClose={() => setOpen(false)}>
        <StyledSushiModalContent isDarkTheme={isDarkTheme ? 1 : 0}>
          <TokensList tokens={parsedList} onClick={_onSelect} />
        </StyledSushiModalContent>
      </Popup>
      <div onClick={() => setOpen(true)}>{children}</div>
    </>
  );
};

const getTokenLogo = (token: any) => {
  return token.logoURI;
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
  const [fromToken, setFromToken] = useState(undefined);
  const [toToken, setToToken] = useState(undefined);

  const _useTrade = (fromToken?: string, toToken?: string, amount?: string) => {
    return useTrade(fromToken, toToken, amount, dappTokens);
  };

  const connector = useMemo(() => {
    return {
      getProvider: () => library,
    };
  }, [library]);

  useEffect(() => {
    setFromToken(undefined);
    setToToken(undefined);
  }, [chainId]);

  useEffect(() => {
    if (!fromToken) {
      setFromToken(dappTokens?.[1]);
    }
    if (!toToken) {
      setToToken(dappTokens?.[2]);
    }
  }, [dappTokens, toToken]);

  const onSwitchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <TWAP
      config={config}
      connect={connect}
      account={account}
      connector={connector}
      srcToken={fromToken}
      dstToken={toToken}
      dappTokens={dappTokens}
      TokenSelectModal={TokenSelectModal}
      isDarkTheme={isDarkTheme}
      useTrade={_useTrade}
      connectedChainId={chainId}
      limit={limit}
      Modal={SushiModal}
      getTokenLogo={getTokenLogo}
      useUSD={useUSD}
      onSrcTokenSelected={(it: any) => setFromToken(it)}
      onDstTokenSelected={(it: any) => setToToken(it)}
      onSwitchTokens={onSwitchTokens}
      Tooltip={Tooltip}
    />
  );
};

const SushiModal = (props: SushiModalProps) => {
  const { isDarkTheme } = useTheme();

  return (
    <Popup isOpen={props.open} onClose={props.onClose}>
      <StyledSushiModalContent isDarkTheme={isDarkTheme ? 1 : 0}>
        <Popup.Header title={props.title} Component={props.header} onClose={props.onClose} />
        <Popup.Body>{props.children}</Popup.Body>
      </StyledSushiModalContent>
    </Popup>
  );
};

const DappComponent = () => {
  const [selected, setSelected] = useState(SelectorOption.TWAP);
  const { isDarkTheme } = useTheme();

  return (
    <DappProvider config={config}>
      <StyledSushi isDarkMode={isDarkTheme ? 1 : 0}>
        <StyledSushiLayout name={config.name}>
          <UISelector selected={selected} select={setSelected} limit={true} />

          <TWAPComponent limit={selected === SelectorOption.LIMIT} />
        </StyledSushiLayout>
      </StyledSushi>
    </DappProvider>
  );
};

const dapp: Dapp = {
  Component: DappComponent,
  logo: "https://avatars.githubusercontent.com/u/157521400?s=200&v=4",
  configs: [config],
  path: config.name.toLowerCase(),
};

export default dapp;
