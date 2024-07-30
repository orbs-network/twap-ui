import { createContext, useContext, useMemo } from "react";
import defaultTranlations from "../i18n/en.json";
import { Translations } from "../types";
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

export const Context = createContext({} as ContextArgs);

export const IntergarionContext = (props: ContextProps) => {
  const { config } = props;
  const translations = useMemo(() => ({ ...defaultTranlations, ...props.translationsOverride } as Translations), [props.translationsOverride]);
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
      {props.children}
    </Context.Provider>
  );
};

export const useIntegrationContext = () => {
  return useContext(Context);
};
