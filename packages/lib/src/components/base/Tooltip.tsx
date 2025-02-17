import { TooltipProps } from "../../types";
import { useWidgetContext } from "../../widget/widget-context";

export const Tooltip = (props: TooltipProps) => {
  const Tooltip = useWidgetContext().components.Tooltip;

  if (!Tooltip) {
    return <>{props.children}</>;
  }

  return <Tooltip tooltipText={props.tooltipText}>{props.children}</Tooltip>;
};
