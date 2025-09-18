import { useMemo } from "react";
import { useTwapStore } from "../useTwapStore";
import { getDeadline } from "@orbs-network/twap-sdk";
import { useUserContext } from "../user-context";

export const useDeadline = () => {
  const currentTime = useTwapStore((s) => s.state.currentTime);
  const {
    duration: { value },
  } = useUserContext();

  return useMemo(() => getDeadline(currentTime, value), [currentTime, value]);
};
