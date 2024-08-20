import type { SVGProps } from "react";
const SvgArrowOutward = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} fill="none" {...props}>
    <path
      fill="#453936"
      fillRule="evenodd"
      d="M13 5a1 1 0 1 0 0 2h2.586l-6.293 6.293a1 1 0 1 0 1.414 1.414L17 8.414V11a1 1 0 1 0 2 0V5h-6m-3 2a5 5 0 0 0-5 5v2a5 5 0 0 0 5 5h2a5 5 0 0 0 5-5 1 1 0 1 0-2 0 3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3 1 1 0 1 0 0-2"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgArrowOutward;
