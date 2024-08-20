import * as React from "react";
import type { SVGProps } from "react";
const SvgArrow = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={18} fill="none" {...props}>
    <path
      fill="#453936"
      d="M13.649 14.032a1 1 0 1 0-1.312-1.51l-1.38 1.2.39-5.573a1 1 0 1 0-1.996-.14l-.39 5.573-1.2-1.38a1 1 0 0 0-1.509 1.312l2.784 3.202.656.755.755-.656zm-6-9.924a1 1 0 0 1-1.312 1.51l-1.38-1.2.39 5.572a1 1 0 1 1-1.996.14l-.39-5.572-1.2 1.38A1 1 0 1 1 .253 4.626l2.784-3.202.656-.755.755.656z"
    />
  </svg>
);
export default SvgArrow;
