import { Step, SwapFlow, SwapStatus } from "@orbs-network/swap-ui";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useTwapContext } from "../../context/twap-context";
import { isNativeAddress, Module, ORBS_TWAP_FAQ_URL } from "@orbs-network/twap-sdk";
import { Steps, SubmitOrderPanelProps } from "../../types";
import { useTwapStore } from "../../useTwapStore";
import { useExplorerLink, useNetwork } from "../../hooks/helper-hooks";
import { useTrades } from "../../hooks/use-trades";
import { useSrcAmount } from "../../hooks/use-src-amount";
import { useDstTokenAmount } from "../../hooks/use-dst-amount";
import { useFormatNumber } from "../../hooks/useFormatNumber";
import { OrderDetails } from "../../components/order-details";
import { useCurrentOrderDetails } from "../../hooks/use-current-order";
import { useTranslations } from "../../hooks/use-translations";

const Context = createContext({} as SubmitOrderPanelProps);

type Props = SubmitOrderPanelProps & {
  children: ReactNode;
};

export const SubmitOrderContextProvider = ({ children, ...rest }: Props) => {
  return <Context.Provider value={rest}>{children}</Context.Provider>;
};

export const useSubmitOrderPanelContext = () => {
  return useContext(Context);
};

const useOrderName = (isMarketOrder = false, chunks = 1) => {
  const { module } = useTwapContext();
  const t = useTranslations();
  return useMemo(() => {
    if (module === Module.STOP_LOSS) {
      return t("stopLoss");
    }
    if (module === Module.TAKE_PROFIT) {
      return t("takeProfit");
    }
    if (isMarketOrder) {
      return t("twapMarket");
    }
    if (chunks === 1) {
      return t("limit");
    }
    return t("twapLimit");
  }, [t, module, isMarketOrder, chunks]);
};

const useTitle = () => {
  const t = useTranslations();
  const isMarketOrder = useTwapStore((s) => s.state.isMarketOrder);
  const { totalTrades } = useTrades();
  const orderName = useOrderName(isMarketOrder, totalTrades);
  return t("createOrderAction", { name: orderName });
};

const useStep = () => {
  const { srcToken } = useTwapContext();
  const t = useTranslations();
  const { step, wrapTxHash, approveTxHash } = useTwapStore((s) => s.state.swapExecution);
  const network = useNetwork();
  const wrapExplorerUrl = useExplorerLink(wrapTxHash);
  const unwrapExplorerUrl = useExplorerLink(wrapTxHash);
  const approveExplorerUrl = useExplorerLink(approveTxHash);
  const status = useTwapStore((s) => s.state.swapExecution.status);
  const isNativeIn = isNativeAddress(srcToken?.address || "");
  const symbol = isNativeIn ? network?.native.symbol || "" : srcToken?.symbol || "";
  const wSymbol = network?.wToken.symbol;
  const swapTitle = useTitle();

  return useMemo((): Step | undefined => {
    if (step === Steps.WRAP) {
      return {
        title: t("wrapAction", { symbol: symbol }),
        footerLink: wrapExplorerUrl,
        footerText: wrapExplorerUrl ? t("viewOnExplorer") : t("proceedInWallet"),
      };
    }
    if (step === Steps.APPROVE) {
      return {
        title: t("approveAction", { symbol: symbol }),
        footerLink: approveExplorerUrl,
        footerText: approveExplorerUrl ? t("viewOnExplorer") : t("proceedInWallet"),
      };
    }
    return {
      title: swapTitle,
      footerText: status === SwapStatus.LOADING ? t("proceedInWallet") : undefined,
    };
  }, [step, approveExplorerUrl, symbol, swapTitle, t, wrapExplorerUrl, unwrapExplorerUrl, wSymbol, status]);
};

const TxError = ({ error }: { error?: any }) => {
  return (
    <div className="twap-failed-unwrap">
      <h2 className="twap-failed-unwrap-title">{error ? error : `Transaction failed`}</h2>
    </div>
  );
};

function Failed({ error }: { error?: any }) {
  const { ErrorView } = useSubmitOrderPanelContext();
  const t = useTranslations();
  if (ErrorView) {
    return ErrorView;
  }

  return <SwapFlow.Failed error={<TxError error={error} />} footerLink={ORBS_TWAP_FAQ_URL} footerText={t("viewOnExplorer")} />;
}

const Main = () => {
  const { srcToken, dstToken } = useTwapContext();
  const t = useTranslations();
  const isSubmitted = useTwapStore((s) => Boolean(s.state.swapExecution?.status));
  const order = useCurrentOrderDetails();

  const inUsd = useFormatNumber({ value: order.srcAmountUsd, decimalScale: 2 });
  const outUsd = useFormatNumber({ value: order.dstAmountUsd, decimalScale: 2 });
  const { Tooltip, USD, reviewDetails, MainView } = useSubmitOrderPanelContext();
  if (MainView) {
    return MainView;
  }

  return (
    <>
      <SwapFlow.Main
        fromTitle={t("from")}
        toTitle={t("to")}
        inUsd={USD ? <USD value={order.srcAmountUsd} isLoading={false} /> : `$${inUsd}`}
        outUsd={USD ? <USD value={order.dstAmountUsd} isLoading={false} /> : `$${outUsd}`}
      />
      {!isSubmitted && (
        <div className="twap-create-order-bottom">
          <OrderDetails.Container Tooltip={Tooltip}>
            <div className="twap-create-order-details">
              <OrderDetails.DetailRow title={order.tradePrice.label || ""}>
                1 {order.tradePrice.sellToken?.symbol} = {order.tradePrice.value} {order.tradePrice.buyToken?.symbol}
              </OrderDetails.DetailRow>
              <OrderDetails.Deadline deadline={order.display.deadline.value} label={order.display.deadline.label} tooltip={order.display.deadline.tooltip || ""} />
              <OrderDetails.TriggerPrice
                price={order.display.triggerPricePerTrade.value}
                dstToken={dstToken}
                label={order.display.triggerPricePerTrade.label}
                tooltip={order.display.triggerPricePerTrade.tooltip || ""}
              />
              <OrderDetails.MinDestAmount
                dstToken={dstToken}
                dstMinAmountOut={order.display.minDestAmountPerTrade.value}
                label={order.display.minDestAmountPerTrade.label}
                tooltip={order.display.minDestAmountPerTrade.tooltip || ""}
              />
              <OrderDetails.TradeSize
                tradeSize={order.display.tradeSize.value}
                trades={order.display.totalTrades.value}
                srcToken={srcToken}
                label={order.display.tradeSize.label}
                tooltip={order.display.tradeSize.tooltip}
              />
              <OrderDetails.TradesAmount trades={order.display.totalTrades.value} label={order.display.totalTrades.label} tooltip={order.display.totalTrades.tooltip} />
              <OrderDetails.TradeInterval
                chunks={order.display.totalTrades.value}
                fillDelayMillis={order.display.tradeInterval.value}
                label={order.display.tradeInterval.label}
                tooltip={order.display.tradeInterval.tooltip}
              />
              <OrderDetails.Recipient />
              {order.fee.value && <OrderDetails.DetailRow title={order.fee.label}>{order.fee.value ? `${order.fee.value} ${dstToken?.symbol}` : ""}</OrderDetails.DetailRow>}
            </div>
          </OrderDetails.Container>
          {reviewDetails}
        </div>
      )}
    </>
  );
};

const SubmitOrderPanel = (props: SubmitOrderPanelProps) => {
  const { status, stepIndex, totalSteps } = useTwapStore((s) => s.state.swapExecution);
  const { Spinner, SuccessIcon, ErrorIcon } = props;
  const { TokenLogo } = props;

  const { srcToken, dstToken } = useTwapContext();
  const srcAmount = useSrcAmount().amountUI;
  const dstAmount = useDstTokenAmount().amountUI;
  const srcAmountF = useFormatNumber({ value: srcAmount, decimalScale: 2 });
  const outAmountF = useFormatNumber({ value: dstAmount, decimalScale: 2 });

  const inToken = useMemo(() => {
    return {
      symbol: srcToken?.symbol,
      logoUrl: srcToken?.logoUrl,
    };
  }, [srcToken]);
  const outToken = useMemo(() => {
    return {
      symbol: dstToken?.symbol,
      logoUrl: dstToken?.logoUrl,
    };
  }, [dstToken]);

  return (
    <SubmitOrderContextProvider {...props}>
      <SwapFlow
        inAmount={srcAmountF}
        outAmount={outAmountF}
        swapStatus={status}
        totalSteps={totalSteps}
        currentStep={useStep()}
        currentStepIndex={stepIndex}
        inToken={inToken}
        outToken={outToken}
        components={{
          SrcTokenLogo: TokenLogo && <TokenLogo token={srcToken} />,
          DstTokenLogo: TokenLogo && <TokenLogo token={dstToken} />,
          Failed: <Failed />,
          Success: <SuccessContent />,
          Main: <Main />,
          Loader: Spinner,
          SuccessIcon: SuccessIcon,
          FailedIcon: ErrorIcon,
        }}
      />
    </SubmitOrderContextProvider>
  );
};

const SuccessContent = () => {
  const successTitle = useTitle();
  const t = useTranslations();
  const { SuccessView } = useSubmitOrderPanelContext();

  if (SuccessView) {
    return SuccessView;
  }
  return <SwapFlow.Success title={successTitle} footerText={t("orderCreatedSuccessfully")} />;
};

export { SubmitOrderPanel };
