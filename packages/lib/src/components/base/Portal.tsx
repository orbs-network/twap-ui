import { Portal as MuiPortal } from "@mui/material";

function Portal({ children, id }: { children: React.ReactNode; id?: string }) {
  if (!id) return null;
  return <MuiPortal container={() => document.getElementById(id)}>{children}</MuiPortal>;
}

export default Portal;
