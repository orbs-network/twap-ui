import BN from "bignumber.js";
import _ from "lodash";
import Web3 from "web3";
import { nativeTokenAddresses, zero } from "./consts";
import { networks } from "./networks";
import { Abi, BlockInfo, BlockNumber, EventData, EventLog, Receipt } from "./types";

export function eqIgnoreCase(a: string, b: string) {
  return a == b || a.toLowerCase() == b.toLowerCase();
}

export const isNativeAddress = (address: string) => !!nativeTokenAddresses.find((a) => eqIgnoreCase(a, address));

export function bn(n: BN.Value, base?: number): BN {
  if (n instanceof BN) return n;
  if (!n) return zero;
  return BN(n, base);
}

export function parsebn(n: BN.Value, defaultValue?: BN, fmt?: BN.Format): BN {
  if (typeof n !== "string") return bn(n);

  const decimalSeparator = fmt?.decimalSeparator || ".";
  const str = n.replace(new RegExp(`[^${decimalSeparator}\\d-]+`, "g"), "");
  const result = bn(decimalSeparator === "." ? str : str.replace(decimalSeparator, "."));
  if (defaultValue && (!result.isFinite() || result.lte(zero))) return defaultValue;
  else return result;
}

export function network(chainId: number) {
  return _.find(networks, (n) => n.id === chainId)!;
}

export async function switchMetaMaskNetwork(web3: Web3, chainId: number) {
  const provider = (web3 as any).provider || web3.currentProvider;
  if (!provider) throw new Error(`no provider`);

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: Web3.utils.toHex(chainId) }],
    });
  } catch (error: any) {
    // if unknown chain, add chain
    if (error.code === 4902) {
      const info = network(chainId);
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: Web3.utils.toHex(chainId),
            chainName: info.name,
            nativeCurrency: info.native,
            rpcUrls: [info.publicRpcUrl],
            blockExplorerUrls: [info.explorer],
            iconUrls: [info.logoUrl],
          },
        ],
      });
    } else throw error;
  }
}

export function median(arr: BN.Value[]): BN {
  if (!arr.length) return zero;

  arr = [...arr].sort((a, b) => bn(a).comparedTo(b));
  const midIndex = Math.floor(arr.length / 2);
  return arr.length % 2 !== 0
    ? bn(arr[midIndex])
    : bn(arr[midIndex - 1])
        .plus(arr[midIndex])
        .div(2);
}

export async function estimateGasPrice(
  w3: Web3,
  percentiles: number[] = [10, 50, 90],
  length: number = 5,
  timeoutMillis: number = 1000
): Promise<{
  slow: { max: BN; tip: BN };
  med: { max: BN; tip: BN };
  fast: { max: BN; tip: BN };
  baseFeePerGas: BN;
  pendingBlockNumber: number;
  pendingBlockTimestamp: number;
}> {
  if (process.env.NETWORK_URL && !w3) w3 = new Web3(process.env.NETWORK_URL);

  return await keepTrying(
    async () => {
      const [block, history] = await Promise.all([
        w3!.eth.getBlock("latest"),
        !!w3!.eth.getFeeHistory ? w3!.eth.getFeeHistory(length, "latest", percentiles) : Promise.resolve({ reward: [] }),
      ]);

      const baseFeePerGas = BN(block.baseFeePerGas || 0);

      const slow = BN.max(1, median(_.map(history.reward, (r) => BN(r[0], 16))));
      const med = BN.max(1, median(_.map(history.reward, (r) => BN(r[1], 16))));
      const fast = BN.max(1, median(_.map(history.reward, (r) => BN(r[2], 16))));

      return {
        slow: { max: baseFeePerGas.times(1).plus(slow).integerValue(), tip: slow.integerValue() },
        med: { max: baseFeePerGas.times(1.1).plus(med).integerValue(), tip: med.integerValue() },
        fast: { max: baseFeePerGas.times(1.25).plus(fast).integerValue(), tip: fast.integerValue() },
        baseFeePerGas,
        pendingBlockNumber: block.number,
        pendingBlockTimestamp: BN(block.timestamp).toNumber(),
      };
    },
    3,
    timeoutMillis
  );
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function keepTrying<T>(fn: () => Promise<T>, retries = 3, ms = 1000): Promise<T> {
  let e;
  for (let i = 0; i < retries; i++) {
    try {
      return await timeout(fn, ms);
    } catch (_e) {
      e = _e;
      await sleep(ms);
    }
  }
  throw new Error("failed to invoke fn " + e);
}

export async function timeout<T>(fn: () => Promise<T>, ms = 1000): Promise<T> {
  let failed = false;
  const r = await Promise.race([
    fn(),
    new Promise((resolve) => {
      setTimeout(() => {
        failed = true;
        resolve(null);
      }, ms);
    }),
  ]);
  if (!failed && !!r) return r as T;
  else throw new Error("timeout");
}

export async function getPastEvents(params: {
  web3: Web3;
  contract: any;
  eventName: string | "all";
  filter: { [key: string]: string | number };
  fromBlock: number;
  toBlock?: number;
  minDistanceBlocks?: number;
  maxDistanceBlocks?: number;
  latestBlock?: number;
  iterationTimeoutMs?: number;
}): Promise<EventData[]> {
  params.toBlock = params.toBlock || Number.MAX_VALUE;
  params.maxDistanceBlocks = params.maxDistanceBlocks || Number.MAX_VALUE;
  params.minDistanceBlocks = Math.min(params.minDistanceBlocks || 1000, params.maxDistanceBlocks);
  params.iterationTimeoutMs = params.iterationTimeoutMs || 5000;
  params.latestBlock = params.latestBlock || (await params.web3.eth.getBlockNumber());
  params.fromBlock = params.fromBlock < 0 ? params.latestBlock! + params.fromBlock : params.fromBlock;
  params.toBlock = Math.min(params.latestBlock!, params.toBlock);
  const distance = params.toBlock - params.fromBlock;

  const call = () =>
    params.contract.getPastEvents((params.eventName === "all" ? undefined : params.eventName) as any, {
      filter: params.filter,
      fromBlock: params.fromBlock,
      toBlock: params.toBlock,
    });

  if (!params.maxDistanceBlocks || distance <= params.maxDistanceBlocks) {
    try {
      return await timeout(call, distance > params.minDistanceBlocks ? params.iterationTimeoutMs : 5 * 60 * 1000);
    } catch (e: any) {}
  }

  if (distance <= params.minDistanceBlocks) {
    return await call();
  } else {
    return (await getPastEvents({ ...params, toBlock: Math.floor(params.fromBlock + distance / 2) })).concat(
      await getPastEvents({ ...params, fromBlock: Math.floor(params.fromBlock + distance / 2) + 1 })
    );
  }
}

export async function block(web3: Web3, blockHashOrBlockNumber?: BlockNumber | string): Promise<BlockInfo> {
  const r = await web3.eth.getBlock(blockHashOrBlockNumber || "latest");
  if (!r || !r.timestamp) throw new Error(`block ${blockHashOrBlockNumber} not found`);
  r.timestamp = typeof r.timestamp == "number" ? r.timestamp : parseInt(r.timestamp);
  return r as BlockInfo;
}

export async function findBlock(web3: Web3, timestamp: number): Promise<BlockInfo> {
  const targetTimestampSecs = Math.floor(timestamp / 1000);
  const currentBlock = await block(web3);
  if (targetTimestampSecs > currentBlock.timestamp) throw new Error(`findBlock: ${new Date(timestamp)} is in the future`);

  let candidate = await block(web3, currentBlock.number - 10_000);
  const avgBlockDurationSec = Math.max(0.1, (currentBlock.timestamp - candidate.timestamp) / 10_000);

  let closestDistance = Number.POSITIVE_INFINITY;
  while (Math.abs(candidate.timestamp - targetTimestampSecs) >= avgBlockDurationSec) {
    const distanceInSeconds = candidate.timestamp - targetTimestampSecs;
    const estDistanceInBlocks = Math.floor(distanceInSeconds / avgBlockDurationSec);
    if (Math.abs(estDistanceInBlocks) > closestDistance) break;

    closestDistance = Math.abs(estDistanceInBlocks);
    const targeting = candidate.number - estDistanceInBlocks;
    if (targeting < 0) throw new Error("findBlock: target block is before the genesis block");
    candidate = await block(web3, targeting);
  }

  return candidate;
}

export function parseEvents(web3: Web3, receipt: Receipt, contractOrAbi: Abi): EventLog[] {
  const abi = _.get(contractOrAbi, ["options", "jsonInterface"], contractOrAbi) as Abi;
  const abiCoder = web3.eth.abi;
  const abiEvents = _(abi)
    .filter((desc) => desc.type === "event")
    .map((desc) => ({
      name: desc.name || "",
      inputs: desc.inputs || [],
      signature: abiCoder.encodeEventSignature(desc),
    }))
    .value();

  const result: EventLog[] = [];

  _.forEach(receipt.events, (e) => {
    const abiEvent = abiEvents.find((desc) => desc.signature === e.raw?.topics[0]);
    if (abiEvent)
      result.push({
        ...e,
        event: abiEvent.name,
        returnValues: abiCoder.decodeLog(abiEvent.inputs, e.raw?.data || "", e.raw?.topics.slice(1) || []),
      });
  });
  _.forEach(receipt.logs, (log) => {
    const abiEvent = abiEvents.find((desc) => desc.signature === log.topics[0]);
    if (abiEvent)
      result.push({
        event: abiEvent.name,
        returnValues: abiCoder.decodeLog(abiEvent.inputs, log.data, log.topics.slice(1)),
        ...log,
      });
  });
  return result;
}

export async function sendAndWaitForConfirmations({
  web3,
  chainId,
  tx,
  opts,
  confirmations = 0,
  autoGas,
  callback,
}: {
  web3: Web3;
  chainId: number;
  tx: any;
  opts: any;
  confirmations?: number;
  autoGas?: "fast" | "med" | "slow";
  callback?: {
    onTxHash?: (txHash: string) => void;
    onTxReceipt?: (receipt: Receipt) => void;
  };
}) {
  if (!tx && !opts.to) throw new Error("tx or opts.to must be specified");

  const [nonce, chain, price] = await Promise.all([web3.eth.getTransactionCount(opts.from), chainId, autoGas ? estimateGasPrice(web3) : Promise.resolve()]);
  const maxFeePerGas = BN.max(autoGas ? price?.[autoGas]?.max || 0 : 0, bn(opts.maxFeePerGas || 0), 0);
  const maxPriorityFeePerGas = BN.max(autoGas ? price?.[autoGas]?.tip || 0 : 0, bn(opts.maxPriorityFeePerGas || 0), 0);

  const options = {
    value: opts.value ? bn(opts.value).toFixed(0) : 0,
    from: opts.from,
    to: opts.to,
    gas: 0,
    nonce,
    maxFeePerGas: maxFeePerGas.isZero() ? undefined : maxFeePerGas.toFixed(0),
    maxPriorityFeePerGas: maxPriorityFeePerGas.isZero() ? undefined : maxPriorityFeePerGas.toFixed(0),
  };

  if (!network(chain).eip1559) {
    (options as any).gasPrice = options.maxFeePerGas;
    delete options.maxFeePerGas;
    delete options.maxPriorityFeePerGas;
  }

  const estimated = await (tx?.estimateGas({ ...options }) || web3.eth.estimateGas({ ...options }));
  options.gas = Math.floor(estimated * 1.2);

  const promiEvent = tx ? tx.send(options) : web3.eth.sendTransaction(options);

  let sentBlock = Number.POSITIVE_INFINITY;

  promiEvent.once("transactionHash", (r: string) => {
    callback?.onTxHash?.(r);
  });
  promiEvent.once("receipt", (r: any) => {
    sentBlock = r.blockNumber;
    callback?.onTxReceipt?.(r);
  });

  const result = await promiEvent;

  while ((await web3.eth.getTransactionCount(opts.from)) === nonce || (await web3.eth.getBlockNumber()) < sentBlock + confirmations) {
    await new Promise((r) => setTimeout(r, 1000));
  }

  return result;
}

export * from "./consts";
export * from "./networks";
