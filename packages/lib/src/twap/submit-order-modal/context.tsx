import { createContext, ReactNode, useContext } from "react";
import { SubmitOrderPanelProps } from "../../types";

const Context = createContext({} as SubmitOrderPanelProps);

type Props = SubmitOrderPanelProps & {
  children: ReactNode;
};

export const SubmitOrderContextProvider = ({ children, ...rest }: Props) => {
  return <Context.Provider value={rest}>{children}</Context.Provider>;
};

export const useSubmitOrderPanelContext = () => {
  return useContext(Context);
};
