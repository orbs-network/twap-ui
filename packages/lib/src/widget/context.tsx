import { createContext, useContext } from "react";
import { PanelProps } from "./types";

const PanelContext = createContext({} as PanelProps);
export const PanelProvider = PanelContext.Provider;

export const usePanelContext = () => useContext(PanelContext);
