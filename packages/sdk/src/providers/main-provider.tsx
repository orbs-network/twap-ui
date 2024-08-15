import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { TimeResolution } from "../types";
import { analytics } from "../analytics";
import moment from "moment";
import { useMainStore } from "../store/main-store";
import { useOnDuration } from "../hooks/hooks";
analytics.onModuleImported();

interface Shared {
  maxFeePerGas?: string;
  priorityFeePerGas?: string;
  isLimitPanel?: boolean;
}

interface TwapProviderProps extends Shared {
  children: React.ReactNode;
}

export const TwapContext = createContext({} as Shared);

const Listener = (props: TwapProviderProps) => {
  const interval = useRef<any>();
  const { swapState, updateState } = useMainStore();
  const setCustomDuration = useOnDuration();

  useEffect(() => {
    if (props.isLimitPanel) {
      setCustomDuration({ resolution: TimeResolution.Days, amount: 7 });
    } else {
      setCustomDuration(undefined);
    }
  }, [props.isLimitPanel, setCustomDuration]);

  useEffect(() => {
    if (!swapState) {
      updateState({ confirmationClickTimestamp: moment() });
      interval.current = setInterval(() => {
        updateState({ confirmationClickTimestamp: moment() });
      }, 10_000);
    }
    return () => clearInterval(interval.current);
  }, [swapState, updateState]);

  return null;
};

export const TwapProvider = (props: TwapProviderProps) => {
  return (
    <TwapContext.Provider
      value={{
        maxFeePerGas: props.maxFeePerGas,
        priorityFeePerGas: props.priorityFeePerGas,
        isLimitPanel: !!props.isLimitPanel,
      }}
    >
      {props.children}
      <Listener {...props} />
    </TwapContext.Provider>
  );
};

export const useTwapContext = () => {
  return useContext(TwapContext);
};
