import { useMemo } from "react";
import { useTwapContext } from "../context";
import { useTwapStore } from "../useTwapStore";
import { useDuration } from "./use-duration";

export const useDeadline = () => {
  const { twapSDK } = useTwapContext();
  const currentTime = useTwapStore((s) => s.state.currentTime);
  const duration = useDuration().duration;
  const deadline = useMemo(() => twapSDK.getOrderDeadline(currentTime, duration), [twapSDK, currentTime, duration]);

  return deadline;
};
