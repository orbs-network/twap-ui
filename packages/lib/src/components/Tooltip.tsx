import { useTwapContext } from "../context";
import { TooltipProps } from "../types";

export const Tooltip = (props: TooltipProps) => {
  const Tooltip = useTwapContext().components.Tooltip;

  if (!Tooltip) {
    return <>{props.children}</>;
  }

  return <Tooltip tooltipText={props.tooltipText}>{props.children}</Tooltip>;
};
