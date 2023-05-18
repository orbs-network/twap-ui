import { memo, ReactNode, useCallback, useState } from "react";
import { parseToken, useAdapterContext } from "./hooks";
import { ChronosRawToken } from "./types";
import { Components, useTwapContext, Styles as TwapStyles, TWAPTokenSelectProps, hooks } from "@orbs-network/twap-ui";
import { StyledBalance, StyledCard, StyledChange } from "./styles";

const ModifiedTokenSelectModal = (props: TWAPTokenSelectProps) => {
  const TokenSelectModal = useAdapterContext().TokenSelectModal;

  return <TokenSelectModal selectToken={props.onSelect} open={props.isOpen} setOpen={props.onClose} />;
};
const memoizedTokenSelect = memo(ModifiedTokenSelectModal);

const TokenSelect = ({ open, onClose, isSrcToken }: { open: boolean; onClose: () => void; isSrcToken?: boolean }) => {
  const { onSrcTokenSelected, onDstTokenSelected, getTokenLogoURL } = useAdapterContext();

  return (
    <Components.TokenSelectModal
      Component={memoizedTokenSelect}
      onSrcSelect={onSrcTokenSelected}
      onDstSelect={onDstTokenSelected}
      isOpen={open}
      onClose={onClose}
      isSrc={isSrcToken}
      parseToken={(token: ChronosRawToken) => parseToken(getTokenLogoURL, token)}
    />
  );
};

export const TokenPanel = ({ isSrcToken }: { isSrcToken?: boolean }) => {
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const onClose = useCallback(() => {
    setTokenListOpen(false);
  }, []);

  return (
    <Container className="twap-token-panel">
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />
      <TwapStyles.StyledColumnFlex gap={16}>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <div className="twap-token-select" style={{ cursor: "pointer" }} onClick={() => setTokenListOpen(true)}>
            <Components.TokenLogo isSrc={isSrcToken} />
          </div>
          <TwapStyles.StyledColumnFlex gap={5} style={{ width: "unset", flex: 1 }}>
            <Components.TokenInput placeholder="0.00" isSrc={isSrcToken} />
            <TwapStyles.StyledRowFlex gap={16} justifyContent="flex-start">
              <Components.TokenSymbol onClick={() => setTokenListOpen(true)} hideNull={true} isSrc={isSrcToken} />

              {isSrcToken && <SrcTokenPercentSelector />}
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
          <StyledBalance>
            <Components.TokenBalance label="Available balance" showSymbol={true} isSrc={isSrcToken} />
          </StyledBalance>
        </TwapStyles.StyledRowFlex>
        {/* <Components.TokenUSD isSrc={isSrcToken} /> */}
      </TwapStyles.StyledColumnFlex>
    </Container>
  );
};

const percent = [0.25, 0.5, 0.75, 1];

export const SrcTokenPercentSelector = () => {
  const onPercentClick = hooks.useCustomActions().onPercentClick;
  const translations = useTwapContext().translations;

  const onClick = (value: number) => {
    onPercentClick(value);
  };

  return (
    <TwapStyles.StyledRowFlex gap={4} justifyContent="flex-start" className="twap-percent-selector" width="fit-content">
      {percent.map((it) => {
        TwapStyles.StyledRowFlex;
        const text = it === 1 ? translations.max : `${it * 100}%`;
        return (
          <Container key={it}>
            <button onClick={() => onClick(it)}>{text}</button>
          </Container>
        );
      })}
    </TwapStyles.StyledRowFlex>
  );
};

export const OrderSummary = ({ children }: { children: ReactNode }) => {
  return (
    <Components.OrderSummaryModalContainer className="twap-ui-chronos-modal">
      <TwapStyles.StyledColumnFlex gap={14}>
        <TwapStyles.StyledColumnFlex gap={14}>
          <Container>
            <Components.OrderSummaryTokenDisplay isSrc={true} />
          </Container>
          <Container>
            <Components.OrderSummaryTokenDisplay />
          </Container>
          <Components.OrderSummaryLimitPrice />
          <Container>{children}</Container>
          <Container>
            <TwapStyles.StyledColumnFlex gap={10}>
              <Components.DisclaimerText />
            </TwapStyles.StyledColumnFlex>
          </Container>
        </TwapStyles.StyledColumnFlex>
        <Container>
          <TwapStyles.StyledColumnFlex gap={12}>
            <Components.AcceptDisclaimer />
            <Components.OutputAddress />
          </TwapStyles.StyledColumnFlex>
        </Container>
        <Components.SubmitButton />
      </TwapStyles.StyledColumnFlex>
    </Components.OrderSummaryModalContainer>
  );
};

export const ChangeTokensOrder = () => {
  return (
    <StyledChange>
      <Components.ChangeTokensOrder />
    </StyledChange>
  );
};

export const Container = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <StyledCard className={className}>
      <div className="twap-card-children">{children}</div>
    </StyledCard>
  );
};
