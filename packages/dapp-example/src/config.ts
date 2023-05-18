import { pangolin, pangolinDaas } from "./Pangolin";
import spiritswap from "./SpiritSwap";
import spookyswap from "./SpookySwap";
import quickswap from "./QuickSwap";
import chronos from "./Chronos";
import thena from "./Thena";

export const defaultDapp = spiritswap;
export const dapps = [spiritswap, spookyswap, pangolin, pangolinDaas, quickswap, chronos, thena];
