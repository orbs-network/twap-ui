import { pangolin, pangolinDaas } from "./Pangolin";
import spiritswap from "./SpiritSwap";
import spookyswap from "./SpookySwap";
import quickswap from "./QuickSwap";
import chronos from "./Chronos";
import thena from "./Thena";
import sushiswap from "./SushiSwap";
import stellaswap from "./StellaSwap";
import pancake from "./Pancake";

export const defaultDapp = quickswap;
export const dapps = [quickswap, spookyswap, spiritswap, pangolin, pangolinDaas, chronos, thena, stellaswap, sushiswap, pancake];
