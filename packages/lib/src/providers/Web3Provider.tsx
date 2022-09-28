import React, { Context, createContext, ReactNode, useContext, useEffect, useState } from "react";
import { setWeb3Instance } from "@defi.org/web3-candies";
import Web3 from "web3";

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
const Web3Provider = ({ children, chainId, account, provider }: any) => {
  const [appReady, setAppReady] = useState(false)
  useEffect(() => {    
    setWeb3Instance(new Web3(provider));
    setAppReady(true)
  }, [provider]);

  const value = {
    chainId,
    account,
    provider,
  };

  if(!appReady){
    return null
  }
  return <Context.Provider value={value}>{children}</Context.Provider>;
};
const useWeb3 = () => useContext(Context);
export { useWeb3, Web3Provider };
