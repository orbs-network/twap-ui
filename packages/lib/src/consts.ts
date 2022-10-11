import { TimeFormat } from "./types";

export const timeSelectOptions = [
  {
    text: "Minutes",
    format: TimeFormat.Minutes,
    base: 1000 * 60,
    limit: 1000 * 60 * 60,
  },
  {
    text: "Hours",
    format: TimeFormat.Hours,
    base: 1000 * 60 * 60,
    limit: 1000 * 60 * 60 * 24,
  },
  {
    text: "Days",
    format: TimeFormat.Days,
    base: 1000 * 60 * 60 * 24,
    limit: Infinity,
  },
];
