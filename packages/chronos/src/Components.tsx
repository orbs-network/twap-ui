import { memo, ReactNode, useCallback, useState } from "react";
import { parseToken, useAdapterContext } from "./hooks";
import { ChronosRawToken } from "./types";
import { Components, useTwapContext, Styles as TwapStyles, TWAPTokenSelectProps, hooks } from "@orbs-network/twap-ui";
import { StyledChange } from "./styles";

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
    <Components.Base.Card className="twap-token-panel">
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />
      <TwapStyles.StyledColumnFlex gap={16}>
        <TwapStyles.StyledRowFlex justifyContent="space-between">
          <div className="twap-token-select" style={{ cursor: "pointer" }} onClick={() => setTokenListOpen(true)}>
            <Components.TokenLogo isSrc={isSrcToken} />
          </div>
          <TwapStyles.StyledColumnFlex gap={5} style={{ width: "unset", flex: 1 }}>
            <Components.TokenInput placeholder="0.00" isSrc={isSrcToken} />
            <TwapStyles.StyledRowFlex gap={16} justifyContent="flex-start">
              <div onClick={() => setTokenListOpen(true)} style={{ cursor: "pointer" }}>
                <Components.TokenSymbol hideNull={true} isSrc={isSrcToken} />
              </div>
              {isSrcToken && <SrcTokenPercentSelector />}
            </TwapStyles.StyledRowFlex>
          </TwapStyles.StyledColumnFlex>
          <Components.TokenBalance label="Available balance" showSymbol={true} isSrc={isSrcToken} />
        </TwapStyles.StyledRowFlex>
        {/* <Components.TokenUSD isSrc={isSrcToken} /> */}
      </TwapStyles.StyledColumnFlex>
    </Components.Base.Card>
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
        const text = it === 1 ? translations.max : `${it * 100}%`;
        return (
          <Components.Base.Card key={it}>
            <button onClick={() => onClick(it)}>{text}</button>
          </Components.Base.Card>
        );
      })}
    </TwapStyles.StyledRowFlex>
  );
};

export const OrderSummary = ({ children }: { children: ReactNode }) => {
  return (
    <Components.OrderSummaryModalContainer>
      <TwapStyles.StyledColumnFlex gap={14}>
        <TwapStyles.StyledColumnFlex gap={14}>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay isSrc={true} />
          </Components.Base.Card>
          <Components.Base.Card>
            <Components.OrderSummaryTokenDisplay />
          </Components.Base.Card>
          <Components.OrderSummaryLimitPrice />
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
