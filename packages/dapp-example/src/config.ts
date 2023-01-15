import { pangolinDaas, pangolin } from "./Pangolin";
import spiritswap from "./SpiritSwap";
import spookyswap from "./SpookySwap";
import quickswap from "./QuickSwap";

export const defaultDapp = spiritswap;
export const dapps = [spiritswap, pangolin, pangolinDaas, spookyswap, quickswap];
