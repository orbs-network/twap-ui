import { erc20s, setWeb3Instance, Token as cToken, web3, network, erc20sData } from "@defi.org/web3-candies";
import { configure } from "@testing-library/react";
import { useChaiBigNumber } from "@defi.org/web3-candies/dist/hardhat";
import type { TokenData } from "@orbs-network/twap";
import Web3 from "web3";
import { expect } from "chai";
import * as _ from "lodash";

export const CHAIN_ID = 42161;

useChaiBigNumber();

export let tokens: TokenData[];
export let maker: string;

export async function initFixture() {
  expect(process.env.NETWORK).not.empty;
  const networkUrl = process.env[`NETWORK_URL_${process.env.NETWORK!.toUpperCase()}`];
  expect(networkUrl).not.empty;
  setWeb3Instance(new Web3(networkUrl!));
  configure({ asyncUtilTimeout: 10_000 });

  tokens = (erc20sData as any)[network(CHAIN_ID)!.shortname] as TokenData[];
  maker = web3().eth.accounts.create().address;
}

// async function baseTokens() {
//   const tokens = _.get(erc20s, [network(CHAIN_ID)!.shortname]);
//   return Promise.all(
//     _.map(tokens, async (token: () => cToken) => {
//       const t = token();

//       return { decimals: await t.decimals(), symbol: t.name, address: t.address } as TokenData;
//     })
//   );
// }
