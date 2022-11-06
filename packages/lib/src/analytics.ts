import ReactGA from "react-ga4";
import { useQuery } from "react-query";
import { store, useWeb3 } from "./store/store";

export const useAnalyticsInit = (analyticsID?: string) => {
  const { account } = useWeb3();

  useQuery(
    ["setAnalyticsApiKey"],
    () => {
      ReactGA.initialize(analyticsID!);
    },
    { enabled: !!analyticsID }
  );

  useQuery(
    ["setAnalyticsUserId"],
    () => {
      ReactGA.set({ userId: account });
    },
    { enabled: !!account }
  );
};

type Category = "error" | "twap";

const useOnConfirmTxEvent = () => {
  const { config } = useWeb3();
  const {
    srcTokenInfo,
    dstTokenInfo,
    srcTokenAmount,
    tradeSize,
    minAmountOut,
    deadline,
    tradeIntervalMillis,
    srcTokenUiAmount,
    uiTradeSize,
    minAmountOutUi,
    deadlineUi,
    tradeIntervalUi,
  } = store.useConfirmation();

  return () => {
    const data = {
      exchangeAddress: config.exchangeAddress,
      srcToken: srcTokenInfo?.address,
      dstToken: dstTokenInfo?.address,
      srcTokenAmount: srcTokenAmount?.toString(),
      srcTokenUiAmount,
      tradeSize: tradeSize?.toString(),
      uiTradeSize,
      minAmountOut: minAmountOut.toString(),
      minAmountOutUi,
      deadline: Math.round(deadline / 1000),
      deadlineUi,
      tradeInterval: Math.round(tradeIntervalMillis / 1000),
      tradeIntervalUi,
    };

    sendAnalyticsEvent("twap", "Confirm order", data);
  };
};

export const analytics = {
  useOnConfirmTxEvent,
};

export const sendAnalyticsEvent = (category?: Category, action?: string, data?: any) => {
  if (!ReactGA.isInitialized) return;
  ReactGA.send({
    category: category || "twap",
    action: action || "",
    label: "",
    data,
  });
};
