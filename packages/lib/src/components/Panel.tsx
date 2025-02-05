import React, { ReactNode, useCallback, useContext, useState } from "react";

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

  const onFocus = useCallback(() => setIsFocused(true), []);
  const onBlur = useCallback(() => setIsFocused(false), []);

  return (
    <Context.Provider value={{ isFocused, onBlur, onFocus }}>
      <div className={`${className} twap-panel ${isFocused && !error ? "twap-panel-focused" : ""} ${error ? "twap-panel-error" : ""}`}>{children}</div>
    </Context.Provider>
  );
}

Panel.usePanelContext = usePanelContext;
Panel.Header = PanelHeader;
