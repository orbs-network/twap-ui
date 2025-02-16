import React, { useCallback, useState } from "react";
import { useWidgetContext } from "../..";
import { TokenLogo } from "../../components/base";
import { StyledText } from "../../styles";
import { useTokenPanel } from "../hooks";

export const TokenSelect = ({ className = "", isSrcToken }: { className?: string; isSrcToken?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { srcToken, dstToken, uiPreferences } = useWidgetContext();
  const TokensListModal = useWidgetContext().components.TokensListModal;
  const token = isSrcToken ? srcToken : dstToken;

  const onSelect = useTokenPanel(isSrcToken).onTokenSelect;
  const onClick = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);

  const onTokenSelect = useCallback(
    (token: any) => {
      onSelect(token);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <>
      {TokensListModal && <TokensListModal onClose={onClose} isOpen={isOpen} isSrcToken={isSrcToken} onSelect={onTokenSelect} />}
      <div className={`twap-token-select ${className}`} onClick={onClick}>
        <TokenLogo logo={token?.logoUrl} />
        <StyledText>{token ? token.symbol : "Select"}</StyledText>
        {uiPreferences.tokenSelect?.icon}
      </div>
    </>
  );
};
