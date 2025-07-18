import { AiOutlineQuestionCircle } from "@react-icons/all-files/ai/AiOutlineQuestionCircle";
import { useTwapContext } from "../context";
import { Tooltip } from "./Tooltip";

interface Props {
  tooltip?: string;
  className?: string;
  text: string;
}

export function Label({ tooltip, className = "", text }: Props) {
  const { components } = useTwapContext();

  if (components.Label) {
    return <components.Label text={text || ""} tooltip={tooltip} />;
  }

  return (
    <div className={`twap-label ${className}`}>
      <p className="twap-label-text">{text}</p>
      {tooltip && (
        <Tooltip tooltipText={tooltip}>
          <AiOutlineQuestionCircle />
        </Tooltip>
      )}
    </div>
  );
}
