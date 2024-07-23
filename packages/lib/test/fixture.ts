// import { erc20s, setWeb3Instance, Token as cToken, web3, network, erc20sData } from "@defi.org/web3-candies";
// import { configure } from "@testing-library/react";
// import { useChaiBigNumber } from "@defi.org/web3-candies/dist/hardhat";
// import type { TokenData } from "@orbs-network/twap";
// import Web3 from "web3";
// import { expect } from "chai";

// export const CHAIN_ID = 42161;

// useChaiBigNumber();

// export let tokens: TokenData[];
// export let maker: string;

// export async function initFixture() {
//   expect(process.env.NETWORK).not.empty;
//   const networkUrl = process.env[`NETWORK_URL_${process.env.NETWORK!.toUpperCase()}`];
//   expect(networkUrl).not.empty;
//   setWeb3Instance(new Web3(networkUrl!));
//   configure({ asyncUtilTimeout: 10_000 });

//   // tokens = _.map((erc20sData as any)[network(CHAIN_ID)!.shortname], (t) => t);
//   // maker = web3().eth.accounts.create().address;
// }

export {};
