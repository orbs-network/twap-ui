import { Box, styled } from "@mui/material";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { Icon, NumericInput, TokenDisplay } from "../base";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import BN from "bignumber.js";
import { createContext, FC, useContext, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { useIsMarketOrder, useLimitPrice, useLimitPricePercentDiffFromMarket } from "../../hooks/hooks";
import { LimitPriceZeroButtonProps, LimitPricePercentProps, LimitPriceTitleProps, LimitPriceTokenSelectProps, LimitPriceInputProps } from "../../types";
import { useOnLimitPercentageClick } from "./hooks";
import { amountUiV2, formatDecimals } from "../../utils";
import { useTwapContext } from "../../context/context";
import { MarketPriceWarning } from "../Components";
import { stateActions } from "../../context/actions";
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

const DefaultInput = ({ isLoading, onChange, value }: { isLoading: boolean; onChange: (value: string) => void; value: string }) => {
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
  return <button onClick={onClick}>{text}</button>;
};

const DefaultPercentButton = ({ text, onClick, selected }: LimitPricePercentProps) => {
  return <button onClick={onClick}>{text}</button>;
};

export interface LimitPanelProps extends Shared {
  className?: string;
}

const defaultPercent = [1, 5, 10];

const Context = createContext({} as Shared);

const useLimitPanelContext = () => useContext(Context);

export function LimitPanel({ className = "", onSrcSelect, onDstSelect, Components, styles }: LimitPanelProps) {
  const isMarketOrder = useIsMarketOrder();
  if (isMarketOrder) {
    return <MarketPriceWarning />;
  }

  return (
    <Context.Provider value={{ onSrcSelect, onDstSelect, Components, styles }}>
      <Container className={`twap-limit-panel ${className}`}>
        <StyledRowFlex justifyContent="space-between">
          <Title />
          <InvertPrice />
        </StyledRowFlex>
        <StyledRowFlex justifyContent="space-between">
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
  const { state } = useTwapContext();
  const { isMarketOrder, isInvertedLimitPrice, isCustomLimitPrice, customLimitPrice, dstToken } = state;
  const { isLoading, limitPrice } = useLimitPrice();
  const onChange = stateActions.useOnLimitChange();

  const limitPriceUi = useMemo(() => {
    if (isCustomLimitPrice) {
      return customLimitPrice;
    }
    let res = amountUiV2(dstToken?.decimals, limitPrice);

    if (isInvertedLimitPrice) {
      res = BN(1)
        .div(res || 0)
        .toString();
    }

    return formatDecimals(res);
  }, [customLimitPrice, isCustomLimitPrice, isInvertedLimitPrice, limitPrice, dstToken]);

  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(limitPriceUi || "");
  }, [limitPriceUi]);

  return (
    <StyledInputContainer>
      {isMarketOrder && <StyledAnyPrice className="twap-limit-panel-market-price">Get text from Eran</StyledAnyPrice>}
      <div style={{ opacity: isMarketOrder ? 0 : 1, pointerEvents: isMarketOrder ? "none" : "all" }}>
        {Components?.Input ? (
          <Components.Input isLoading={isLoading} onChange={onChange} value={value} />
        ) : (
          <DefaultInput isLoading={isLoading} onChange={onChange} value={value} />
        )}
      </div>
    </StyledInputContainer>
  );
};

const StyledInputContainer = styled("div")({
  position: "relative",
  flex: 1,
});

const StyledAnyPrice = styled(StyledText)({
  width: "auto",
  flex: 1,
  justifyContent: "flex-start",
  position: "absolute",
  left: 0,
  top: "50%",
  transform: "translateY(-50%)",
  alignItems: "center",
});

const usePercent = () => {
  const inverted = useTwapContext().state.isInvertedLimitPrice;
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
  const disabled = useLimitPrice().isLoading;
  return (
    <StyledPercentContainer style={{ pointerEvents: disabled ? "none" : "all", gap: styles?.percentButtonsGap || 5, opacity: disabled ? 0.8 : 1 }}>
      <ZeroButton />
      {percent.map((it) => {
        return <PercentButton percent={it} key={it} />;
      })}
    </StyledPercentContainer>
  );
};

const PercentButton = ({ percent }: { percent: string }) => {
  const { state } = useTwapContext();
  const { isInvertedLimitPrice: inverted, isMarketOrder, limitPricePercent } = state;
  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();

  const limitPrice = useLimitPrice().limitPrice;
  const Components = useLimitPanelContext().Components;

  const onPercentageChange = useOnLimitPercentageClick();

  const selected = useMemo(() => {
    const p = limitPricePercent || priceDeltaPercentage;
    if (BN(limitPrice || 0).isZero()) {
      return false;
    }

    return BN(p || 0).eq(percent);
  }, [limitPricePercent, percent, isMarketOrder, limitPrice, priceDeltaPercentage]);

  const prefix = percent === "0" ? "" : inverted ? "-" : !inverted && "+";
  if (Components?.PercentButton) {
    return <Components.PercentButton onClick={() => onPercentageChange(percent)} selected={selected} text={`${prefix}${Math.abs(Number(percent))}%`} />;
  }
  return <DefaultPercentButton onClick={() => onPercentageChange(percent)} selected={selected} text={`${prefix}${Math.abs(Number(percent))}%`} />;
};

const ZeroButton = () => {
  const limitPricePercent = useTwapContext().state.limitPricePercent;
  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();
  const onPercentageChange = useOnLimitPercentageClick();
  const Components = useLimitPanelContext().Components;
  const percent = usePercent();
  const showZero = useMemo(() => {
    if (BN(priceDeltaPercentage).isZero()) {
      return false;
    }

    if (BN(limitPricePercent || 0).gt(0)) {
      return false;
    }

    if (limitPricePercent && percent.includes(limitPricePercent)) {
      return false;
    }
    if (priceDeltaPercentage && percent.includes(priceDeltaPercentage)) {
      return false;
    }

    return true;
  }, [priceDeltaPercentage, limitPricePercent, percent]);

  if (showZero) {
    return Components?.ZeroButton ? (
      <Components.ZeroButton onClick={() => onPercentageChange("0")} text={`${priceDeltaPercentage}%`} />
    ) : (
      <DefaultZeroButton onClick={() => onPercentageChange("0")} text={`${priceDeltaPercentage}%`} />
    );
  }
  return <PercentButton percent="0" />;
};

const TokenSelect = () => {
  const { isInvertedLimitPrice: inverted, srcToken, dstToken } = useTwapContext().state;
  const Components = useLimitPanelContext().Components;
  const token = inverted ? srcToken : dstToken;
  const { onDstSelect, onSrcSelect } = useLimitPanelContext();
  if (Components?.TokenSelect) {
    return <Components.TokenSelect isSrcToken={!!inverted} token={token} onClick={inverted ? onSrcSelect : onDstSelect} />;
  }
  return <DefaultTokenSelect isSrcToken={!!inverted} token={token} onClick={inverted ? onSrcSelect : onDstSelect} />;
};

const InvertPrice = () => {
  const onInvert = stateActions.useInvertLimit();

  return (
    <StyledInvertprice onClick={onInvert} className="twap-limit-panel-invert-button">
      <Icon icon={<RiArrowUpDownLine size="16px" />} />
    </StyledInvertprice>
  );
};

const Title = () => {
  const { onDstSelect, onSrcSelect } = useLimitPanelContext();
  const Components = useLimitPanelContext().Components;
  const { translations: t, state } = useTwapContext();
  const { isInvertedLimitPrice: inverted, srcToken, dstToken } = state;
  const token = inverted ? dstToken : srcToken;
  if (Components?.Title) {
    return <Components.Title isSrcToken={!inverted} textLeft={t.swapOne} textRight={t.isWorth} token={token} onTokenClick={inverted ? onDstSelect : onSrcSelect} />;
  }

  return <DefaultTitle isSrcToken={!inverted} textLeft={t.swapOne} textRight={t.isWorth} token={token} onTokenClick={inverted ? onDstSelect : onSrcSelect} />;
};

const StyledInvertprice = styled(Box)({
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

LimitPanel.Input = Input;
LimitPanel.TokenSelect = TokenSelect;
LimitPanel.PercentSelector = PercentSelector;
LimitPanel.Title = Title;

const Container = styled(StyledColumnFlex)({
  ".MuiSkeleton-root": {
    left: 0,
    right: "unset",
  },
});
