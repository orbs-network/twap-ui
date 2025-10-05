import { createContext, useContext } from "react";
import { useCurrentOrderDetails } from "../hooks/use-current-order";
import { useInvertTrade } from "../hooks/use-invert-trade";
import {
  useTradesPanel,
  useFillDelayPanel,
  useDurationPanel,
  useLimitPricePanel,
  useMarketPricePanel,
  useSrcTokenPanel,
  useDstTokenPanel,
  useTriggerPricePanel,
  useOrderHistoryPanel,
  useSubmitSwapPanel,
  useDisclaimerPanel,
} from "../hooks/use-panels";
import { InputError } from "../types";
import { useInputErrors } from "../hooks/use-input-errors";

type ContextType = {
  inputsError: InputError | undefined;
  tradesPanel: ReturnType<typeof useTradesPanel>;
  fillDelayPanel: ReturnType<typeof useFillDelayPanel>;
  durationPanel: ReturnType<typeof useDurationPanel>;
  limitPricePanel: ReturnType<typeof useLimitPricePanel>;
  marketPricePanel: ReturnType<typeof useMarketPricePanel>;
  srcTokenPanel: ReturnType<typeof useSrcTokenPanel>;
  dstTokenPanel: ReturnType<typeof useDstTokenPanel>;
  disclaimerPanel: ReturnType<typeof useDisclaimerPanel>;
  triggerPricePanel: ReturnType<typeof useTriggerPricePanel>;
  orderHistoryPanel: ReturnType<typeof useOrderHistoryPanel>;
  invertTradePanel: ReturnType<typeof useInvertTrade>;
  submitSwapPanel: ReturnType<typeof useSubmitSwapPanel>;
  order: ReturnType<typeof useCurrentOrderDetails>;
};

export const UserContext = createContext({} as ContextType);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const tradesPanel = useTradesPanel();
  const fillDelayPanel = useFillDelayPanel();
  const durationPanel = useDurationPanel();
  const marketPricePanel = useMarketPricePanel();
  const srcTokenPanel = useSrcTokenPanel();
  const dstTokenPanel = useDstTokenPanel();
  const triggerPricePanel = useTriggerPricePanel();
  const limitPricePanel = useLimitPricePanel();
  const disclaimerPanel = useDisclaimerPanel();
  const orderHistoryPanel = useOrderHistoryPanel();
  const invertTradePanel = useInvertTrade();
  const submitSwapPanel = useSubmitSwapPanel();
  const order = useCurrentOrderDetails();
  const inputsError = useInputErrors();

  return (
    <UserContext.Provider
      value={{
        inputsError,
        tradesPanel,
        fillDelayPanel,
        durationPanel,
        limitPricePanel,
        marketPricePanel,
        triggerPricePanel,
        srcTokenPanel,
        dstTokenPanel,
        disclaimerPanel,
        orderHistoryPanel,
        invertTradePanel,
        submitSwapPanel,
        order,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => {
  return useContext(UserContext);
};
