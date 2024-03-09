import { Portal as MuiPortal } from "@mui/material";
import { useEffect, useState } from "react";
import { useTwapContext } from "../../context";

function Portal({ children, id }: { children: React.ReactNode; id?: string }) {
  const [container, setContainer] = useState<Element | null>(null);
  const isMobile = useTwapContext().isMobile;
  useEffect(() => {
    if (!id) return;
    setContainer(document.getElementById(id));
  }, [id, isMobile]);

  if (!container) return null;
  return <MuiPortal container={container}>{children}</MuiPortal>;
}

export default Portal;
