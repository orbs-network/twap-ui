import { Configs, ORBS_TWAP_FAQ_URL, ORBS_LOGO, ORBS_LOGO_FALLBACK, ORBS_WEBSITE_URL, DISCLAIMER_URL, TimeUnit } from "@orbs-network/twap-sdk";
export const REFETCH_ORDER_HISTORY = 20_000;

export const MIN_NATIVE_BALANCE = 0.01;

export const SLIPPAGE_MULTIPLIER = 10;
export const LIMIT_TRIGGER_PRICE_DELTA_PERCENTAGE = 15;

export const TX_GAS_COST = 500_000;

export { Configs, ORBS_TWAP_FAQ_URL, ORBS_LOGO, ORBS_LOGO_FALLBACK, ORBS_WEBSITE_URL, DISCLAIMER_URL };

export const DEFAULT_DURATION_OPTIONS: { text: string; value: TimeUnit }[] = [
  {
    text: "Minutes",
    value: TimeUnit.Minutes,
  },
  {
    text: "Hours",
    value: TimeUnit.Hours,
  },
  {
    text: "Days",
    value: TimeUnit.Days,
  },
];

export const PRICE_PROTECTION_SETTINGS =
  "The protocol uses an oracle price to help protect users from unfavorable executions. If the execution price is worse than the oracle price by more than the allowed percentage, the transaction will not be executed.";
