import ConfigJson from "@orbs-network/twap/configs.json";
export type Config = typeof ConfigJson.Arbidex;

export type Token = {
  address: string;
  symbol: string;
  decimals: number;
  logoUrl: string;
};

export enum Status {
  All = "All",
  Open = "Open",
  Canceled = "Canceled",
  Completed = "Completed",
  Expired = "Expired",
}

export enum TimeUnit {
  Minutes = 60 * 1000,
  Hours = Minutes * 60,
  Weeks = 7 * 24 * Hours,
  Days = Hours * 24,
  Months = 30 * Days,
  Years = 365 * Days,
}

export type TimeDuration = { unit: TimeUnit; value: number };
