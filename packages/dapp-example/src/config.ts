import { pangolin, pangolinDaas } from "./Pangolin";
import spiritswap from "./SpiritSwap";
import spookyswap from "./SpookySwap";
import quickswap from "./QuickSwap";
import chronos from "./Chronos";
import thena from "./Thena";
import sushiswap from "./SushiSwap";
import stellaswap from "./StellaSwap";
import pancake from "./PancakeSwap";
import baseswap from "./BaseSwap";
import lynex from "./Lynex";
import arbidex from "./Arbidex";
import syncswap from "./SyncSwap";

export const defaultDapp = quickswap;
export const dapps = [quickswap, spookyswap, spiritswap, pangolin, pangolinDaas, chronos, thena, baseswap, arbidex, lynex, stellaswap, pancake, sushiswap, syncswap];
