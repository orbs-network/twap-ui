import { zero, sendAndWaitForConfirmations, erc20, maxUint256, estimateGasPrice, erc20abi, isNativeAddress, iwethabi, web3 } from "@defi.org/web3-candies";
import BN from "bignumber.js";
import TwapAbi from "@orbs-network/twap/twap.abi.json";
import { Config, Token } from "../types";
import { getEstimatedDelayBetweenChunksMillis } from "./lib";
import Web3 from "web3";
import { getNetwork } from "../utils";
interface SendTransactionArgs {
  account: string;
  onTxHash?: (txHash: string) => void;
  priorityFeePerGas?: string;
  maxFeePerGas?: string;
  config: Config;
  provider: any;
}

interface CreateOrderArgs extends SendTransactionArgs {
  dstTokenMinAmount: string;
  srcChunkAmount: string;
  deadlineMillis: number;
  fillDelayMillis: number;
  srcAmount: string;
  srcTokenAddress: string;
  dstTokenAddress: string;
}

export const createOrderParams = (args: CreateOrderArgs) => {
  const fillDelaySeconds = (args.fillDelayMillis - getEstimatedDelayBetweenChunksMillis(args.config)) / 1000;

  const params = [
    args.config.exchangeAddress,
    args.srcTokenAddress,
    args.dstTokenAddress,
    BN(args.srcAmount).toFixed(0),
    BN(args.srcChunkAmount).toFixed(0),
    BN(args.dstTokenMinAmount).toFixed(0),
    BN(args.deadlineMillis).div(1000).toFixed(0),
    BN(args.config.bidDelaySeconds).toFixed(0),
    BN(fillDelaySeconds).toFixed(0),
    [],
  ];

  return {
    params,
    Abi: TwapAbi,
    contractAddress: args.config.twapAddress,
  };
};

const getGasPrice = async (web3?: Web3, priorityFeePerGas?: string, maxFeePerGas?: string) => {
  if (priorityFeePerGas && maxFeePerGas && BN(priorityFeePerGas).gt(0) && BN(maxFeePerGas).gt(0)) {
    return {
      priorityFeePerGas,
      maxFeePerGas,
    };
  }
  const gasPrice = await estimateGasPrice(undefined, undefined, web3);
  const _priorityFeePerGas = gasPrice?.fast.tip.toString();
  return {
    priorityFeePerGas: _priorityFeePerGas,
    maxFeePerGas: BN.max(gasPrice?.fast.max, _priorityFeePerGas).toString(),
  };
};

export type CreatedOrderReponse = {
  id: number;
  txHash: string;
};

export const createOrder = async (args: CreateOrderArgs): Promise<CreatedOrderReponse> => {
  const { params, Abi, contractAddress } = createOrderParams(args);
  const web3 = new Web3(args.provider);
  const twapContract = new web3.eth.Contract(Abi as any, contractAddress);
  const ask = twapContract.methods.ask(params);
  const { maxFeePerGas, priorityFeePerGas } = await getGasPrice(web3, args.priorityFeePerGas, args.maxFeePerGas);

  const tx = await sendAndWaitForConfirmations(
    ask,
    {
      from: args.account,
      maxPriorityFeePerGas: priorityFeePerGas || zero,
      maxFeePerGas,
    },
    undefined,
    undefined,
    {
      onTxHash: args.onTxHash,
    },
  );

  const id = Number(tx.events.OrderCreated.returnValues.id);
  const txHash = tx.transactionHash;
  return {
    id,
    txHash,
  };
};

interface ApproveTokenArgs extends SendTransactionArgs {
  approvalAmount: string;
  srcTokenAddress: string;
}

export const approveToken = async (args: ApproveTokenArgs) => {
  const network = getNetwork(args.config.chainId);
  if (!network) {
    throw new Error("Network not found for chainId: " + args.config.chainId);
  }
  const web3 = new Web3(args.provider);
  const tokenAddress = isNativeAddress(args.srcTokenAddress) ? network.wToken.address : args.srcTokenAddress;
  const amount = args.approvalAmount || maxUint256;
  const { maxFeePerGas, priorityFeePerGas } = await getGasPrice(web3, args.priorityFeePerGas, args.maxFeePerGas);
  let txHash: string = "";
  const contract = new web3.eth.Contract(erc20abi, tokenAddress);

  await sendAndWaitForConfirmations(
    contract.methods.approve(args.config.twapAddress, BN(amount).toFixed(0)),
    {
      from: args.account,
      maxPriorityFeePerGas: priorityFeePerGas,
      maxFeePerGas,
    },
    undefined,
    undefined,
    {
      onTxHash: (value) => {
        args.onTxHash?.(value);
        txHash = value;
      },
    },
  );
  return txHash;
};

interface WrapTokenArgs extends SendTransactionArgs {
  srcAmount: string;
}

export const wrapToken = async (args: WrapTokenArgs) => {
  const network = getNetwork(args.config.chainId);

  if (!network) {
    throw new Error("Network not found for chainId: " + args.config.chainId);
  }
  const web3 = new Web3(args.provider);

  const tx = new web3.eth.Contract(iwethabi, network.wToken.address).methods.deposit();

  const { maxFeePerGas, priorityFeePerGas } = await getGasPrice(web3, args.priorityFeePerGas, args.maxFeePerGas);
  let txHash: string = "";

  await sendAndWaitForConfirmations(
    tx,
    {
      from: args.account,
      maxPriorityFeePerGas: priorityFeePerGas,
      maxFeePerGas,
      value: args.srcAmount,
    },
    undefined,
    undefined,
    {
      onTxHash: (hash) => {
        txHash = hash;
        args.onTxHash?.(hash);
      },
    },
  );

  return txHash;
};

export const cancelOrder = async (args: { orderId: number; web3: Web3; config: Config; priorityFeePerGas?: string; maxFeePerGas?: string; account: string }) => {
  const twapContract = new args.web3.eth.Contract(TwapAbi as any, args.config.twapAddress);

  const { maxFeePerGas, priorityFeePerGas } = await getGasPrice(args.web3, args.priorityFeePerGas, args.maxFeePerGas);

  return sendAndWaitForConfirmations(twapContract.methods.cancel(args.orderId), {
    from: args.account,
    maxPriorityFeePerGas: priorityFeePerGas,
    maxFeePerGas,
  });
};
