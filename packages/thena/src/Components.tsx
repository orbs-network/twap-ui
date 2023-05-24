import { memo, ReactNode, useCallback, useState } from "react";
import { parseToken, useAdapterContext } from "./hooks";
import { ThenaRawToken } from "./types";
import { Components, useTwapContext, Styles as TwapStyles, TWAPTokenSelectProps, hooks } from "@orbs-network/twap-ui";
import {
  StyledBalance,
  StyledCard,
  StyledContainer,
  StyledOrderSummary,
  StyledPanelInput,
  StyledPercentSelector,
  StyledSubmit,
  StyledTokenPanelTop,
  StyledTokenSelect,
} from "./styles";

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const { TokenSelectModal, dappTokens } = useAdapterContext();

  return (
    <TokenSelectModal
      otherAsset={props.dstTokenSelected}
      selectedAsset={props.srcTokenSelected}
      setSelectedAsset={props.onSelect}
      popup={props.isOpen}
      setPopup={props.onClose}
      baseAssets={dappTokens}
      setOtherAsset={props.onSelect}
    />
  );
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  const { onSrcTokenSelected, onDstTokenSelected } = useAdapterContext();

  return (
    <Components.TokenSelectModal
      Component={memoizedTokenSelect}
      onSrcSelect={onSrcTokenSelected}
      onDstSelect={onDstTokenSelected}
      isOpen={open}
      onClose={onClose}
      isSrc={isSrcToken}
      parseToken={(token: ThenaRawToken) => parseToken(token)}
    />
  );
};

export const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);
  const translations = useTwapContext().translations;

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <>
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />

      <StyledContainer className="twap-token-panel">
        <StyledTokenPanelTop>
          <Components.Base.SmallLabel className="twap-token-panel-title">{isSrcToken ? translations.from : translations.to}</Components.Base.SmallLabel>
          <TwapStyles.StyledRowFlex justifyContent="flex-end">
            {isSrcToken && <SrcTokenPercentSelector />}
            <StyledBalance isSrc={isSrcToken} />
          </TwapStyles.StyledRowFlex>
        </StyledTokenPanelTop>
        <Card>
          <TwapStyles.StyledColumnFlex gap={16}>
            <TwapStyles.StyledRowFlex justifyContent="space-between">
              <TwapStyles.StyledColumnFlex gap={0}>
                <StyledPanelInput placeholder="0.00" isSrc={isSrcToken} />
                <Components.TokenUSD isSrc={isSrcToken} />
              </TwapStyles.StyledColumnFlex>
              <StyledTokenSelect hideArrow={false} isSrc={isSrcToken} onClick={() => setTokenListOpen(true)} />
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
        </Card>
      </StyledContainer>
    </>
  );
};

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const { isDarkTheme } = useAdapterContext();
  return (
    <StyledCard isDarkTheme={isDarkTheme ? 1 : 0} className={`twap-card ${className}`}>
      <div className="twap-card-children">{children}</div>
    </StyledCard>
  );
};

export const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions().onPercentClick;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <StyledPercentSelector className="twap-percent-selector">
      <button onClick={() => onClick(0.25)}>25%</button>
      <button onClick={() => onClick(0.5)}>50%</button>
      <button onClick={() => onClick(0.75)}>75%</button>
      <button onClick={() => onClick(1)}>100%</button>
    </StyledPercentSelector>
  );
};

export const OrderSummary = ({ children }: { children: ReactNode }) => {
  const { isDarkTheme } = useAdapterContext();
  return (
    <StyledOrderSummary isDarkMode={isDarkTheme ? 1 : 0}>
      <TwapStyles.StyledColumnFlex gap={14}>
        <TwapStyles.StyledColumnFlex gap={14}>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay isSrc={true} />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryLimitPrice />
          </Components.Base.Card>
          <Components.Base.Card>{children}</Components.Base.Card>
          <Components.Base.Card>
            <TwapStyles.StyledColumnFlex gap={10}>
              <Components.DisclaimerText />
            </TwapStyles.StyledColumnFlex>
          </Components.Base.Card>
        </TwapStyles.StyledColumnFlex>
        <Components.Base.Card>
          <TwapStyles.StyledColumnFlex gap={12}>
            <Components.AcceptDisclaimer />
            <Components.OutputAddress />
          </TwapStyles.StyledColumnFlex>
        </Components.Base.Card>
        <StyledSubmit />
      </TwapStyles.StyledColumnFlex>
    </StyledOrderSummary>
  );
};
