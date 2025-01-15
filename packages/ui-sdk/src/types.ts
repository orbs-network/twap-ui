import { Config, TimeDuration, TwapSDK } from "@orbs-network/twap-sdk";



export type Token = {
    address: string;
    symbol: string;
    decimals: number;
    logoUrl: string;
  };
  
  export type State =  {
    swapStep?: number;
    swapSteps?: number[];
    swapStatus?: any;
    srcAmount?: string;
  
    rawSrcToken?: any;
    rawDstToken?: any;
  
    chunks?: number;
    fillDelay: TimeDuration;
    duration?: TimeDuration;
  
    limitPrice?: string;
    isInvertedLimitPrice?: boolean;
    limitPricePercent?: string;
    isMarketOrder?: boolean;
    isLimitPanel?: boolean;
  
    marketPrice?: string;
    oneSrcTokenUsd?: number;
    currentTime: number;
  }
  
  export type TwapProviderProps = {
    config: Config;
    children: React.ReactNode;
    parseToken: (token: any) => Token;
    isLimitPanel?: boolean;
  };
  