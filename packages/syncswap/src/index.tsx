/* eslint-disable import/no-extraneous-dependencies */
import {
  Components,
  Translations,
  TwapAdapter,
  useTwapContext,
  Styles as TwapStyles,
  hooks,
  TWAPProps,
  REFETCH_GAS_PRICE,
  amountBN,
  Configs,
  Token,
  Styles,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { createContext, useCallback, useContext, useMemo } from "react";
import Web3 from "web3";
import {
  configureStyles,
  StyledBalance,
  StyledChangeTokensOrder,
  StyledChunkSize,
  StyledPercentSelect,
  StyledPoweredBy,
  StyledSubmitButton,
  StyledTokenPanel,
  StyledTokenPanelInput,
  StyledTokenPanelUSD,
  StyledTokenSelect,
  StyledTradeSize,
} from "./styles";
import { eqIgnoreCase, isNativeAddress, network, zeroAddress } from "@defi.org/web3-candies";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { AiOutlineArrowDown } from "@react-icons/all-files/ai/AiOutlineArrowDown";
import { compact, isEmpty } from "@orbs-network/twap-ui";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SyncSwapPallete } from "./types";

interface SyncSwapProps extends TWAPProps {
  connect: () => void;
  themeOptions: SyncSwapPallete;
  openTokenSelectModal: (value?: any) => void;
  useGasPrice?: () => Promise<any>;
}

const config = Configs.SyncSwap;
const parseToken = (rawToken: any): Token | undefined => {
  if (!rawToken.symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  const isNative = rawToken.symbol === "ETH" || isNativeAddress(rawToken.address);

  if (!rawToken.address || isNative) {
    return network(config.chainId).native;
  }
  return {
    address: Web3.utils.toChecksumAddress(rawToken.address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: `https://tokens.syncswap.xyz/tokens/${rawToken.address}/logo.png`,
  };
};

const AdapterContext = createContext({} as SyncSwapProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const { openTokenSelectModal } = useAdapterContext();

  return (
    <>
      <StyledTokenPanel>
        <TwapStyles.StyledColumnFlex gap={16}>
          <TwapStyles.StyledColumnFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <StyledTokenPanelInput placeholder="0.0" isSrc={isSrcToken} />
              <TokenSelect isSrc={isSrcToken} onClick={() => openTokenSelectModal(isSrcToken ? 0 : 1)} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <StyledTokenPanelUSD isSrc={isSrcToken} />
              <StyledBalance isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
          {isSrcToken && <SrcTokenPercentSelector />}
        </TwapStyles.StyledColumnFlex>
      </StyledTokenPanel>
    </>
  );
};

export const TokenSelect = ({ onClick, isSrc }: { onClick: () => void; isSrc?: boolean }) => {
  const { translations, srcToken, dstToken } = useTwapContext();

  const token = isSrc ? srcToken : dstToken;

  return (
    <StyledTokenSelect onClick={onClick}>
      <TwapStyles.StyledRowFlex gap={5}>
        {token ? <Components.TokenLogoAndSymbol isSrc={isSrc} /> : <Styles.StyledOneLineText>{translations.selectToken}</Styles.StyledOneLineText>}
        <Components.Base.Icon icon={<IoIosArrowDown size={20} />} />
      </TwapStyles.StyledRowFlex>
    </StyledTokenSelect>
  );
};

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useOnSrcAmountPercent();

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelect>
      <button onClick={() => onClick(0.25)}>25%</button>
      <button onClick={() => onClick(0.5)}>50%</button>
      <button onClick={() => onClick(0.75)}>75%</button>
      <button onClick={() => onClick(1)}>100%</button>
    </StyledPercentSelect>
  );
};

interface Props extends SyncSwapProps {
  limit?: boolean;
  getProvider: () => any;
  isPlayground?: boolean;
  priceUsd?: any;
}

const useGasPriceQuery = (props: Props) => {
  return useQuery(
    ["useGasPriceQuerySynswap"],
    async () => {
      const res = await props.useGasPrice?.();
      return res?.toString() || "";
    },
    {
      refetchInterval: REFETCH_GAS_PRICE,
      enabled: !!props.useGasPrice,
    },
  );
};

const SYNCSWAP_ZERO_ADDRESS = "0x000000000000000000000000000000000000800a";

const Tooltip = () => {
  return <div></div>;
};

const Adapter = (props: Props) => {
  const palette = props.themeOptions;
  const provider = useMemo(() => props.getProvider(), [props.account]);
  const { data: gasPrice } = useGasPriceQuery(props);

  const globalStyles = configureStyles(palette);

  const connect = useCallback(() => {
    props.connect();
  }, []);

  // const theme = useMemo(() => {
  //   const args = {
  //     palette: {
  //       primary: {
  //         main: palette.primary,
  //       },
  //     },
  //     dappStyles: palette,
  //   };

  //   return createTheme(args);
  // }, [palette]);

  const priceUsd = useCallback(
    async (address: string, token?: Token) => {
      const _address = eqIgnoreCase(address, zeroAddress) ? SYNCSWAP_ZERO_ADDRESS : address;
      const result = await props.priceUsd(_address, amountBN(token, "1").toString());
      return Number(result);
    },
    [props.priceUsd],
  );

  const parsedTokens = useMemo((): Token[] => {
    if (isEmpty(props.dappTokens)) return [];
    const res = props.dappTokens.map((token: any) => {
      return parseToken(token);
    });

    return compact(res);
  }, [props.dappTokens]);

  return (
    <div className="adapter-wrapper">
      <TwapAdapter
        parsedTokens={parsedTokens}
        connect={connect}
        config={config}
        maxFeePerGas={gasPrice}
        priorityFeePerGas={"0"}
        translations={translations as Translations}
        provider={provider}
        account={props.account}
        dappTokens={props.dappTokens}
        onTxSubmitted={props.onTxSubmitted}
        isLimitPanel={props.limit}
        onSrcTokenSelected={props.onSrcTokenSelected}
        onDstTokenSelected={props.onDstTokenSelected}
        Components={{ Tooltip }}
      >
        {/* <GlobalStyles styles={globalStyles as any} /> */}
        <AdapterContextProvider value={props}>{props.limit ? <LimitPanel /> : <TWAPPanel />}</AdapterContextProvider>
      </TwapAdapter>
    </div>
  );
};

const queryClient = new QueryClient();

const TWAP = (props: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Adapter {...props} />
    </QueryClientProvider>
  );
};

const LimitPanel = () => {
  return (
    <div className="twap-container">
      <TwapStyles.StyledColumnFlex gap={16}>
        <TwapStyles.StyledColumnFlex gap={0}>
          <TokenPanel isSrcToken={true} />
          <ChangeTokensOrder />
          <TokenPanel />
        </TwapStyles.StyledColumnFlex>
      </TwapStyles.StyledColumnFlex>

      <PoweredBy />
    </div>
  );
};

const ChangeTokensOrder = () => {
  return <StyledChangeTokensOrder icon={<AiOutlineArrowDown />} />;
};

const SubmitButton = () => {
  const { disabled, loading, text, onClick } = hooks.useSubmitOrderButton();
  const _onClick = () => {
    if (onClick) return onClick();
    return () => {};
  };

  return (
    <StyledSubmitButton onClick={_onClick}>
      <div style={{ opacity: loading ? 0 : 1 }}>{text}</div>
      {loading && <Components.Base.Spinner />}
    </StyledSubmitButton>
  );
};

const TWAPPanel = () => {
  return (
    <div className="twap-container">
      <TwapStyles.StyledColumnFlex gap={16}>
        <TwapStyles.StyledColumnFlex gap={0}>
          <TokenPanel isSrcToken={true} />
          <ChangeTokensOrder />
          <TokenPanel />
        </TwapStyles.StyledColumnFlex>
        <TradeSize />
        <TradeInterval />
        <MaxDuration />
      </TwapStyles.StyledColumnFlex>

      <PoweredBy />
    </div>
  );
};

const PoweredBy = () => {
  return <StyledPoweredBy />;
};

const TradeSize = () => {
  return (
    <StyledTradeSize>
      <TwapStyles.StyledColumnFlex gap={5}>
        <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between" style={{ minHeight: 40 }}>
          <Components.Labels.TotalTradesLabel />
        </TwapStyles.StyledRowFlex>
        <StyledChunkSize>
          <Components.TradeSize />
          <Components.ChunksUSD />
        </StyledChunkSize>
      </TwapStyles.StyledColumnFlex>
    </StyledTradeSize>
  );
};

const MaxDuration = () => {
  return (
    <Components.Base.Card className="twap-max-duration-wrapper">
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TradeInterval = () => {
  return (
    <Components.Base.Card className="twap-trade-interval-wrapper">
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

export { TWAP };
