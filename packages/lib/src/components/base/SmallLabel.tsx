import React, { CSSProperties, ReactNode } from "react";
import { Loader } from "./Loader";

function SmallLabel({ children, style, loading = false, className = "" }: { children?: string | ReactNode; style?: CSSProperties; loading?: boolean; className?: string }) {
  return (
    <div style={style} className={`twap-small-label ${className}`}>
      {loading ? <Loader /> : children}
    </div>
  );
}

export default SmallLabel;
