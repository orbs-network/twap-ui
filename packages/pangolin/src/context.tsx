import { TWAPTokenSelectProps } from "@orbs-network/twap-ui";
import { createContext, FC, ReactNode, useContext, useState } from "react";
import { PangolinTWAPProps } from "./types";

interface Props {
  twapProps: PangolinTWAPProps;
  children: ReactNode;
  ModifiedTokenSelectModal: FC<TWAPTokenSelectProps>;
}

interface Values extends PangolinTWAPProps {
  toggleOrders: () => void;
  showOrders: boolean;
  ModifiedTokenSelectModal: FC<TWAPTokenSelectProps>;
}

const Context = createContext({} as Values);

const AdapterContextProvider = ({ twapProps, children, ModifiedTokenSelectModal }: Props) => {
  const [showOrders, setShowOrders] = useState(false);

  const values = {
    ...twapProps,
    toggleOrders: () => setShowOrders(!showOrders),
    showOrders,
    ModifiedTokenSelectModal,
  };

  return <Context.Provider value={values}>{children}</Context.Provider>;
};

const useAdapterContext = () => useContext(Context);

export { AdapterContextProvider, useAdapterContext };
