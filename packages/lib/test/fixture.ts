import { setWeb3Instance } from "@defi.org/web3-candies";
import Web3 from "web3";
import { expect } from "chai";

export async function initFixture() {
  expect(process.env.NETWORK).not.undefined.empty;
  const networkUrl = process.env[`NETWORK_URL_${process.env.NETWORK!.toUpperCase()}`];
  expect(networkUrl).not.undefined.empty;
  setWeb3Instance(new Web3(networkUrl!));
}
