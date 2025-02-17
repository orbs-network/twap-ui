import React, { useCallback, useState } from "react";
import { useWidgetContext } from "../..";
import { TokenLogo } from "../../components/base";
import { StyledText } from "../../styles";
import { useTokenPanel } from "../hooks";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";

export const TokenSelect = ({ className = "", isSrcToken }: { className?: string; isSrcToken?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { srcToken, dstToken, uiPreferences, translations } = useWidgetContext();
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
      <div className={`twap-token-select ${className} ${!token ? "twap-token-select-not-selected" : "twap-token-select-selected"}`} onClick={onClick}>
        {token && <TokenLogo logo={token?.logoUrl} />}
        <StyledText className="twap-token-select-symbol">{token ? token.symbol : translations.selectToken}</StyledText>
        {uiPreferences.tokenSelect?.icon || <IoIosArrowDown className="twap-token-select-icon" />}
      </div>
    </>
  );
};
