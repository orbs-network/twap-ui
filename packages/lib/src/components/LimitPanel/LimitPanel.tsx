import { styled } from "styled-components";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Icon, Label, NumericInput, TokenDisplay } from "../base";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import BN from "bignumber.js";
import React, { createContext, FC, ReactNode, useContext, useMemo } from "react";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/lib";
import { LimitPriceZeroButtonProps, LimitPricePercentProps, LimitPriceTitleProps, LimitPriceTokenSelectProps, LimitPriceInputProps } from "../../types";
import { useTwapContext as useTwapContextUI, useLimitPriceInput } from "@orbs-network/twap-ui-sdk";
import { useTwapContext } from "../../context/context";
import { LimitSwitch } from "./LimitSwitch";

const useIsMarketOrder = () => {
  return useTwapContextUI().derivedValues.isMarketOrder;
};

interface Shared {
  onSrcSelect: () => void;
  onDstSelect: () => void;
  Components?: {
    PercentButton?: FC<LimitPricePercentProps>;
    ZeroButton?: FC<LimitPriceZeroButtonProps>;
    Title?: FC<LimitPriceTitleProps>;
    TokenSelect?: FC<LimitPriceTokenSelectProps>;
    Input?: FC<LimitPriceInputProps>;
  };
  styles?: {
    percentButtonsGap: string;
  };
}

const DefaultInput = ({ isLoading, onChange, value }: { isLoading?: boolean; onChange: (value: string) => void; value: string }) => {
  return <NumericInput disabled={isLoading} onChange={onChange} value={value} />;
};

const DefaultTokenSelect = (props: LimitPriceTokenSelectProps) => {
  return <StyledTokenSelect className="twap-limit-panel-token-select" logo={props.token?.logoUrl} symbol={props.token?.symbol} onClick={props.onClick} />;
};

const StyledTokenSelect = styled(TokenDisplay)({
  fontSize: 14,
  cursor: "pointer",
  ".twap-token-logo": {
    width: "20px",
    height: "20px",
  },
});

const DefaultTitle = (props: LimitPriceTitleProps) => {
  return (
    <StyledDefaultTitle className="twap-limit-panel-title">
      <StyledText>{props.textLeft}</StyledText>
      <TokenDisplay symbol={props.token?.symbol} logo={props.token?.logoUrl} onClick={props.onTokenClick} />
      <StyledText>{props.textRight}</StyledText>
    </StyledDefaultTitle>
  );
};
const StyledDefaultTitle = styled(StyledRowFlex)({
  width: "auto",
  flex: 1,
  gap: 5,
  justifyContent: "flex-start",
  fontSize: 14,
  ".twap-token-display": {
    cursor: "pointer",
  },
  ".twap-token-logo": {
    width: "20px",
    height: "20px",
  },
});

const DefaultZeroButton = ({ onClick, text }: LimitPriceZeroButtonProps) => {
  return (
    <StyledDefaultZeroButton className="twap-limit-panel-zero-btn">
      <button onClick={onClick} className="twap-limit-panel-percent-button twap-limit-panel-zero-btn-left">
        {text}
      </button>
      <button onClick={onClick} className="twap-limit-panel-percent-button twap-limit-panel-zero-btn-right">
        X
      </button>
    </StyledDefaultZeroButton>
  );
};

const StyledDefaultZeroButton = styled(StyledRowFlex)({
  width: "auto",
  gap: 2,
});

const DefaultPercentButton = ({ text, onClick, selected }: LimitPricePercentProps) => {
  return (
    <button className={`twap-limit-panel-percent-button  ${selected ? "twap-limit-panel-percent-button-selected" : ""}`} onClick={onClick}>
      {text}
    </button>
  );
};

export interface LimitPanelProps extends Shared {
  className?: string;
}

const defaultPercent = [1, 5, 10];

const Context = createContext({} as Shared);

const useLimitPanelContext = () => useContext(Context);

export const LimitPanel = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  const hide = useShouldWrapOrUnwrapOnly();
  const isMarketOrder = useIsMarketOrder();

  if (isMarketOrder) return null;

  if (hide) return null;

  return <StyledContainer className={className}>{children}</StyledContainer>;
};

const StyledContainer = styled("div")({
  width: "100%",
});

function Main({ className = "", onSrcSelect, onDstSelect, Components, styles }: LimitPanelProps) {
  const isMarketOrder = useIsMarketOrder();

  if (isMarketOrder) return null;
  return (
    <Context.Provider value={{ onSrcSelect, onDstSelect, Components, styles }}>
      <Container className={`twap-limit-panel ${className}`}>
        <StyledRowFlex style={{ justifyContent: "space-between" }}>
          <Title />
          <InvertPrice />
        </StyledRowFlex>
        <StyledRowFlex style={{ justifyContent: "space-between" }}>
          <Input />
          <TokenSelect />
        </StyledRowFlex>
        <PercentSelector />
      </Container>
    </Context.Provider>
  );
}

const Input = () => {
  const { Components } = useLimitPanelContext();
  const { value, onChange, isLoading } = useLimitPriceInput();
  const isMarketOrder = useIsMarketOrder();

  return (
    <StyledInputContainer>
      <div style={{ opacity: isMarketOrder ? 0 : 1, pointerEvents: isMarketOrder ? "none" : "all" }}>
        {Components?.Input ? (
          <Components.Input onChange={onChange} value={value} isLoading={isLoading} />
        ) : (
          <DefaultInput onChange={onChange} value={value} isLoading={isLoading} />
        )}
      </div>
    </StyledInputContainer>
  );
};

const StyledInputContainer = styled("div")({
  position: "relative",
  flex: 1,
});

const usePercent = () => {
  const inverted = useTwapContextUI().state.isInvertedLimitPrice;
  return useMemo(() => {
    if (inverted) {
      return defaultPercent.map((it) => -it).map((it) => it.toString());
    }
    return defaultPercent.map((it) => it.toString());
  }, [inverted]);
};

const PercentSelector = () => {
  const percent = usePercent();
  const styles = useLimitPanelContext().styles;
  const disabled = false;
  return (
    <StyledPercentContainer
      className="twap-limit-panel-percent-select"
      style={{ pointerEvents: disabled ? "none" : "all", gap: styles?.percentButtonsGap || 5, opacity: disabled ? 0.8 : 1 }}
    >
      <ZeroButton />
      {percent.map((it) => {
        return <PercentButton percent={it} key={it} />;
      })}
    </StyledPercentContainer>
  );
};

const PercentButton = ({ percent }: { percent: string }) => {
  const {
    state,
    derivedValues: { price, priceDiffFromMarket },
    actionHandlers,
  } = useTwapContextUI();
  const { isInvertedLimitPrice: inverted, isMarketOrder, limitPricePercent } = state;

  const Components = useLimitPanelContext().Components;

  const selected = useMemo(() => {
    const p = limitPricePercent || priceDiffFromMarket;
    if (BN(price || 0).isZero()) {
      return false;
    }

    return BN(p || 0).eq(percent);
  }, [limitPricePercent, percent, isMarketOrder, price, priceDiffFromMarket]);

  const prefix = percent === "0" ? "" : inverted ? "-" : !inverted && "+";
  if (Components?.PercentButton) {
    return <Components.PercentButton onClick={() => actionHandlers.onPricePercentClick(percent)} selected={selected} text={`${prefix}${Math.abs(Number(percent))}%`} />;
  }
  return <DefaultPercentButton onClick={() => actionHandlers.onPricePercentClick(percent)} selected={selected} text={`${prefix}${Math.abs(Number(percent))}%`} />;
};

const ZeroButton = () => {
  const {
    state: { limitPricePercent },
    derivedValues: { priceDiffFromMarket },
    actionHandlers: { onPricePercentClick },
  } = useTwapContextUI();
  const Components = useLimitPanelContext().Components;
  const percent = usePercent();
  const showZero = useMemo(() => {
    if (BN(priceDiffFromMarket).isZero()) {
      return false;
    }

    if (BN(limitPricePercent || 0).gt(0)) {
      return false;
    }

    if (limitPricePercent && percent.includes(limitPricePercent)) {
      return false;
    }
    if (priceDiffFromMarket && percent.includes(priceDiffFromMarket)) {
      return false;
    }

    return true;
  }, [priceDiffFromMarket, limitPricePercent, percent]);

  if (showZero) {
    return Components?.ZeroButton ? (
      <Components.ZeroButton onClick={() => onPricePercentClick("0")} text={`${priceDiffFromMarket}%`} />
    ) : (
      <DefaultZeroButton onClick={() => onPricePercentClick("0")} text={`${priceDiffFromMarket}%`} />
    );
  }
  return <PercentButton percent="0" />;
};

const TokenSelect = () => {
  const {
    state: { srcToken, destToken, isInvertedLimitPrice },
  } = useTwapContextUI();
  const inverted = isInvertedLimitPrice;
  const Components = useLimitPanelContext().Components;
  const token = inverted ? srcToken : destToken;
  const { onDstSelect, onSrcSelect } = useLimitPanelContext();
  if (Components?.TokenSelect) {
    return <Components.TokenSelect isSrcToken={!!inverted} token={token} onClick={inverted ? onSrcSelect : onDstSelect} />;
  }
  return <DefaultTokenSelect isSrcToken={!!inverted} token={token} onClick={inverted ? onSrcSelect : onDstSelect} />;
};

const InvertPrice = () => {
  const onInvert = useTwapContextUI().actionHandlers.onInvertPrice();

  return (
    <StyledInvertprice onClick={onInvert} className="twap-limit-panel-invert-button">
      <Icon icon={<RiArrowUpDownLine size="16px" />} />
    </StyledInvertprice>
  );
};

const Title = () => {
  const { onDstSelect, onSrcSelect } = useLimitPanelContext();
  const Components = useLimitPanelContext().Components;
  const { translations: t } = useTwapContext();
  const { state } = useTwapContextUI();

  const { isInvertedLimitPrice: inverted, srcToken, destToken } = state;
  const token = inverted ? destToken : srcToken;

  if (Components?.Title) {
    return <Components.Title isSrcToken={!inverted} textLeft={t.swapOne} textRight={t.isWorth} token={token} onTokenClick={inverted ? onDstSelect : onSrcSelect} />;
  }

  return <DefaultTitle isSrcToken={!inverted} textLeft={t.swapOne} textRight={t.isWorth} token={token} onTokenClick={inverted ? onDstSelect : onSrcSelect} />;
};

const StyledInvertprice = styled("div")({
  cursor: "pointer",
  "&:hover": {
    opacity: 0.8,
  },
});

const StyledPercentContainer = styled(StyledRowFlex)({
  justifyContent: "flex-start",
  alignItems: "center",
  flexWrap: "wrap",
});

const LimitPriceLabel = () => {
  const { translations: t, isLimitPanel } = useTwapContext();
  const isMarketOrder = useIsMarketOrder();

  return (
    <Label>
      <Label.Text text={!isLimitPanel ? t.price : t.limitPrice} />
      <Label.Info text={isMarketOrder ? t.marketPriceTooltip : isLimitPanel ? t.limitPriceTooltipLimitPanel : t.limitPriceTooltip} />
    </Label>
  );
};

LimitPanel.Input = Input;
LimitPanel.TokenSelect = TokenSelect;
LimitPanel.PercentSelector = PercentSelector;
LimitPanel.Title = Title;
LimitPanel.Switch = LimitSwitch;
LimitPanel.InvertPrice = InvertPrice;
LimitPanel.Label = LimitPriceLabel;
LimitPanel.Main = Main;

const Container = styled(StyledColumnFlex)({
  ".MuiSkeleton-root": {
    left: 0,
    right: "unset",
  },
});
