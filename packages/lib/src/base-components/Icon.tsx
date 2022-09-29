import { CSSProperties } from "react";
import { IconType } from "react-icons";

const Icon = ({ icon: IconElement, color = "#4D6FF3", style = {} }: { icon: IconType; color?: string; style?: CSSProperties }) => {
  return <IconElement style={{ ...style, color }} />;
};

export default Icon;
