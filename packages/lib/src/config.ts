import { networks, zeroAddress } from "@defi.org/web3-candies";
import _ from "lodash";

const Config = {
  [networks.ftm.id]: {
    minimumTradeSizeUsd: 10,
    twapAddress: "0xdE2ed02ef21895B97a937E82068F28390fF464aC",
    lensAddress: "0xbF8e5B3Af58b041c0ADf0c3DEA933e7D32b8D5ef",
    bidDelaySeconds: 60,
    wrappedTokenInfo: {
      symbol: "WFTM",
      address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      decimals: 18,
      logoUrl: "https://tokens.1inch.io/0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83.png",
    },
    exchangeAddress: "0xAd19179201be5A51D1cBd3bB2fC651BB05822404",
  },
};

export function getConfig(chainId: number, _dapp: string) {
  return _.get(Config, [chainId]);
}

export enum IntegrationDapp {
  SpiritSwap = "SpiritSwap",
  QuickSwap = "QuickSwap",
}

export const nativeAddresses = [zeroAddress, "0x0000000000000000000000000000000000001010", "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"];

export const sendTxAndWait = async <T>(method: () => T) => {
  await method();
  return delay(30_000);
};

async function delay(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}
