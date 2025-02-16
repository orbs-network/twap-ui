import { useEffect } from "react";
import { useReducer, useCallback, useMemo } from "react";
import * as SDK from "@orbs-network/twap-sdk";
import { Action, ActionType, State, Token } from "./types";
import { useDerivedSwapValues } from "./hooks/useDerivedValues";
import { useActionHandlers } from "./hooks/useHandlers";
import { useLimitPricePanel } from "./hooks/useLimitPricePanel";
import useCreateOrderTx from "./hooks/useContractMethods";
import { DEFAULT_LIMIT_PANEL_DURATION } from "./consts";

const initialState: State = {
  currentTime: Date.now(),
  typedFillDelay: SDK.DEFAULT_FILL_DELAY,
};

const useOrders = (sdk: SDK.TwapSDK) => {
  return useMemo(() => {
    return {
      getUserOrders: sdk.getUserOrders.bind(sdk),
      waitForCreatedOrder: sdk.waitForNewOrder.bind(sdk),
      waitForCancelledOrder: sdk.waitForCancelledOrder.bind(sdk),
    };
  }, [sdk]);
};

const StateRedicer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.UPDATED_STATE:
      return { ...state, ...action.value };
    case ActionType.RESET:
      return {
        ...initialState,
        typedDuration: action.payload ? DEFAULT_LIMIT_PANEL_DURATION : undefined,
      };
    default:
      return state;
  }
};

type UseTwapProps = {
  config: SDK.Config;
  isLimitPanel?: boolean;
  srcToken?: Token;
  destToken?: Token;
  marketPriceOneToken?: string;
  oneSrcTokenUsd?: number | string;
  typedSrcAmount?: string;
};

export const useTwap = ({ config, isLimitPanel, srcToken, destToken, marketPriceOneToken: marketPrice, oneSrcTokenUsd, typedSrcAmount }: UseTwapProps) => {
  const [state, dispatch] = useReducer(StateRedicer, initialState);
  const updateState = useCallback((value: Partial<State>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);
  const sdk = useMemo(() => new SDK.TwapSDK({ config }), [config]);
  const orders = useOrders(sdk);
  const { values, warnings, errors } = useDerivedSwapValues(sdk, state, isLimitPanel, srcToken, destToken, marketPrice, oneSrcTokenUsd?.toString(), typedSrcAmount);
  const actionHandlers = useActionHandlers(dispatch, updateState, !!isLimitPanel);
  const limitPricePanel = useLimitPricePanel(state, values, errors, updateState, srcToken, destToken, marketPrice);
  const createOrderTx = useCreateOrderTx(values, sdk, srcToken, destToken);

  useEffect(() => {
    if (isLimitPanel) {
      updateState({ typedDuration: DEFAULT_LIMIT_PANEL_DURATION });
    } else {
      updateState({ typedDuration: undefined });
    }
  }, [isLimitPanel, updateState]);

  useEffect(() => {
    setInterval(() => {
      updateState({ currentTime: Date.now() });
    }, 60_000);
  }, [updateState]);

  return {
    values,
    warnings,
    errors,
    actionHandlers,
    limitPricePanel,
    analytics: sdk.analytics,
    orders,
    createOrderTx,
  };
};

export type UseTwap = ReturnType<typeof useTwap>;
