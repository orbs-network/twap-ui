import React, { useEffect, useRef } from "react";

interface ClickAwayListenerProps {
  onClickAway: () => void;
  children: React.ReactNode;
}

export const ClickAwayListener: React.FC<ClickAwayListenerProps> = ({ onClickAway, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClickAway();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClickAway]);

  return <div ref={containerRef}>{children}</div>;
};
