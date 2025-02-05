// import { StyledSushiLayout, StyledSushi, StyledSushiModalContent } from "./styles";
// import { SushiModalProps, TWAP } from "@orbs-network/twap-ui-sushiswap";
// import { useConnectWallet, useGetTokens, usePriceUSD, useTheme, useTrade } from "./hooks";
// import { useWeb3React } from "@web3-react/core";
// import { Dapp, Popup, TokensList, UISelector } from "./Components";
// import { useCallback, useEffect, useMemo, useState } from "react";
// import MuiTooltip from "@mui/material/Tooltip";
// import { SelectorOption, TokenListItem } from "./types";
// import { getConfig, mapCollection, size, TooltipProps, Configs, ModalProps, TokensListModalProps } from "@orbs-network/twap-ui";
// import { DappProvider } from "./context";
// import { eqIgnoreCase, network } from "@defi.org/web3-candies";

// const name = "SushiSwap";
// const configs = [Configs.SushiArb, Configs.SushiBase, Configs.SushiEth];

// export const useDappTokens = () => {
//   const config = useConfig();
//   const isBase = config?.chainId === Configs.SushiBase.chainId;
//   const { chainId } = useWeb3React();
//   const nativeToken = network(config.chainId).native;
//   const parseListToken = useCallback(
//     (tokenList?: any) => {
//       const res = tokenList?.tokens
//         .filter((it: any) => it.chainId === config?.chainId)
//         .map(({ symbol, address, decimals, logoURI, name }: any) => ({
//           decimals,
//           symbol,
//           name,
//           address,
//           logoURI,
//         }));
//       const native = {
//         decimals: nativeToken.decimals,
//         symbol: nativeToken.symbol,
//         address: nativeToken.address,
//         logoURI: nativeToken.logoUrl,
//       };

//       return config ? [native, ...res] : res;
//     },
//     [nativeToken, config?.chainId],
//   );

//   const url = useMemo(() => {
//     switch (chainId) {
//       case Configs.SushiEth.chainId:
//       case Configs.SushiArb.chainId:
//         return "https://token-list.sushi.com/";
//       default:
//         break;
//     }
//   }, [chainId]);

//   return useGetTokens({
//     url,
//     parse: parseListToken,
//     tokens: isBase ? [] : undefined,
//     modifyList: (tokens: any) => tokens.slice(0, 20),
//   });
// };

// const parseList = (rawList?: any): TokenListItem[] => {
//   return mapCollection(rawList, (rawToken: any) => {
//     return {
//       token: {
//         address: rawToken.address,
//         decimals: rawToken.decimals,
//         symbol: rawToken.symbol,
//         logoUrl: rawToken.logoURI,
//       },
//       rawToken,
//     };
//   });
// };

// const TokensListModal = ({ onSelect, children }: TokensListModalProps) => {
//   const { data: baseAssets } = useDappTokens();
//   const [isOpen, setOpen] = useState(false);
//   const { isDarkTheme } = useTheme();
//   const tokensListSize = size(baseAssets);
//   const parsedList = useMemo(() => parseList(baseAssets), [tokensListSize]);

//   const _onSelect = (value: any) => {
//     setOpen(false);
//     onSelect(value);
//   };

//   return (
//     <>
//       <Popup isOpen={isOpen} onClose={() => setOpen(false)}>
//         <StyledSushiModalContent isDarkTheme={isDarkTheme ? 1 : 0}>
//           <TokensList tokens={parsedList} onClick={_onSelect} />
//         </StyledSushiModalContent>
//       </Popup>
//       <div onClick={() => setOpen(true)}>{children}</div>
//     </>
//   );
// };

// const getTokenLogo = (token: any) => {
//   return token.logoURI;
// };

// const useUSD = (address?: string) => {
//   const res = usePriceUSD(address);
//   return res?.toString();
// };

// const Tooltip = (props: TooltipProps) => {
//   return (
//     <MuiTooltip title={props.tooltipText} arrow>
//       <span>{props.children}</span>
//     </MuiTooltip>
//   );
// };

// const useToken = (address?: string) => {
//   const { data: tokens } = useDappTokens();

//   return useMemo(() => tokens?.find((it: any) => eqIgnoreCase(it.address, address || "")), [tokens, address]);
// };

// const TWAPComponent = ({ limit }: { limit?: boolean }) => {
//   const { account, library, chainId } = useWeb3React();
//   const connect = useConnectWallet();
//   const { data: dappTokens } = useDappTokens();
//   const { isDarkTheme } = useTheme();
//   const [fromToken, setFromToken] = useState(undefined);
//   const [toToken, setToToken] = useState(undefined);

//   const _useTrade = (fromToken?: string, toToken?: string, amount?: string) => {
//     return useTrade(fromToken, toToken, amount, dappTokens);
//   };

//   const connector = useMemo(() => {
//     return {
//       getProvider: () => library,
//     };
//   }, [library]);

//   useEffect(() => {
//     setFromToken(undefined);
//     setToToken(undefined);
//   }, [chainId]);

//   useEffect(() => {
//     if (!fromToken) {
//       setFromToken(dappTokens?.[1]);
//     }
//     if (!toToken) {
//       setToToken(dappTokens?.[2]);
//     }
//   }, [dappTokens, toToken]);

//   const onSwitchTokens = () => {
//     setFromToken(toToken);
//     setToToken(fromToken);
//   };
//   return null;

//   // return (
//   //   <TWAP
//   //     configChainId={chainId}
//   //     connect={connect}
//   //     account={account}
//   //     connector={connector}
//   //     srcToken={fromToken}
//   //     dstToken={toToken}
//   //     dappTokens={dappTokens}
//   //     isDarkTheme={isDarkTheme}
//   //     useMarketPrice={_useTrade}
//   //     chainId={chainId}
//   //     isLimitPanel={limit}
//   //     Modal={SushiModal}
//   //     getTokenLogo={getTokenLogo}
//   //     useUSD={useUSD}
//   //     onSrcTokenSelected={(it: any) => setFromToken(it)}
//   //     onDstTokenSelected={(it: any) => setToToken(it)}
//   //     onSwitchTokens={onSwitchTokens}
//   //     useToken={useToken}
//   //     components={{ Tooltip, Modal, TokensListModal }}
//   //   />
//   // );
// };

// const SushiModal = (props: SushiModalProps) => {
//   const { isDarkTheme } = useTheme();

//   return (
//     <Popup isOpen={props.open} onClose={props.onClose}>
//       <StyledSushiModalContent isDarkTheme={isDarkTheme ? 1 : 0}>
//         <Popup.Header title={props.title} Component={props.header} onClose={props.onClose} />
//         <Popup.Body>{props.children}</Popup.Body>
//       </StyledSushiModalContent>
//     </Popup>
//   );
// };

// const Modal = (props: ModalProps) => {
//   return (
//     <Popup isOpen={props.isOpen} onClose={props.onClose}>
//       {props.children}
//     </Popup>
//   );
// };

// const useConfig = () => {
//   const { chainId } = useWeb3React();

//   return useMemo(() => getConfig(configs, chainId), [chainId]);
// };

// const DappComponent = () => {
//   const [selected, setSelected] = useState(SelectorOption.TWAP);
//   const { isDarkTheme } = useTheme();

//   const config = useConfig();

//   return (
//     <DappProvider config={config}>
//       <StyledSushi isDarkMode={isDarkTheme ? 1 : 0}>
//         <StyledSushiLayout name={name}>
//           <UISelector selected={selected} select={setSelected} limit={true} />

//           <TWAPComponent limit={selected === SelectorOption.LIMIT} />
//         </StyledSushiLayout>
//       </StyledSushi>
//     </DappProvider>
//   );
// };

// const dapp: Dapp = {
//   Component: DappComponent,
//   logo: "https://cdn.cdnlogo.com/logos/s/10/sushiswap.svg",
//   configs: [Configs.SushiArb, Configs.SushiBase],
//   path: name.toLowerCase(),
//   workInProgress: true,
// };

// export default dapp;

export {};
