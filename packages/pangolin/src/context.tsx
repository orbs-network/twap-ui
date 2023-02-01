import { createContext, ReactNode, useContext, useState, memo } from "react";
import { PangolinTWAPProps } from "./types";

interface Props {
  twapProps: PangolinTWAPProps;
  children: ReactNode;
}

interface Values extends PangolinTWAPProps {
  toggleOrders: () => void;
  showOrders: boolean;
}

const Context = createContext({} as Values);

const AdapterContextProvider = ({ twapProps, children }: Props) => {
  const [showOrders, setShowOrders] = useState(false);

  const values = {
    ...twapProps,
    toggleOrders: () => setShowOrders(!showOrders),
    showOrders,
  };

  return <Context.Provider value={values}>{children}</Context.Provider>;
};

const useAdapterContext = () => useContext(Context);

export { AdapterContextProvider, useAdapterContext };
