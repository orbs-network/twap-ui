import { Config, Partners } from "@orbs-network/twap-sdk";

import { Configs } from "@orbs-network/twap-sdk";

export function formatDecimals(value?: string, scale = 6, maxDecimals = 8): string {
  if (!value) return "";

  // ─── keep the sign, work with the absolute value ────────────────
  const sign = value.startsWith("-") ? "-" : "";
  const abs = sign ? value.slice(1) : value;

  const [intPart, rawDec = ""] = abs.split(".");

  // Fast-path: decimal part is all zeros (or absent) ───────────────
  if (!rawDec || Number(rawDec) === 0) return sign + intPart;

  /** Case 1 – |value| ≥ 1 *****************************************/
  if (intPart !== "0") {
    const sliced = rawDec.slice(0, scale);
    const cleaned = sliced.replace(/0+$/, ""); // drop trailing zeros
    const trimmed = cleaned ? "." + cleaned : "";
    return sign + intPart + trimmed;
  }

  /** Case 2 – |value| < 1 *****************************************/
  const firstSigIdx = rawDec.search(/[^0]/); // first non-zero position
  if (firstSigIdx === -1) return "0"; // decimal part is all zeros
  if (firstSigIdx + 1 > maxDecimals) return "0"; // too many leading zeros → 0

  const leadingZeros = rawDec.slice(0, firstSigIdx); // keep them
  const significantRaw = rawDec.slice(firstSigIdx).slice(0, scale);
  const significant = significantRaw.replace(/0+$/, ""); // trim trailing zeros

  return significant ? sign + "0." + leadingZeros + significant : "0";
}
export const abbreviate = (num: string | number, maxDecimals = 2) => {
  if (!num || num === "0" || isNaN(Number(num))) return "0";
  if (typeof num === "number") {
    num = num.toString();
  }
  const abs = Number(num);
  if (abs >= 1e9) return (abs / 1e9).toFixed(2).replace(/\.0+$/, "") + "B";
  if (abs >= 1e6) return (abs / 1e6).toFixed(2).replace(/\.0+$/, "") + "M";
  if (abs >= 1e3) return (abs / 1e3).toFixed(2).replace(/\.0+$/, "") + "K";

  return String(formatDecimals(num, maxDecimals));
};

export const configToPartner = (config: Config) => {
  switch (config) {
    case Configs.SpookySwapSonic:
      return Partners.SPOOKYSWAP;
    case Configs.QuickSwap:
    case Configs.QuickSwapBase:
      return Partners.QUICKSWAP;
    case Configs.Thena:
      return Partners.THENA;
    case Configs.Lynex:
      return Partners.LYNEX;
    default:
      return undefined;
  }
};

export const getPartnerDemoLink = (partner?: Partners) => {
  if (!partner) return undefined;
  switch (partner) {
    case Partners.SPOOKYSWAP:
      return "https://spookyswap-v2.netlify.app/#/swap/twap";
    case Partners.THENA:
      return "https://thena-frontend-mu.vercel.app/swap?inputCurrency=BNB&outputCurrency=0xf4c8e32eadec4bfe97e0f595add0f4450a863a11&swapType=2";
  }
};
