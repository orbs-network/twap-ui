import React, { Context, createContext } from "react";

// interface State {
//   chainId?: number;
//   account?: string | null;
//   provider: any;
// }

// interface Props {
//   children: ReactNode;
//   chainId?: number;
//   account?: string | null;
//   provider: any;
// }

const Context = createContext<any>({} as any);
const TWAPPropsProvider = ({ children }: any) => {
  return <Context.Provider value={{}}>{children}</Context.Provider>;
};

export default TWAPPropsProvider;
