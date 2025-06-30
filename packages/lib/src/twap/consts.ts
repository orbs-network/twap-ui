import { TimeUnit } from "@orbs-network/twap-sdk";

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
