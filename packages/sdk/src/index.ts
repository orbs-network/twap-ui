import Configs from "@orbs-network/twap/configs.json";
import TwapAbi from "@orbs-network/twap/twap.abi.json";
import LensAbi from "@orbs-network/twap/lens.abi.json";

import iwethabi from "./lib/abi/iwethabi.json";
import erc20abi from "./lib/abi/erc20abi.json";

export * from "./lib/types";
export * from "./lib/consts";
export { constructSDK, TwapSDK } from "./lib/constructSDK";
export * from "./lib/lib";
export { isNativeAddress, getNetwork, amountBN, amountUi, eqIgnoreCase, getConfigByExchange } from "./lib/utils";
export { networks } from "./lib/networks";

export { getOrderExcecutionRate, getOrderLimitPriceRate, type Order, parseRawStatus, buildOrder, getOrderFillDelayMillis, getOrderProgress, getOrders } from "./lib/orders";
export { Configs, TwapAbi, iwethabi, erc20abi, LensAbi };
