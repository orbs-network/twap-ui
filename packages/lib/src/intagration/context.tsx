import moment from "moment";
import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { analytics } from "../analytics";
import defaultTranlations from "../i18n/en.json";
import { Config, Translations } from "../types";
import { useIntegrationStore } from "./store";
import { ItegrationState, IntegrationProps } from "./types";

interface ContextArgs extends IntegrationProps {
  state: ItegrationState;
  updateState: (state: Partial<ItegrationState>) => void;
  translations: Translations;
}

interface ContextProps extends IntegrationProps {
  children: React.ReactNode;
}

const Listener = ({ config }: { config: Config }) => {
  const interval = useRef<any>();
  const { updateState } = useIntegrationContext();

  useEffect(() => {
    interval.current = setInterval(() => {
      updateState({ confirmationClickTimestamp: moment() });
    }, 10_000);
    return () => clearInterval(interval.current);
  }, [updateState]);

  useEffect(() => {
    analytics.onLibInit(config);
  }, [config]);

  return null;
};

export const Context = createContext({} as ContextArgs);

export const IntergarionProvider = (props: ContextProps) => {
  const { config } = props;
  const translations = useMemo(() => ({ ...defaultTranlations, ...props.translationsOverride }) as Translations, [props.translationsOverride]);
  const { updateState, state } = useIntegrationStore();

  return (
    <Context.Provider
      value={{
        translations,
        state,
        updateState,
        marketPrice: props.marketPrice,
        config,
        askDataParams: props.askDataParams,
        srcToken: props.srcToken,
        dstToken: props.dstToken,
      }}
    >
      <Listener config={props.config} />
      {props.children}
    </Context.Provider>
  );
};

export const useIntegrationContext = () => {
  return useContext(Context);
};
