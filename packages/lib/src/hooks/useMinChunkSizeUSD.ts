import { useWidgetContext } from "..";

export const useMinChunkSizeUsd = () => {
  const { config } = useWidgetContext();
  return Math.max(config.minChunkSizeUsd || 0, config?.minChunkSizeUsd || 0);
};
