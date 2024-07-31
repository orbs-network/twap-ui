import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

export const Portal: React.FC<PortalProps> = ({ children, containerId }) => {
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);

  useEffect(() => {
    const containerElement = containerId ? document.getElementById(containerId) : document.body;
    setPortalContainer(containerElement);
  }, [containerId]);

  if (!portalContainer) return null;

  return createPortal(children, portalContainer);
};
