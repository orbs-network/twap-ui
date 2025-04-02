import React from "react";
import { LinkProps } from "../../types";
import { useTwapContext } from "../../context";

export const Link = ({ href, children }: LinkProps) => {
  const { components } = useTwapContext();
  const Link = components.Link;
  if (!Link) {
    return (
      <a href={href} target="_blank">
        {children}
      </a>
    );
  }
  return <Link href={href}>{children}</Link>;
};
