import React, { ReactNode, useCallback, useContext, useState } from "react";
import { useShouldWrapOrUnwrapOnly } from "../hooks/useShouldWrapOrUnwrap";

type ContextType = {
  onFocus: () => void;
  onBlur: () => void;
  isFocused: boolean;
};
const Context = React.createContext({} as ContextType);

const usePanelContext = () => useContext(Context);

const PanelHeader = ({ children }: { children: ReactNode }) => {
  return <div className="twap-panel-header">{children}</div>;
};

export function Panel({ error, className = "", children }: { error?: boolean; className?: string; children: ReactNode }) {
  const [isFocused, setIsFocused] = useState(false);
  const wrapOrUnwrap = useShouldWrapOrUnwrapOnly();

  const onFocus = useCallback(() => setIsFocused(true), []);
  const onBlur = useCallback(() => setIsFocused(false), []);
  const _error = !wrapOrUnwrap && error;
  return (
    <Context.Provider value={{ isFocused, onBlur, onFocus }}>
      <div className={`${className} twap-panel ${isFocused && !_error ? "twap-panel-focused" : ""} ${_error ? "twap-panel-error" : ""}`}>{children}</div>
    </Context.Provider>
  );
}

Panel.usePanelContext = usePanelContext;
Panel.Header = PanelHeader;
