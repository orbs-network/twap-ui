import { CSSProperties } from "react";
import { IconType } from "react-icons";

interface Props {
  icon: IconType;
  color?: string;
  style?: CSSProperties;
}

const Icon = ({ icon, color = "#4D6FF3", style = {} }: Props) => {
  const IconElement = icon;
  return <IconElement style={{ ...style, color }} />;
};

export default Icon;
