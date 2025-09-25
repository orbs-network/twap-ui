// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as Spot from "@orbs-network/spot";
import IWETHABI from "./iwethabi.json";
import ERC20ABI from "./erc20abi.json";
import TwapAbi from "@orbs-network/twap/twap.abi.json";
import LensAbi from "@orbs-network/twap/lens.abi.json";

export const REACTOR_ABI = Spot.abi.reactor;
export const EXECUTOR_ABI = Spot.abi.executor;
export const REPERMIT_ABI = Spot.abi.repermit;
export const IWETH_ABI = IWETHABI;
export const ERC20_ABI = ERC20ABI;
export const TWAP_ABI = TwapAbi;
export const LENS_ABI = LensAbi;
