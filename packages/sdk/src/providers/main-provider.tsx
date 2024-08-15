import { createContext, useContext, useEffect, useRef } from "react";
import { Config, TimeResolution } from "../types";
import { analytics } from "../analytics";
import moment from "moment";
import { useMainStore } from "../store/main-store";
import { useOnDuration } from "../hooks/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

analytics.onModuleImported();

interface Shared {
  isLimitPanel?: boolean;
  config?: Config
  account?: string;
}

interface TwapProviderProps extends Shared {
  children: React.ReactNode;
}

export const MainContent = createContext({} as Shared);

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

export const MainProvider = (props: TwapProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MainContent.Provider
        value={{
          isLimitPanel: !!props.isLimitPanel,
          config: props.config,
          account: props.account,
        }}
      >
        {props.children}
        <Listener {...props} />
      </MainContent.Provider>
    </QueryClientProvider>
  );
};

export const useMainContext = () => {
  return useContext(MainContent);
};
