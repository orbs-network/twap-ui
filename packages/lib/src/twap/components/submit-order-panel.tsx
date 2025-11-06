import { Step, SwapFlow, SwapStatus } from "@orbs-network/swap-ui";
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useTwapContext } from "../../context/twap-context";
import { isNativeAddress, Module, ORBS_TWAP_FAQ_URL } from "@orbs-network/twap-sdk";
import { Steps, SubmitOrderPanelProps } from "../../types";
import { useTwapStore } from "../../useTwapStore";
import { useExplorerLink, useFormatNumber, useNetwork } from "../../hooks/helper-hooks";
import { useTrades } from "../../hooks/use-trades";
import { useSrcAmount } from "../../hooks/use-src-amount";
import { useDstTokenAmount } from "../../hooks/use-dst-amount";
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

const WrapMsg = () => {
  const t = useTranslations();
  const { srcToken } = useTwapStore((s) => s.state.swapExecution);
  const wSymbol = useNetwork()?.wToken?.symbol;

  if (!isNativeAddress(srcToken?.address || "")) {
    return null;
  }

  return <p className="twap-wrap-msg">{t("wrapMsg", { symbol: srcToken?.symbol || "", wSymbol: wSymbol || "" })}</p>;
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
  const status = useTwapStore((s) => s.state.swapExecution.status);
  const { totalTrades } = useTrades();
  const orderName = useOrderName(isMarketOrder, totalTrades);

  if (status === SwapStatus.SUCCESS) {
    return t("createOrderActionSuccess", { name: orderName });
  }

  return t("createOrderAction", { name: orderName });
};

const useStep = () => {
  const srcToken = useTwapStore((s) => s.state.swapExecution.srcToken);
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
      <WrapMsg />
    </div>
  );
};

function Failed({ error }: { error?: any }) {
  const { components } = useTwapContext();
  const t = useTranslations();
  const wrapTxHash = useTwapStore((s) => s.state.swapExecution?.wrapTxHash);
  const ErrorView = components.SubmitOrderErrorView;

  const content = <SwapFlow.Failed error={<TxError error={error} />} footerLink={ORBS_TWAP_FAQ_URL} footerText={t("viewOnExplorer")} />;

  if (ErrorView) {
    return (
      <ErrorView wrapTxHash={wrapTxHash} error={error}>
        {content}
      </ErrorView>
    );
  }

  return content;
}

const Main = () => {
  const { components } = useTwapContext();
  const srcToken = useTwapStore((s) => s.state.swapExecution.srcToken);
  const dstToken = useTwapStore((s) => s.state.swapExecution.dstToken);
  const { reviewDetails } = useSubmitOrderPanelContext();
  const t = useTranslations();
  const isSubmitted = useTwapStore((s) => Boolean(s.state.swapExecution?.status));
  const order = useCurrentOrderDetails();

  const inUsd = useFormatNumber({ value: order.srcAmountUsd, decimalScale: 2 });
  const outUsd = useFormatNumber({ value: order.dstAmountUsd, decimalScale: 2 });
  const USD = components.USD;
  const MainView = components.SubmitOrderMainView;

  const content = (
    <>
      <SwapFlow.Main
        fromTitle={t("from")}
        toTitle={t("to")}
        inUsd={USD ? <USD value={order.srcAmountUsd} isLoading={false} /> : `$${inUsd}`}
        outUsd={USD ? <USD value={order.dstAmountUsd} isLoading={false} /> : `$${outUsd}`}
      />
      {!isSubmitted && (
        <div className="twap-create-order-bottom">
          <OrderDetails.Container>
            <div className="twap-create-order-details">
              <OrderDetails.Deadline deadline={order.display.deadline.value} label={order.display.deadline.label} tooltip={order.display.deadline.tooltip || ""} />
              <OrderDetails.TriggerPrice
                price={order.display.triggerPricePerTrade.value}
                dstToken={dstToken}
                label={order.display.triggerPricePerTrade.label}
                tooltip={order.display.triggerPricePerTrade.tooltip || ""}
                usd={order.display.triggerPricePerTrade.usd}
              />
              <OrderDetails.MinDestAmount
                dstToken={dstToken}
                dstMinAmountOut={order.display.minDestAmountPerTrade.value}
                label={order.display.minDestAmountPerTrade.label}
                tooltip={order.display.minDestAmountPerTrade.tooltip || ""}
                usd={order.display.minDestAmountPerTrade.usd}
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
              {order.fee.value && <OrderDetails.Fees fees={order.fee.value} label={order.fee.label} usd={order.fee.usd} dstTokenSymbol={dstToken?.symbol} />}
            </div>
          </OrderDetails.Container>
          {reviewDetails}
        </div>
      )}
    </>
  );

  if (MainView) {
    return <MainView>{content}</MainView>;
  }

  return content;
};

const SubmitOrderPanel = (props: SubmitOrderPanelProps) => {
  const { status, stepIndex, totalSteps } = useTwapStore((s) => s.state.swapExecution);
  const { components } = useTwapContext();
  const Spinner = components.Spinner;
  const SuccessIcon = components.SuccessIcon;
  const ErrorIcon = components.ErrorIcon;
  const TokenLogo = components.TokenLogo;

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
  const { components } = useTwapContext();
  const newOrderId = useTwapStore((s) => s.state.newOrderId);
  const SuccessView = components.SubmitOrderSuccessView;

  const content = (
    <>
      <SwapFlow.Success title={successTitle} />
      <WrapMsg />
    </>
  );
  if (SuccessView) {
    return <SuccessView newOrderId={newOrderId}>{content}</SuccessView>;
  }
  return content;
};

export { SubmitOrderPanel };
