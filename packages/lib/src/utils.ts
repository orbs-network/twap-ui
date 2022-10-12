import { BigNumber, parsebn, Token, zero } from "@defi.org/web3-candies";

export const delay = (delayInms: number) => new Promise((resolve) => setTimeout(resolve, delayInms));
