/* eslint-disable import/no-extraneous-dependencies */
import { Button, GlobalStyles, Typography } from "@mui/material";
import {
  Components,
  Translations,
  TwapAdapter,
  OrdersPanel,
  useTwapContext,
  Styles as TwapStyles,
  TWAPTokenSelectProps,
  hooks,
  TWAPProps,
  store,
  Orders,
} from "@orbs-network/twap-ui";
import translations from "./i18n/en.json";
import { Box } from "@mui/system";
import { createContext, memo, ReactNode, useCallback, useContext, useState } from "react";
import { Configs, TokenData } from "@orbs-network/twap";
import Web3 from "web3";
import {
  configureStyles,
  StyledBalance,
  StyledChangeTokensOrder,
  StyledChunkSize,
  StyledLimitPrice,
  StyledMarketPrice,
  StyledPercentSelect,
  StyledPoweredBy,
  StyledSubmitButton,
  StyledTokenPanel,
  StyledTokenPanelInput,
  StyledTokenPanelUSD,
  StyledTokenSelect,
} from "./styles";
import { isNativeAddress, zeroAddress } from "@defi.org/web3-candies";
import { SyncSwapPallete } from "./types";
import { StyledOneLineText } from "@orbs-network/twap-ui/dist/styles";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { AiOutlineArrowDown } from "@react-icons/all-files/ai/AiOutlineArrowDown";
import { TwapContextUIPreferences } from "@orbs-network/twap-ui";

const storeOverride = {
  isLimitOrder: true,
  chunks: 1,
  customDuration: { resolution: store.TimeResolution.Days, amount: 7 },
  customFillDelay: { resolution: store.TimeResolution.Minutes, amount: 2 },
};

const uiPreferences: TwapContextUIPreferences = {
  switchVariant: "default",
};

interface SyncSwapProps extends TWAPProps {
  connect: () => void;
  pallete: SyncSwapPallete;
}

const config = Configs.Lynex;

const parseToken = (rawToken: any): TokenData | undefined => {
  if (!rawToken.symbol) {
    console.error("Invalid token", rawToken);
    return;
  }
  const address = rawToken.address === "ETH" ? zeroAddress : rawToken.address;
  if (!address || isNativeAddress(address)) {
    return config.nativeToken;
  }
  return {
    address: Web3.utils.toChecksumAddress(address),
    decimals: rawToken.decimals,
    symbol: rawToken.symbol,
    logoUrl: rawToken.logoURI,
  };
};

const AdapterContext = createContext({} as SyncSwapProps);

const AdapterContextProvider = AdapterContext.Provider;

const useAdapterContext = () => useContext(AdapterContext);

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;

  return <TokenSelectModal tokenSelected={undefined} onCurrencySelect={props.onSelect} isOpen={props.isOpen} onDismiss={props.onClose} />;
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelectModal = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  return <Components.TokenSelectModal Component={memoizedTokenSelect} isOpen={open} onClose={onClose} isSrc={isSrcToken} />;
};

const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const pallete = useAdapterContext().pallete;

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelectModal onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />

      <StyledTokenPanel>
        <TwapStyles.StyledColumnFlex gap={16}>
          <TwapStyles.StyledColumnFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <StyledTokenPanelInput placeholder="0.0" isSrc={isSrcToken} pallete={pallete} />
              <TokenSelect isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            </TwapStyles.StyledRowFlex>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <StyledTokenPanelUSD pallete={pallete} isSrc={isSrcToken} />
              <StyledBalance pallete={pallete} isSrc={isSrcToken} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
          {isSrcToken && <SrcTokenPercentSelector />}
        </TwapStyles.StyledColumnFlex>
      </StyledTokenPanel>
    </>
  );
};

export const TokenSelect = ({ onClick, isSrc }: { onClick: () => void; isSrc?: boolean }) => {
  const { pallete } = useAdapterContext();
  const { srcToken, dstToken } = store.useTwapStore((state) => ({
    srcToken: state.srcToken,
    dstToken: state.dstToken,
  }));
  const translations = useTwapContext().translations;

  const token = isSrc ? srcToken : dstToken;

  return (
    <StyledTokenSelect pallete={pallete} onClick={onClick}>
      <TwapStyles.StyledRowFlex gap={5}>
        {token ? <Components.TokenLogoAndSymbol isSrc={isSrc} /> : <StyledOneLineText>{translations.selectToken}</StyledOneLineText>}
        <Components.Base.Icon icon={<IoIosArrowDown size={20} />} />
      </TwapStyles.StyledRowFlex>
    </StyledTokenSelect>
  );
};

const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions().onPercentClick;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelect>
      <Button fullWidth size="small" variant="outlined" onClick={() => onClick(0.25)}>
        25%
      </Button>
      <Button fullWidth size="small" variant="outlined" onClick={() => onClick(0.5)}>
        50%
      </Button>
      <Button fullWidth size="small" variant="outlined" onClick={() => onClick(0.75)}>
        75%
      </Button>
      <Button fullWidth size="small" variant="outlined" onClick={() => onClick(1)}>
        100%
      </Button>
    </StyledPercentSelect>
  );
};

const OrderSummary = ({ children }: { children: ReactNode }) => {
  return (
    <Components.OrderSummaryModalContainer>
      <TwapStyles.StyledColumnFlex gap={14}>
        <TwapStyles.StyledColumnFlex gap={14}>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay isSrc={true} />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay />
          </Components.Base.Card>
          <Components.OrderSummaryLimitPrice />
          <Components.Base.Card>{children}</Components.Base.Card>
          <Components.Base.Card>
            <TwapStyles.StyledColumnFlex gap={10}>
              <Components.DisclaimerText />
            </TwapStyles.StyledColumnFlex>
          </Components.Base.Card>
        </TwapStyles.StyledColumnFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={12}>
            <Components.AcceptDisclaimer />
            <Components.OutputAddress />
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
        <SubmitButton />
      </TwapStyles.StyledColumnFlex>
    </Components.OrderSummaryModalContainer>
  );
};

interface Props extends SyncSwapProps {
  limit?: boolean;
}

const TWAP = (props: Props) => {
  const globalStyles = configureStyles(props.pallete);

  const connect = useCallback(() => {
    props.connect();
  }, []);

  const priceUsd = useCallback(
    (address: string) => {
      if (address === zeroAddress) {
        address = "ETH";
      }
      return props.priceUsd!(address);
    },
    [props.priceUsd]
  );

  return (
    <Box className="adapter-wrapper">
      <TwapAdapter
        connect={connect}
        config={config}
        uiPreferences={uiPreferences}
        maxFeePerGas={props.maxFeePerGas}
        priorityFeePerGas={props.priorityFeePerGas}
        translations={translations as Translations}
        provider={props.provider}
        account={props.account}
        dappTokens={props.dappTokens}
        parseToken={parseToken}
        srcToken={props.srcToken}
        onTxSubmitted={props.onTxSubmitted}
        dstToken={props.dstToken}
        storeOverride={props.limit ? storeOverride : undefined}
        priceUsd={priceUsd}
      >
        <GlobalStyles styles={globalStyles as any} />
        <AdapterContextProvider value={props}>
          {props.limit ? <LimitPanel /> : <TWAPPanel />}
          <OrdersPanel />
        </AdapterContextProvider>
      </TwapAdapter>
    </Box>
  );
};

const Market = () => {
  const pallete = useAdapterContext().pallete;
  const { toggleInverted, leftToken, rightToken, marketPrice, loading } = hooks.useMarketPrice();
  return (
    <StyledMarketPrice pallete={pallete}>
      {loading ? (
        <Components.Base.Loader />
      ) : (
        <Button onClick={toggleInverted}>
          <Components.Base.TokenPriceCompare.LeftToken token={leftToken} />
          <Typography color={pallete.info}>=</Typography>
          <Components.Base.TokenPriceCompare.RightToken token={rightToken} price={marketPrice} />
        </Button>
      )}
    </StyledMarketPrice>
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
        <Market />
        <LimitPrice limit={true} />
        <SubmitButton isMain />
      </TwapStyles.StyledColumnFlex>
      <OrderSummary>
        <TwapStyles.StyledColumnFlex>
          <Components.OrderSummaryDetailsDeadline />
          <Components.OrderSummaryDetailsOrderType />
          <Components.OrderSummaryDetailsChunkSize />
          <Components.OrderSummaryDetailsMinDstAmount />
        </TwapStyles.StyledColumnFlex>
      </OrderSummary>
      <PoweredBy />
    </div>
  );
};

const ChangeTokensOrder = () => {
  const pallete = useAdapterContext().pallete;

  return <StyledChangeTokensOrder pallete={pallete} icon={<AiOutlineArrowDown />} />;
};

const SubmitButton = ({ isMain }: { isMain?: boolean }) => {
  const { loading, disabled, text, onClick } = hooks.useSubmitButton(isMain);

  const _onClick = () => {
    if (onClick) return onClick();
    return () => {};
  };

  return (
    <StyledSubmitButton variant={loading || disabled ? "outlined" : "contained"} fullWidth size="large" onClick={_onClick}>
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
        <Market />
        <LimitPrice />
        <TradeSize />
        <TradeInterval />
        <MaxDuration />
        <SubmitButton isMain />
      </TwapStyles.StyledColumnFlex>
      <OrderSummary>
        <Components.OrderSummaryDetails />
      </OrderSummary>
      <PoweredBy />
    </div>
  );
};


const PoweredBy  = () => {
  const {pallete} = useAdapterContext();

  return <StyledPoweredBy pallete={pallete} />;
}

const TradeSize = () => {
  const pallete = useAdapterContext().pallete;
  return (
    <Components.Base.Card className="twap-trade-size">
      <TwapStyles.StyledColumnFlex gap={5}>
        <TwapStyles.StyledRowFlex gap={15} justifyContent="space-between" style={{ minHeight: 40 }}>
          <Components.Labels.TotalTradesLabel />
          <Components.ChunksSliderSelect />
          <Components.ChunksInput />
        </TwapStyles.StyledRowFlex>
        <StyledChunkSize pallete={pallete}>
          <Components.TradeSize />
          <Components.ChunksUSD />
        </StyledChunkSize>
      </TwapStyles.StyledColumnFlex>
    </Components.Base.Card>
  );
};

const MaxDuration = () => {
  return (
    <Components.Base.Card className="twap-max-duration-wrapper">
      <TwapStyles.StyledRowFlex gap={10} justifyContent="space-between">
        <Components.Labels.MaxDurationLabel />
        <Components.PartialFillWarning />
        <Components.MaxDurationSelector />
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const TradeInterval = () => {
  return (
    <Components.Base.Card className="twap-trade-interval-wrapper">
      <TwapStyles.StyledRowFlex>
        <Components.Labels.TradeIntervalLabel />
        <Components.FillDelayWarning />
        <TwapStyles.StyledRowFlex style={{ flex: 1 }}>
          <Components.TradeIntervalSelector />
        </TwapStyles.StyledRowFlex>
      </TwapStyles.StyledRowFlex>
    </Components.Base.Card>
  );
};

const LimitPrice = ({ limit }: { limit?: boolean }) => {
  const isLimitOrder = store.useTwapStore((s) => s.isLimitOrder);
  const pallete = useAdapterContext().pallete;
  return (
    <>
      <Components.Base.Card className="twap-limit-price">
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <Components.Labels.LimitPriceLabel />
          {!limit && <Components.LimitPriceToggle />}
        </TwapStyles.StyledRowFlex>
      </Components.Base.Card>
      {isLimitOrder && (
        <StyledLimitPrice pallete={pallete}>
          <Components.LimitPriceInput placeholder="0" />
        </StyledLimitPrice>
      )}
    </>
  );
};

export { Orders, TWAP };
