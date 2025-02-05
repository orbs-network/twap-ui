// import {
//   Components,
//   Styles as TwapStyles,
//   TWAPTokenSelectProps,
//   hooks,
//   Translations,
//   TwapAdapter,
//   UIPreferences,
//   Configs,
//   Token,
//   size,
//   compact,
//   Styles,
//   LimitPricePercentProps,
// } from "@orbs-network/twap-ui";
// import { useTwapContext } from "@orbs-network/twap-ui-sdk";

// import translations from "./i18n/en.json";
// import { createContext, useContext, useEffect, useMemo } from "react";
// import Web3 from "web3";
// import { eqIgnoreCase, isNativeAddress, network, networks } from "@defi.org/web3-candies";
// import { WidgetProps } from "@orbs-network/twap-ui";
// import { memo, ReactNode, useCallback, useState } from "react";
// import {
//   StyledBalance,
//   StyledCard,
//   StyledContainer,
//   StyledPanelInput,
//   StyledPercentSelector,
//   StyledTokenSelect,
//   StyledColumnFlex,
//   StyledPoweredBy,
//   StyledSubmit,
//   StyledTokenChange,
//   darkTheme,
//   lightTheme,
//   StyledTokenPanelUsd,
//   StyledTopColumn,
//   GlobalStyles,
//   Card,
//   StyledTradeIntervalInput,
//   StyledChunkSelectorInput,
//   StyledTradeInterval,
//   StyledTradeSizeSelect,
//   StyledTradeIntervalAndChunkSelect,
//   StyledPercentSelectorButton,
// } from "./styles";
// import { ThemeProvider } from "styled-components";

// const uiPreferences: UIPreferences = {};

// const MemoizedTokenModal = memo((props: TWAPTokenSelectProps) => {
//   const { TokenSelectModal, dappTokens } = useAdapterContext();

//   return (
//     <TokenSelectModal
//       otherAsset={props.dstTokenSelected}
//       selectedAsset={props.srcTokenSelected}
//       setSelectedAsset={props.onSelect}
//       popup={props.isOpen}
//       setPopup={props.onClose}
//       baseAssets={dappTokens}
//       setOtherAsset={props.onSelect}
//     />
//   );
// });

// const TokenSelectModal = ({ onClose, isSrc, isOpen }: any) => {
//   const { dappTokens } = useAdapterContext();
//   const onTokenSelectedCallback = hooks.useTokenSelect();

//   const onSelect = useCallback(
//     (token: any) => {
//       onTokenSelectedCallback({ isSrc, token });
//       onClose();
//     },
//     [onTokenSelectedCallback, isSrc],
//   );
//   const {
//     state: { srcToken, destToken },
//   } = useTwapContext();

//   const { srcTokenSelected, dstTokenSelected } = useMemo(() => {
//     return {
//       srcTokenSelected: dappTokens?.find((it) => eqIgnoreCase(it.address, srcToken?.address || "")),
//       dstTokenSelected: dappTokens?.find((it) => eqIgnoreCase(it.address, destToken?.address || "")),
//     };
//   }, [dappTokens, srcToken, destToken]);

//   return <MemoizedTokenModal onClose={onClose} isOpen={isOpen} onSelect={onSelect} srcTokenSelected={srcTokenSelected} dstTokenSelected={dstTokenSelected} />;
// };

// const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
//   const [tokenListOpen, setTokenListOpen] = useState(false);

//   const onClose = useCallback(() => {
//     setTokenListOpen(false);
//   }, []);

//   return (
//     <>
//       <TokenSelectModal onClose={onClose} isOpen={tokenListOpen} isSrc={isSrcToken} />
//       <StyledContainer className="twap-token-panel">
//         {isSrcToken && <SrcTokenPercentSelector />}
//         <StyledCard>
//           <TwapStyles.StyledColumnFlex gap={12}>
//             <TwapStyles.StyledRowFlex justifyContent="space-between">
//               <StyledPanelInput isSrc={isSrcToken} />
//               <StyledTokenSelect hideArrow={false} isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
//             </TwapStyles.StyledRowFlex>
//             <TwapStyles.StyledRowFlex style={{ justifyContent: "space-between" }}>
//               <StyledTokenPanelUsd isSrc={isSrcToken} />
//               <StyledBalance isSrc={isSrcToken} />
//             </TwapStyles.StyledRowFlex>
//           </TwapStyles.StyledColumnFlex>
//         </StyledCard>
//       </StyledContainer>
//     </>
//   );
// };

// const SrcTokenPercentSelector = () => {
//   const onPercentClick = hooks.useOnSrcAmountPercent();

//   const onClick = (value: number) => {
//     onPercentClick(value);
//   };

//   return (
//     <StyledPercentSelector className="twap-percent-selector">
//       <StyledPercentSelectorButton onClick={() => onClick(0.1)}>10%</StyledPercentSelectorButton>
//       <StyledPercentSelectorButton onClick={() => onClick(0.25)}>25%</StyledPercentSelectorButton>
//       <StyledPercentSelectorButton onClick={() => onClick(0.5)}>50%</StyledPercentSelectorButton>
//       <StyledPercentSelectorButton onClick={() => onClick(1)}>Max</StyledPercentSelectorButton>
//     </StyledPercentSelector>
//   );
// };

// const config = Configs.Thena;

// interface ThenaTWAPProps extends Partial<WidgetProps> {
//   connect: () => void;
//   dappTokens: any[];
//   connector?: any;
//   setFromAmount: (amount: string) => void;
//   srcToken?: any;
//   dstToken?: any;
// }

// const parseToken = (rawToken: any): Token | undefined => {
//   if (!rawToken) return;
//   const { address, decimals, symbol, logoURI } = rawToken;
//   if (!symbol) {
//     console.error("Invalid token", rawToken);
//     return;
//   }
//   if (!address || isNativeAddress(address) || address === "BNB") {
//     return network(config.chainId).native;
//   }
//   return {
//     address: Web3.utils.toChecksumAddress(address),
//     decimals,
//     symbol,
//     logoUrl: logoURI,
//   };
// };

// const AdapterContext = createContext({} as ThenaTWAPProps);

// const AdapterContextProvider = AdapterContext.Provider;

// const useAdapterContext = () => useContext(AdapterContext);

// export const useProvider = (props: ThenaTWAPProps) => {
//   const [provider, setProvider] = useState<any>(undefined);

//   const setProviderFromConnector = useCallback(async () => {
//     const res = await props.connector?.getProvider();
//     setProvider(res);
//   }, [setProvider, props.connector]);

//   useEffect(() => {
//     setProviderFromConnector();
//   }, [props.account, props.chainId, setProviderFromConnector]);

//   return provider;
// };

// const AmountUpdater = () => {
//   const srcAmount = hooks.useSrcAmount().amountUi;
//   const setFromAmount = useAdapterContext().setFromAmount;
//   useEffect(() => {
//     setFromAmount(srcAmount || "0");
//   }, [setFromAmount, srcAmount]);

//   return null;
// };

// const usePriceUSD = (address?: string) => {
//   const dappTokens = useAdapterContext().dappTokens;
//   return useMemo(() => {
//     if (!address) return undefined;
//     const token = dappTokens?.find((it: any) => eqIgnoreCase(it.address, address));
//     return token?.price;
//   }, [address, dappTokens]);
// };

// const Tooltip = () => {
//   return <div></div>;
// };

// const useParsedTokens = () => {
//   const context = useAdapterContext();
//   return useMemo(() => {
//     if (!size(context.dappTokens)) {
//       return [];
//     }
//     let parsed = context.dappTokens.map((rawToken: any) => {
//       return parseToken(rawToken);
//     });
//     return compact(parsed) as Token[];
//   }, [context.dappTokens, parseToken]);
// };

// const useSelectedParsedTokens = () => {
//   const context = useAdapterContext();

//   return useMemo(() => {
//     return {
//       srcToken: parseToken(context.srcToken),
//       dstToken: parseToken(context.dstToken),
//     };
//   }, [context.srcToken, context.dstToken]);
// };

// const TWAPContent = () => {
//   const props = useAdapterContext();
//   const theme = useMemo(() => {
//     return props.isDarkTheme ? darkTheme : lightTheme;
//   }, [props.isDarkTheme]);

//   const parsedTokens = useParsedTokens();
//   const provider = useProvider(props);
//   const { srcToken, dstToken } = useSelectedParsedTokens();

//   return (
//     <ThemeProvider theme={theme}>
//       <div className="twap-adapter-wrapper">
//         <TwapAdapter
//           connect={props.connect}
//           config={config}
//           maxFeePerGas={props.maxFeePerGas}
//           priorityFeePerGas={props.priorityFeePerGas}
//           translations={translations as Translations}
//           provider={provider}
//           account={props.account}
//           dappTokens={props.dappTokens}
//           onDstTokenSelected={props.onDstTokenSelected}
//           onSrcTokenSelected={props.onSrcTokenSelected}
//           uiPreferences={uiPreferences}
//           parsedTokens={parsedTokens}
//           isLimitPanel={props.limit}
//           Components={{ Tooltip }}
//           srcToken={srcToken}
//           dstToken={dstToken}
//         >
//           <GlobalStyles />
//           <AdapterContextProvider value={props}>
//             <AmountUpdater />
//             {props.limit ? <LimitPanel /> : <TWAPPanel />}
//           </AdapterContextProvider>
//         </TwapAdapter>
//       </div>
//     </ThemeProvider>
//   );
// };

// const TWAP = (props: ThenaTWAPProps) => {
//   return (
//     <AdapterContextProvider value={props}>
//       <TWAPContent />
//     </AdapterContextProvider>
//   );
// };

// const TWAPPanel = () => {
//   return (
//     <div className="twap-container">
//       <StyledColumnFlex>
//         <LimitPrice />
//         <StyledTopColumn>
//           <TokenPanel isSrcToken={true} />
//           <StyledTokenChange />
//           <TokenPanel />
//         </StyledTopColumn>
//         <StyledTradeIntervalAndChunkSelect>
//           <TradeInterval />
//           <TradeSize />
//         </StyledTradeIntervalAndChunkSelect>
//         <MainSubmit />
//       </StyledColumnFlex>
//       <StyledPoweredBy />
//     </div>
//   );
// };

// const LimitPanel = () => {
//   return (
//     <div className="twap-container">
//       <StyledColumnFlex>
//         <StyledTopColumn>
//           <TokenPanel isSrcToken={true} />
//           <StyledTokenChange />
//           <TokenPanel />
//         </StyledTopColumn>
//         <MainSubmit />
//       </StyledColumnFlex>

//       <StyledPoweredBy />
//     </div>
//   );
// };

// const MainSubmit = () => {
//   const account = useAdapterContext().account;
//   return <StyledSubmit connected={account ? 1 : 0} />;
// };

// const TradeSize = () => {
//   return (
//     <StyledTradeSizeSelect>
//       <Card.Header>
//         <Components.Labels.TotalTradesLabel />
//       </Card.Header>
//       <Card.BgContainer>
//         <Components.ChunkSelector>
//           <Styles.StyledRowFlex>
//             <StyledChunkSelectorInput />
//             <Styles.StyledText style={{ fontSize: 13 }}>Orders</Styles.StyledText>
//           </Styles.StyledRowFlex>
//         </Components.ChunkSelector>
//       </Card.BgContainer>
//     </StyledTradeSizeSelect>
//   );
// };

// const LimitPercentButton = (props: LimitPricePercentProps) => {
//   return <StyledPercentSelectorButton onClick={props.onClick}>{props.text}</StyledPercentSelectorButton>;
// };

// const LimitPrice = () => {
//   const [isSrcToken, setIsSrcToken] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);

//   const onSrcSelect = () => {
//     setIsSrcToken(true);
//     setIsOpen(true);
//   };

//   const onDstSelect = () => {
//     setIsSrcToken(false);
//     setIsOpen(true);
//   };

//   return (
//     <>
//       <TokenSelectModal onClose={() => setIsOpen(false)} isOpen={isOpen} isSrc={isSrcToken} />

//       <Card>
//         <Card.Header>
//           <Components.LimitPanel.Switch />
//         </Card.Header>
//         <Card.BgContainer>
//           <Components.LimitPanel.Main
//             onSrcSelect={onSrcSelect}
//             onDstSelect={onDstSelect}
//             Components={{
//               PercentButton: LimitPercentButton,
//             }}
//             styles={{
//               percentButtonsGap: "5px",
//             }}
//           />
//         </Card.BgContainer>
//       </Card>
//     </>
//   );
// };

// const TradeInterval = () => {
//   return (
//     <StyledTradeInterval>
//       <Card.Header>
//         <Components.TradeInterval.Label />
//       </Card.Header>
//       <Styles.StyledColumnFlex>
//         <Components.TradeInterval>
//           <Card.BgContainer>
//             <StyledTradeIntervalInput />
//             <Components.TradeInterval.Resolution />
//           </Card.BgContainer>
//         </Components.TradeInterval>
//       </Styles.StyledColumnFlex>
//     </StyledTradeInterval>
//   );
// };

// export { TWAP };

export {};
