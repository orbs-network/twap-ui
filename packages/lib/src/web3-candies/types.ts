import BN from "bignumber.js";
import type { TransactionReceipt } from "web3-core";
import type { AbiItem } from "web3-utils";

import type { BlockTransactionString } from "web3-eth";

export type Abi = AbiItem[];

export type TokenData = {
  symbol: string;
  address: string;
  decimals: number;
};
export type BlockInfo = BlockTransactionString & { timestamp: number };

export type BlockNumber = "latest" | "pending" | "genesis" | "earliest" | number | BN;

export type Receipt = TransactionReceipt;

export interface EventData {
  returnValues: {
    [key: string]: any;
  };
  raw: {
    data: string;
    topics: string[];
  };
  event: string;
  signature: string;
  logIndex: number;
  transactionIndex: number;
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
  address: string;
}

export interface EventLog {
  event: string;
  address: string;
  returnValues: any;
  logIndex: number;
  transactionIndex: number;
  transactionHash: string;
  blockHash: string;
  blockNumber: number;
  raw?: { data: string; topics: any[] };
}
