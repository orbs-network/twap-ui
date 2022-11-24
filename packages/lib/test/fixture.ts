import { currentNetwork, erc20s, setWeb3Instance, Token as cToken, web3, zero } from "@defi.org/web3-candies";
import { act, configure, renderHook } from "@testing-library/react";
import { useChaiBigNumber } from "@defi.org/web3-candies/dist/hardhat";
import { priceUsdFetcherAtom, resetAllQueriesSet } from "../src/state";
import type { TokenData } from "@orbs-network/twap";
import { useAtomValue, useSetAtom } from "jotai";
import Web3 from "web3";
import BN from "bignumber.js";
import { expect } from "chai";
import * as _ from "lodash";
import { queryClientAtom } from "jotai/query";

useChaiBigNumber();

export let tokens: TokenData[];
export let maker: string;

export async function initFixture() {
  expect(process.env.NETWORK).not.empty;
  const networkUrl = process.env[`NETWORK_URL_${process.env.NETWORK!.toUpperCase()}`];
  expect(networkUrl).not.empty;
  setWeb3Instance(new Web3(networkUrl!));
  configure({ asyncUtilTimeout: 10_000 });
  tokens = await baseTokens();
  maker = web3().eth.accounts.create().address;
  mockPrices = {};
}

let mockPrices: Record<string, BN> = {};
const mockUsdFetcher = {
  priceUsd: async (_chainId: number, token: TokenData) => mockPrices[token.address] || zero,
};

export async function withMockUsdPrice(token: TokenData, price: BN.Value) {
  mockPrices[token.address] = BN(price);
  const { result: reset } = renderHook(() => useSetAtom(resetAllQueriesSet));
  const { result: priceFetcher } = renderHook(() => useSetAtom(priceUsdFetcherAtom));
  await act(async () => {
    priceFetcher.current(mockUsdFetcher);
    await reset.current();
  });
}

async function baseTokens() {
  const network = await currentNetwork();
  const tokens = _.get(erc20s, [network!.shortname]);

  return Promise.all(
    _.map(tokens, async (token: () => cToken) => {
      const t = token();
      return { decimals: await t.decimals(), symbol: t.name, address: t.address } as TokenData;
    })
  );
}
