import { useMemo } from "react";
import { useTwapStore } from "../useTwapStore";
import { useDuration } from "./use-duration";
import { getDeadline } from "@orbs-network/twap-sdk";

export const useDeadline = () => {
  const currentTime = useTwapStore((s) => s.state.currentTime);
  const duration = useDuration().duration;
  const deadline = useMemo(() => getDeadline(currentTime, duration), [currentTime, duration]);

  return deadline;
};
