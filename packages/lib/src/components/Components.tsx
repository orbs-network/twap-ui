import { FC, ReactNode, useCallback } from "react";
import {
  Balance,
  Button,
  Icon,
  IconButton,
  NumericInput,
  Slider,
  Switch,
  TimeSelector,
  TokenName,
  TokenPriceCompare,
  Tooltip,
  USD,
  TokenLogo as Logo,
  Label,
  NumberDisplay,
  SwipeContainer,
  Modal,
} from "./base";
import { HiOutlineSwitchVertical } from "react-icons/hi";
import { IoIosArrowDown } from "react-icons/io";
import { TokenData } from "@orbs-network/twap";
import { TbArrowsRightLeft } from "react-icons/tb";
import { styled } from "@mui/system";
import { AiOutlineWarning } from "react-icons/ai";
import { useOrdersContext, useTwapContext } from "../context";
import { useLoadingState, useLimitPrice, useMarketPrice, useCreateOrder, useApproveToken, useChangeNetwork, useHasAllowanceQuery, useUnwrapToken, useWrapToken } from "../hooks";
import { useTwapStore, handleFillDelayText } from "../store";
import { StyledText, StyledRowFlex, StyledColumnFlex, StyledOneLineText, StyledOverflowContainer } from "../styles";
import TokenDisplay from "./base/TokenDisplay";
import TokenSelectButton from "./base/TokenSelectButton";
import {
  OrderSummaryDeadlineLabel,
  OrderSummaryOrderTypeLabel,
  OrderSummaryChunkSizeLabel,
  OrderSummaryTotalChunksLabel,
  OrderSummaryTradeIntervalLabel,
  OrderSummaryMinDstAmountOutLabel,
} from "./Labels";
import { TWAPTokenSelectProps } from "../types";
import { analytics } from "../analytics";
const ODNP = require("@open-defi-notification-protocol/widget"); // eslint-disable-line

const odnp = new ODNP();
odnp.init();
odnp.hide();

odnp.mainDiv.classList = "odnp";
export function OdnpButton({ className = "" }: { className?: string }) {
  const account = useTwapStore((state) => state.lib)?.maker;
  const translations = useOrdersContext().translations;
  if (!account) return null;

  const onClick = () => {
    analytics.onODNPClick();
    odnp.show(account, "twap");
  };
  return (
    <StyledOdnpButton className={`twap-odnp ${className}`} onClick={onClick}>
      <img src="https://open-defi-notifications.web.app/widget/assets/icon.png" />
      <StyledOneLineText>{translations.notify}</StyledOneLineText>
    </StyledOdnpButton>
  );
}

export function ChunksInput() {
  const translations = useTwapContext().translations;
  const chunks = useTwapStore((store) => store.getChunks());
  const maxPossibleChunks = useTwapStore((store) => store.getMaxPossibleChunks());
  const setChunks = useTwapStore((store) => store.setChunks);
  const getChunksBiggerThanOne = useTwapStore((store) => store.getChunksBiggerThanOne());
  if (!getChunksBiggerThanOne) {
    return <StyledText>{chunks || "-"}</StyledText>;
  }
  return (
    <Tooltip text={translations.sliderMinSizeTooltip}>
      <StyledChunksInput placeholder="0" value={chunks} decimalScale={0} maxValue={maxPossibleChunks.toString()} onChange={(value) => setChunks(Number(value))} />
    </Tooltip>
  );
}

export function ChunksSliderSelect() {
  const getChunksBiggerThanOne = useTwapStore((store) => store.getChunksBiggerThanOne());

  const maxPossibleChunks = useTwapStore((store) => store.getMaxPossibleChunks());
  const chunks = useTwapStore((store) => store.getChunks());
  const setChunks = useTwapStore((store) => store.setChunks);

  if (!getChunksBiggerThanOne) return null;
  return <StyledChunksSliderSelect maxTrades={maxPossibleChunks} value={chunks} onChange={setChunks} />;
}

export const ChangeTokensOrder = ({ children }: { children?: ReactNode }) => {
  const switchTokens = useTwapStore((state) => state.switchTokens);
  return (
    <StyledRowFlex className="twap-change-tokens-order">
      <IconButton onClick={switchTokens}>{children || <Icon icon={<HiOutlineSwitchVertical />} />}</IconButton>
    </StyledRowFlex>
  );
};

export function MaxDurationSelector() {
  const duration = useTwapStore((store) => store.duration);
  const onChange = useTwapStore((store) => store.setDuration);

  return <TimeSelector value={duration} onChange={onChange} />;
}

export const TokenInput = ({ isSrc, placeholder }: { isSrc?: boolean; placeholder?: string }) => {
  // src
  const srcDecimals = useTwapStore((store) => store.srcToken?.decimals);
  const srcUsdLoading = useLoadingState().srcUsdLoading;
  const srcAmount = useTwapStore((store) => store.srcAmountUi);
  const setSrcAmountUi = useTwapStore((store) => store.setSrcAmountUi);
  const srcInputLoading = (!!srcAmount || srcAmount !== "0") && srcUsdLoading;
  // dst
  const dstDecimals = useTwapStore((store) => store.dstToken?.decimals);
  const dstUsdLoading = useLoadingState().dstUsdLoading;
  const dstAmount = useTwapStore((store) => store.getDstAmountUi());
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const dstInputLoading = (!!dstAmount || dstAmount !== "0") && dstUsdLoading;

  return (
    <NumericInput
      className="twap-token-input"
      decimalScale={isSrc ? srcDecimals : dstDecimals}
      prefix={isSrc ? "" : isLimitOrder ? "≥" : "~"}
      loading={isSrc ? srcInputLoading : dstInputLoading}
      disabled={!isSrc}
      placeholder={placeholder || "0.0"}
      onChange={isSrc ? setSrcAmountUi : () => {}}
      value={isSrc ? srcAmount : dstAmount}
    />
  );
};

export const TokenLogo = ({ isSrc }: { isSrc?: boolean }) => {
  const srcTokenLogo = useTwapStore((store) => store.srcToken);
  const dstTokenLogo = useTwapStore((store) => store.dstToken);

  if (isSrc) {
    return <Logo logo={srcTokenLogo?.logoUrl} />;
  }
  return <Logo logo={dstTokenLogo?.logoUrl} />;
};

export function TokenLogoAndSymbol({ isSrc, reverse }: { isSrc?: boolean; reverse?: boolean }) {
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);
  const token = isSrc ? srcToken : dstToken;
  return <TokenDisplay reverse={reverse} logo={token?.logoUrl} symbol={token?.symbol} />;
}

export const TokenSelect = ({ onClick, isSrc, hideArrow }: { onClick: () => void; isSrc?: boolean; hideArrow?: boolean }) => {
  const srcToken = useTwapStore((state) => state.srcToken);
  const dstToken = useTwapStore((state) => state.dstToken);

  const token = isSrc ? srcToken : dstToken;

  if (token) {
    return (
      <StyledRowFlex gap={5} style={{ cursor: "pointer" }} width="fit-content" onClick={onClick} className="twap-token-select twap-token-selected">
        <TokenLogoAndSymbol isSrc={isSrc} />
        {!hideArrow && <Icon icon={<IoIosArrowDown size={20} />} />}
      </StyledRowFlex>
    );
  }
  return <TokenSelectButton hideArrow={hideArrow} className="twap-token-not-selected" onClick={onClick} />;
};

export const TokenSymbol = ({ isSrc }: { isSrc?: boolean }) => {
  const srcToken = useTwapStore((store) => store.srcToken);
  const dstToken = useTwapStore((store) => store.dstToken);
  const token = isSrc ? srcToken : dstToken;

  return <TokenName name={token?.symbol} />;
};

export function TradeIntervalSelector() {
  const setFillDelay = useTwapStore((store) => store.setFillDelay);
  const fillDelay = useTwapStore((store) => store.getFillDelayUi());

  return <TimeSelector onChange={setFillDelay} value={fillDelay} />;
}

interface TokenSelectProps extends TWAPTokenSelectProps {
  Component?: FC<TWAPTokenSelectProps>;
  onSrcSelect?: (token: any) => void;
  onDstSelect?: (token: any) => void;
  isOpen: boolean;
  onClose: () => void;
  isSrc?: boolean;
  parseToken?: (value: any) => TokenData | undefined;
}

export const TokenSelectModal = ({ Component, isOpen, onClose, parseToken, onSrcSelect, onDstSelect, isSrc }: TokenSelectProps) => {
  const setSrcToken = useTwapStore((store) => store.setSrcToken);
  const setDstToken = useTwapStore((store) => store.setDstToken);

  const onTokenSelected = useCallback(
    (token: any) => {
      onClose();
      const parsedToken = parseToken ? parseToken(token) : token;
      if (isSrc) {
        setSrcToken(parsedToken);
        onSrcSelect?.(token);
      } else {
        setDstToken(parsedToken);
        onDstSelect?.(token);
      }
    },
    [onDstSelect, onSrcSelect, isSrc]
  );

  if (!isOpen || !Component) return null;
  return <Component isOpen={true} onClose={onClose} onSelect={onTokenSelected} srcTokenSelected={undefined} dstTokenSelected={undefined} />;
};

export function LimitPriceToggle() {
  const loadingState = useLoadingState();
  const isLoading = loadingState.srcUsdLoading && loadingState.dstUsdLoading;
  const translations = useTwapContext().translations;
  const { leftToken, rightToken } = useTwapStore((state) => state.getLimitPrice(false));
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const toggleLimit = useTwapStore((store) => store.toggleLimitOrder);
  const selectTokensWarning = !leftToken || !rightToken;

  return (
    <Tooltip text={isLoading ? `${translations.loading}...` : selectTokensWarning ? translations.selectTokens : ""}>
      <Switch disabled={!!selectTokensWarning || isLoading} value={isLimitOrder} onChange={toggleLimit} />
    </Tooltip>
  );
}

export function ChunksUSD() {
  const usd = useTwapStore((state) => state.getSrcChunkAmountUsdUi());
  const loading = useLoadingState().srcUsdLoading;

  return <USD value={usd} isLoading={loading} />;
}

export const TokenBalance = ({ isSrc, label }: { isSrc?: boolean; label?: string }) => {
  const srcBalance = useTwapStore((state) => state.getSrcBalanceUi());
  const srcLoading = useLoadingState().srcBalanceLoading;
  const dstBalance = useTwapStore((state) => state.getDstBalanceUi());
  const dstLoading = useLoadingState().dstBalanceLoading;
  const balance = isSrc ? srcBalance : dstBalance;
  const isLoading = isSrc ? srcLoading : dstLoading;
  return <Balance label={label} value={balance} isLoading={isLoading} />;
};

export function TokenUSD({ isSrc }: { isSrc?: boolean }) {
  const srcUSD = useTwapStore((state) => state.getSrcAmountUsdUi());
  const srcLoading = useLoadingState().srcUsdLoading;
  const dstUSD = useTwapStore((state) => state.getDstAmountUsdUi());
  const dstLoading = useLoadingState().dstUsdLoading;
  const usd = isSrc ? srcUSD : dstUSD;
  const isLoading = isSrc ? srcLoading : dstLoading;

  return <USD value={usd || "0"} isLoading={isLoading} />;
}

export const SubmitButton = ({ className = "" }: { className?: string }) => {
  const translations = useTwapContext().translations;
  const shouldUnwrap = useTwapStore((store) => store.shouldUnwrap());
  const shouldWrap = useTwapStore((store) => store.shouldWrap());
  const wrongNetwork = useTwapStore((store) => store.wrongNetwork);
  const maker = useTwapStore((store) => store.lib?.maker);
  const disclaimerAccepted = useTwapStore((state) => state.disclaimerAccepted);
  const setShowConfirmation = useTwapStore((state) => state.setShowConfirmation);
  const showConfirmation = useTwapStore((state) => state.showConfirmation);
  const warning = useTwapStore((state) => state.getFillWarning(translations));
  const createOrderLoading = useTwapStore((state) => state.loading);
  const { srcUsdLoading, dstUsdLoading } = useLoadingState();

  const { mutate: approve, isLoading: approveLoading } = useApproveToken();
  const { mutate: createOrder } = useCreateOrder();
  const allowance = useHasAllowanceQuery();
  const { mutate: unwrap, isLoading: unwrapLoading } = useUnwrapToken();
  const { mutate: wrap, isLoading: wrapLoading } = useWrapToken();
  const connect = useTwapContext().connect;

  const { loading: changeNetworkLoading, changeNetwork } = useChangeNetwork();

  const getArgs = () => {
    if (wrongNetwork)
      return {
        text: translations.switchNetwork,
        onClick: changeNetwork,
        loading: changeNetworkLoading,
        disabled: changeNetworkLoading,
      };
    if (!maker)
      return {
        text: translations.connect,
        onClick: connect ? connect : undefined,
        loading: false,
        disabled: false,
      };
    if (warning)
      return {
        text: warning,
        onClick: undefined,
        disabled: true,
        loading: false,
      };
    if (shouldUnwrap)
      return {
        text: translations.unwrap,
        onClick: unwrap,
        loading: unwrapLoading,
        disabled: unwrapLoading,
      };
    if (shouldWrap)
      return {
        text: translations.wrap,
        onClick: wrap,
        loading: wrapLoading,
        disabled: wrapLoading,
      };
    if (createOrderLoading) {
      return { text: "", onClick: () => setShowConfirmation(true), loading: true, disabled: showConfirmation };
    }
    if (allowance.isLoading || srcUsdLoading || dstUsdLoading) {
      return { text: "", onClick: undefined, loading: true, disabled: true };
    }
    if (allowance.data === false)
      return {
        text: translations.approve,
        onClick: approve,
        loading: approveLoading,
        disabled: approveLoading,
      };
    if (showConfirmation)
      return {
        text: translations.confirmOrder,
        onClick: createOrder,
        loading: createOrderLoading,
        disabled: !disclaimerAccepted || createOrderLoading,
      };
    return {
      text: translations.placeOrder,
      onClick: () => setShowConfirmation(true),
      loading: false,
      disabled: false,
    };
  };

  const args = getArgs();

  return (
    <Button className={`twap-submit ${className}`} loading={args.loading} onClick={args.onClick || (() => {})} disabled={args.disabled}>
      {args.text}
    </Button>
  );
};

export function LimitPriceInput({ placeholder = "0.00" }: { placeholder?: string }) {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const { leftToken, rightToken, onChange, limitPrice, toggleInverted } = useLimitPrice();

  if (!isLimitOrder) return null;
  return (
    <StyledLimitPriceInput className="twap-limit-price-input">
      <StyledRowFlex gap={10} style={{ paddingLeft: 5 }} width="fit-content">
        <StyledText>1</StyledText>
        <TokenDisplay symbol={leftToken?.symbol} logo={leftToken?.logoUrl} />
        <StyledText>=</StyledText>
      </StyledRowFlex>
      <NumericInput placeholder={placeholder} onChange={onChange} value={limitPrice} />
      <StyledRowFlex gap={10} width="fit-content">
        <TokenDisplay symbol={rightToken?.symbol} logo={rightToken?.logoUrl} />
        <IconButton onClick={toggleInverted} icon={<TbArrowsRightLeft style={{ width: 20, height: 20 }} />}></IconButton>
      </StyledRowFlex>
    </StyledLimitPriceInput>
  );
}

export const MarketPrice = () => {
  const { toggleInverted, leftToken, rightToken, marketPrice, loading } = useMarketPrice();
  const translations = useTwapContext().translations;
  return (
    <StyledMarketPrice justifyContent="space-between" className="twap-market-price">
      <StyledText className="title">{translations.currentMarketPrice}</StyledText>
      <TokenPriceCompare loading={loading} leftToken={leftToken} rightToken={rightToken} price={marketPrice} toggleInverted={toggleInverted} />
    </StyledMarketPrice>
  );
};

const StyledMarketPrice = styled(StyledRowFlex)({
  ".twap-token-logo": {
    minWidth: 22,
    minHeight: 22,
  },
});

export function PoweredBy() {
  const translations = useTwapContext().translations;
  return (
    <StyledPoweredBy className="twap-powered-by">
      <a href="https://www.orbs.com/" target="_blank">
        <StyledText>{translations.poweredBy}</StyledText>

        <img src="https://www.orbs.com/assets/img/common/logo.svg" />
      </a>
    </StyledPoweredBy>
  );
}

// --- warnings --- //

const Warning = ({ tootlip, warning }: { tootlip: string; warning: string }) => {
  return (
    <Tooltip text={tootlip}>
      <StyledWarning justifyContent="flex-start" gap={5} className="twap-warning">
        <StyledText>{warning}</StyledText>
        <AiOutlineWarning />
      </StyledWarning>
    </Tooltip>
  );
};

export const PartialFillWarning = () => {
  const translations = useTwapContext().translations;
  const isWarning = useTwapStore((state) => state.getIsPartialFillWarning());
  if (!isWarning) return null;

  return <Warning tootlip={translations.prtialFillWarningTooltip} warning={translations.prtialFillWarning} />;
};

export const FillDelayWarning = () => {
  const translations = useTwapContext().translations;
  const fillDelayWarning = useTwapStore((store) => store.getFillDelayWarning());
  const minimumDelayMinutes = useTwapStore((store) => store.getMinimumDelayMinutes());
  if (!fillDelayWarning) return null;

  return <Warning tootlip={handleFillDelayText(translations.fillDelayWarningTooltip, minimumDelayMinutes)} warning={translations.invalid} />;
};

/// --- order summary ---- ///

export function TotalChunks() {
  const value = useTwapStore((store) => store.getChunks());

  return (
    <StyledOneLineText>
      <NumberDisplay value={value} />
    </StyledOneLineText>
  );
}

export function ChunksAmount() {
  const value = useTwapStore((store) => store.getSrcChunkAmountUi());
  if (!value) return null;
  return (
    <StyledOneLineText className="twap-chunks-amount">
      <NumberDisplay value={value} />
    </StyledOneLineText>
  );
}

export const Deadline = () => {
  const deadline = useTwapStore((store) => store.getDeadlineUi());
  return <StyledOneLineText>{deadline}</StyledOneLineText>;
};

export const OrderType = () => {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const translations = useTwapContext().translations;
  return <StyledOneLineText>{isLimitOrder ? translations.limitOrder : translations.marketOrder}</StyledOneLineText>;
};

export const TradeIntervalAsText = () => {
  const getFillDelayText = useTwapStore((store) => store.getFillDelayText);
  const translations = useTwapContext().translations;

  return <StyledOneLineText>{getFillDelayText(translations)}</StyledOneLineText>;
};

export const MinDstAmountOut = () => {
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const translations = useTwapContext().translations;
  const dstMinAmountOutUi = useTwapStore((store) => store.getDstMinAmountOutUi());

  if (!isLimitOrder) {
    return <StyledOneLineText>{translations.none}</StyledOneLineText>;
  }

  return (
    <StyledOneLineText>
      <NumberDisplay value={dstMinAmountOutUi} />
    </StyledOneLineText>
  );
};

const orderSummaryDetailsComponent = [
  {
    label: <OrderSummaryDeadlineLabel />,
    component: <Deadline />,
  },
  {
    label: <OrderSummaryOrderTypeLabel />,
    component: <OrderType />,
  },
  {
    label: <OrderSummaryChunkSizeLabel />,
    component: (
      <>
        <TokenLogoAndSymbol isSrc={true} reverse={true} />
        <ChunksAmount />
      </>
    ),
  },
  {
    label: <OrderSummaryTotalChunksLabel />,
    component: <TotalChunks />,
  },
  {
    label: <OrderSummaryTradeIntervalLabel />,
    component: <TradeIntervalAsText />,
  },
  {
    label: <OrderSummaryMinDstAmountOutLabel />,
    component: (
      <>
        <TokenLogoAndSymbol isSrc={false} reverse={true} />
        <MinDstAmountOut />
      </>
    ),
  },
];

export const OrderSummaryDetails = ({ className = "" }: { className?: string }) => {
  return (
    <StyledSummaryDetails className={`twap-order-summary-details ${className}`}>
      {orderSummaryDetailsComponent.map((details, index) => {
        return (
          <StyledSummaryRow key={index} className="twap-order-summary-details-item">
            {details.label}
            <StyledSummaryRowRight>{details.component}</StyledSummaryRowRight>
          </StyledSummaryRow>
        );
      })}
    </StyledSummaryDetails>
  );
};

export function OrderSummarySwipeContainer({ children }: { children: ReactNode }) {
  const showConfirmation = useTwapStore((store) => store.showConfirmation);
  const setShowConfirmation = useTwapStore((store) => store.setShowConfirmation);
  return (
    <SwipeContainer show={showConfirmation} close={() => setShowConfirmation(false)}>
      {children}
    </SwipeContainer>
  );
}

export function OrderSummaryModalContainer({ children }: { children: ReactNode }) {
  const showConfirmation = useTwapStore((store) => store.showConfirmation);
  const setShowConfirmation = useTwapStore((store) => store.setShowConfirmation);
  return (
    <Modal open={showConfirmation} onClose={() => setShowConfirmation(false)}>
      {children}
    </Modal>
  );
}

export const OrderSummaryTokenDisplay = ({ isSrc }: { isSrc?: boolean }) => {
  const translations = useTwapContext().translations;
  const isLimitOrder = useTwapStore((store) => store.isLimitOrder);
  const srcAmount = useTwapStore((store) => store.srcAmountUi);
  const dstAmount = useTwapStore((store) => store.getDstAmountUi());

  const amount = isSrc ? srcAmount : dstAmount;
  const prefix = isSrc ? "" : isLimitOrder ? "≥ " : "~ ";

  return (
    <StyledOrderSummaryTokenDisplay className="twap-orders-summary-token-display">
      <StyledRowFlex className="twap-orders-summary-token-display-flex">
        <StyledText>{isSrc ? translations.from : translations.to}</StyledText>
        <TokenUSD isSrc={isSrc} />
      </StyledRowFlex>
      <StyledRowFlex className="twap-orders-summary-token-display-flex">
        <TokenLogoAndSymbol isSrc={isSrc} />
        <StyledRowFlex className="twap-orders-summary-token-display-amount">
          {prefix && <StyledText> {prefix}</StyledText>}
          <StyledOneLineText>{amount}</StyledOneLineText>
        </StyledRowFlex>
      </StyledRowFlex>
    </StyledOrderSummaryTokenDisplay>
  );
};

export const AcceptDisclaimer = () => {
  const translations = useTwapContext().translations;

  const setDisclaimerAccepted = useTwapStore((store) => store.setDisclaimerAccepted);
  const disclaimerAccepted = useTwapStore((store) => store.disclaimerAccepted);

  return (
    <StyledRowFlex gap={5} justifyContent="flex-start" className="twap-disclaimer-switch">
      <StyledText>{translations.acceptDisclaimer}</StyledText>
      <Switch value={disclaimerAccepted} onChange={() => setDisclaimerAccepted(!disclaimerAccepted)} />
    </StyledRowFlex>
  );
};

export const OutputAddress = () => {
  const maker = useTwapStore((store) => store.lib?.maker);
  const translations = useTwapContext().translations;

  return (
    <StyledOutputAddress className="twap-order-summary-output-address">
      <StyledText style={{ textAlign: "center", width: "100%" }}>{translations.outputWillBeSentTo}</StyledText>
      <Tooltip childrenStyles={{ width: "100%" }} text={maker}>
        <StyledOneLineText style={{ textAlign: "center", width: "100%" }}>{maker}</StyledOneLineText>
      </Tooltip>
    </StyledOutputAddress>
  );
};

const StyledOutputAddress = styled(StyledColumnFlex)({});

export const OrderSummaryLimitPriceToggle = () => {
  const { isLimitOrder, toggleInverted, limitPrice, leftToken, rightToken } = useLimitPrice();
  const translations = useTwapContext().translations;

  return isLimitOrder ? (
    <TokenPriceCompare leftToken={leftToken} rightToken={rightToken} price={limitPrice} toggleInverted={toggleInverted} />
  ) : (
    <StyledText>{translations.none}</StyledText>
  );
};

export const OrderSummaryLimitPrice = () => {
  const translations = useTwapContext().translations;

  return (
    <StyledRowFlex className="twap-order-summary-limit-price" justifyContent="space-between">
      <Label tooltipText={translations.confirmationLimitPriceTooltip}>{translations.limitPrice}</Label>
      <OrderSummaryLimitPriceToggle />
    </StyledRowFlex>
  );
};

export const DisclaimerText = () => {
  const translations = useTwapContext().translations;
  const lib = useTwapStore((state) => state.lib);
  return (
    <StyledTradeInfoExplanation className="twap-disclaimer-text">
      <StyledText>{translations.disclaimer1}</StyledText>
      <StyledText>{translations.disclaimer2}</StyledText>
      <StyledText>{translations.disclaimer3}</StyledText>
      <StyledText>{translations.disclaimer4}</StyledText>
      <StyledText>{translations.disclaimer5.replace("{{dex}}", lib?.config.partner || "DEX")}</StyledText>

      <StyledText>
        {translations.disclaimer6}{" "}
        <a href="https://github.com/orbs-network/twap" target="_blank">
          {translations.link}
        </a>
        . {translations.disclaimer7}{" "}
        <a href="https://github.com/orbs-network/twap/blob/master/TOS.md" target="_blank">
          {translations.link}
        </a>
        .
      </StyledText>
    </StyledTradeInfoExplanation>
  );
};

//---- styles -----//

const StyledWarning = styled(StyledRowFlex)({
  p: {
    fontSize: 14,
    color: "#dc3545",
  },
  "& *": {
    fill: "#dc3545",
  },
});

const StyledLimitPriceInput = styled(StyledRowFlex)({
  paddingLeft: 10,
  "& .twap-input": {
    flex: 1,
    "& input": {
      fontSize: 16,
      textAlign: "center",
    },
  },
  ".twap-token-logo": {
    width: 24,
    height: 24,
  },
  "& .twap-token-name": {
    fontSize: 15,
  },
});

const StyledChunksInput = styled(NumericInput)({
  width: 70,
  height: 35,
  input: {
    fontSize: 16,
    textAlign: "center",
    width: "100%",
    transition: "0.2s all",
  },
});

const StyledChunksSliderSelect = styled(Slider)({
  flex: 1,
  width: "auto",
  marginLeft: 30,
});

const StyledTradeInfoExplanation = styled(StyledColumnFlex)({
  maxHeight: 140,
  overflow: "auto",
  gap: 10,
  "*": {
    fontSize: 16,
  },
});

const StyledOrderSummaryTokenDisplay = styled(StyledColumnFlex)({
  ".twap-token-logo": {},
  ".twap-token-name": {
    fontSize: 16,
  },
  ".twap-orders-summary-token-display-amount": {
    fontSize: 19,
    justifyContent: "flex-end",
    width: "fit-content",
  },
  ".twap-orders-summary-token-display-flex": {
    justifyContent: "space-between",
  },
});

const StyledSummaryRowRight = styled(StyledOverflowContainer)({
  flex: 1,
  width: "unset",
  justifyContent: "flex-end",
  ".twap-token-logo": {
    width: 22,
    height: 22,
    minWidth: 22,
    minHeight: 22,
  },
});
const StyledSummaryDetails = styled(StyledColumnFlex)({
  gap: 15,
});

const StyledSummaryRow = styled(StyledRowFlex)({
  justifyContent: "space-between",
  width: "100%",
  ".twap-label": {
    minWidth: 150,
    flex: 1,
  },
});

const StyledPoweredBy = styled(StyledRowFlex)({
  marginTop: 10,
  marginBottom: 10,
  "& p": {
    fontSize: 15,
    color: "inherit",
  },
  "& a": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "unset",
    gap: 8,
  },
  "& img": {
    width: 24,
    height: 24,
    objectFit: "contain",
  },
});

const StyledOdnpButton = styled("button")({
  borderRadius: "4px",
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  padding: "0px 15px",
  cursor: "pointer",
  "& img": {
    width: 20,
  },
  "& p": {
    fontSize: 12,
    color: "inherit",
  },
});
