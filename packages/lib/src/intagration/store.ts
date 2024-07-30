import { useCallback, useReducer } from "react";
import { TimeResolution, TwapLibProps } from "../types";
import { MIN_TRADE_INTERVAL_FORMATTED } from "../consts";
import moment from "moment";
import { ItegrationState } from "./types";

const initialState: ItegrationState = {
  srcAmountUi: "",

  confirmationClickTimestamp: moment(),
  customChunks: undefined,
  customFillDelay: { resolution: TimeResolution.Minutes, amount: MIN_TRADE_INTERVAL_FORMATTED },

  isMarketOrder: false,
};

enum ActionType {
  UPDATED_STATE = "UPDATED_STATE",
}

type Action = { type: ActionType.UPDATED_STATE; value: Partial<ItegrationState> };

const contextReducer = (state: ItegrationState, action: Action): ItegrationState => {
  switch (action.type) {
    case ActionType.UPDATED_STATE:
      return { ...state, ...action.value };
    default:
      return state;
  }
};

export const useIntegrationStore = () => {
  const [state, dispatch] = useReducer(contextReducer, initialState);
  const updateState = useCallback((value: Partial<ItegrationState>) => dispatch({ type: ActionType.UPDATED_STATE, value }), [dispatch]);
  return {
    updateState,
    state,
  };
};
