import { memo, ReactNode, useCallback, useState } from "react";
import { parseToken, useAdapterContext } from "./hooks";
import { ChronosRawToken } from "./types";
import { Components, useTwapContext, Styles as TwapStyles, TWAPTokenSelectProps, hooks } from "@orbs-network/twap-ui";
import {
  StyledChangeOrder,
  StyledMarketPrice,
  StyledPanelRight,
  StyledPercentSelect,
  StyledSubmit,
  StyledTokenInputBalance,
  StyledTokenPanel,
  StyledTokenPanelInput,
  StyledTokenSelect,
  StyledUSD,
} from "./styles";
import { IoWalletOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
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
    <StyledTokenPanel className="twap-token-panel">
      <TokenSelect onClose={onClose} open={tokenListOpen} isSrcToken={isSrcToken} />

      <StyledTokenSelect onClick={() => setTokenListOpen(true)}>
        <Components.TokenLogo isSrc={isSrcToken} />
        <TwapStyles.StyledRowFlex gap={6}>
          <Components.TokenSymbol isSrc={isSrcToken} />
          <IoIosArrowDown size={12} />
        </TwapStyles.StyledRowFlex>
      </StyledTokenSelect>
      <StyledPanelRight>
        <StyledTokenPanelInput placeholder="0.00" isSrc={isSrcToken} />
        <TwapStyles.StyledRowFlex justifyContent="flex-start" className="twap-token-panel-flex-right-bottom">
          <USD>
            <Components.TokenUSD onlyValue={true} isSrc={isSrcToken} emptyUi={<>0.00</>} />
          </USD>

          {isSrcToken && <SrcTokenPercentSelector />}
        </TwapStyles.StyledRowFlex>
      </StyledPanelRight>
      <StyledTokenInputBalance>
        <IoWalletOutline />
        <Components.TokenBalance emptyUi={<>0.00</>} label="Balance:" showSymbol={true} isSrc={isSrcToken} />
      </StyledTokenInputBalance>
    </StyledTokenPanel>
  );
};

export const MarketPrice = () => {
  return (
    <StyledMarketPrice>
      <Components.MarketPrice />
    </StyledMarketPrice>
  );
};

export const USD = ({ children }: { children: ReactNode }) => {
  return (
    <StyledUSD>
      <figure>$</figure>
      {children}
    </StyledUSD>
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
    <StyledPercentSelect>
      {percent.map((it) => {
        TwapStyles.StyledRowFlex;
        const text = it === 1 ? translations.max : `${it * 100}%`;
        return (
          <button key={it} onClick={() => onClick(it)}>
            {text}
          </button>
        );
      })}
    </StyledPercentSelect>
  );
};

export const OrderSummary = ({ children }: { children: ReactNode }) => {
  return (
    <Components.OrderSummaryModalContainer className="twap-ui-chronos-modal">
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
          <Components.Base.Card style={{ paddingRight: 5 }}>
            <Components.DisclaimerText />
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
    </Components.OrderSummaryModalContainer>
  );
};

export const ChangeTokensOrder = () => {
  return (
    <StyledChangeOrder>
      <Components.ChangeTokensOrder />
    </StyledChangeOrder>
  );
};
