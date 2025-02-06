import React, { ReactElement, useCallback, useState } from "react";
import { useWidgetContext } from "../..";
import { TokenLogo } from "../../components/base";
import { StyledText } from "../../styles";

export const TokenSelect = ({ className = "", isSrcToken }: { className?: string; isSrcToken?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { srcToken, dstToken, uiPreferences } = useWidgetContext();
  const { components, onSrcTokenSelected, onDstTokenSelected } = useWidgetContext();
  const onClose = useCallback(() => setIsOpen(false), []);
  const token = isSrcToken ? srcToken : dstToken;

  const onSelect = useCallback(
    (token: any) => {
      isSrcToken ? onSrcTokenSelected?.(token) : onDstTokenSelected?.(token);
      onClose();
    },
    [isSrcToken, onSrcTokenSelected, onDstTokenSelected, onClose],
  );

  const onClick = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <>
      <components.TokensListModal onClose={onClose} isOpen={isOpen} isSrcToken={isSrcToken} onSelect={onSelect} />
      <div className={`twap-token-select ${className}`} onClick={onClick}>
        <TokenLogo logo={token?.logoUrl} />
        <StyledText>{token ? token.symbol : "Select"}</StyledText>
        {uiPreferences.tokenSelect?.icon}
      </div>
    </>
  );
};
