import { useMemo } from "react";
import { useTwapStore } from "../useTwapStore";
import { getDeadline } from "@orbs-network/twap-sdk";
import { useDuration } from "./use-duration";

export const useDeadline = () => {
  const currentTime = useTwapStore((s) => s.state.currentTime);
  const duration = useDuration().duration;

  return useMemo(() => getDeadline(currentTime, duration), [currentTime, duration]);
};
