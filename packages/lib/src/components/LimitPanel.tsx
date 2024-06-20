import { Box, styled } from "@mui/material";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../styles";
import { useTwapStore } from "../store";
import { Icon, Label, NumericInput, Tooltip } from "./base";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import BN from "bignumber.js";
import { createContext, FC, useContext, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { useLimitPricePanel } from "../hooks";
import { LimitPriceZeroButtonProps, LimitPricePercentProps, LimitPriceTitleProps, LimitPriceTokenSelectProps } from "../types";

interface Shared {
  onSrcSelect: () => void;
  onDstSelect: () => void;
  isTWAP?: boolean;
  Components: {
    PercentButton: FC<LimitPricePercentProps>;
    ZeroButton: FC<LimitPriceZeroButtonProps>;
    Title: FC<LimitPriceTitleProps>;
    TokenSelect: FC<LimitPriceTokenSelectProps>;
    Input: FC<{ isLoading: boolean; onChange: (value: string) => void; value: string }>;
  };
  styles?: {
    percentButtonsGap: string;
  };
}

interface Props extends Shared {
  className?: string;
}

interface ContextProps extends Shared {
  limitPricePanel: ReturnType<typeof useLimitPricePanel>;
}

const defaultPercent = [1, 5, 10];

const Context = createContext({} as ContextProps);

const useLimitPanelContext = () => useContext(Context);

export function LimitPanel({ className = "", onSrcSelect, onDstSelect, Components, styles, isTWAP }: Props) {
  const limitPricePanel = useLimitPricePanel();

  return (
    <Context.Provider value={{ onSrcSelect, onDstSelect, Components, styles, limitPricePanel, isTWAP }}>
      <Container className={`twap-limit-panel ${className}`}>
        <StyledRowFlex justifyContent="flex-start">
          <Title />
          <InvertPrice />
        </StyledRowFlex>
        <StyledRowFlex>
          <Input />
          <TokenSelect />
        </StyledRowFlex>
        <PercentSelector />
      </Container>
    </Context.Provider>
  );
}

const Input = () => {
  const { limitPricePanel, Components } = useLimitPanelContext();
  const { onChange, limitPriceUi, isLoading, isMarketOrder } = limitPricePanel;
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(limitPriceUi || "");
  }, [limitPriceUi]);

  return (
    <StyledInputContainer>
      {isMarketOrder && (
        <StyledAnyPrice className="twap-limit-panel-market">
          <Label tooltipText="Any price">Any price</Label>
        </StyledAnyPrice>
      )}
      <div style={{ opacity: isMarketOrder ? 0 : 1, pointerEvents: isMarketOrder ? "none" : "all" }}>
        <Components.Input isLoading={isLoading} onChange={onChange} value={value} />
      </div>
    </StyledInputContainer>
  );
};

const StyledInputContainer = styled('div')({
    position: "relative",
})

const StyledAnyPrice = styled(StyledRowFlex)({
  width: "auto",
  flex: 1,
  justifyContent: "flex-start",
  position: "absolute",
  left: 0,
  top: '50%',
    transform: 'translateY(-50%)',
  alignItems: "center",
});

const usePercent = () => {
  const { inverted } = useLimitPanelContext().limitPricePanel;
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
  const disabled = useLimitPanelContext().limitPricePanel.isLoading;
  return (
    <StyledPercentContainer style={{ pointerEvents: disabled ? "none" : "all", gap: styles?.percentButtonsGap || 5, opacity: disabled ? 0.8 : 1 }}>
      <MarketButton />
      <ZeroButton />
      {percent.map((it) => {
        return <PercentButton percent={it} key={it} />;
      })}
    </StyledPercentContainer>
  );
};

const PercentButton = ({ percent }: { percent: string }) => {
  const { inverted, onPercentChange, priceDeltaPercentage, isMarketOrder } = useLimitPanelContext().limitPricePanel;
  const Components = useLimitPanelContext().Components;

  const selected = useMemo(() => (isMarketOrder ? false : BN(priceDeltaPercentage).eq(percent)), [priceDeltaPercentage, percent, isMarketOrder]);

  const prefix = inverted ? "" : !inverted && "+";

  return <Components.PercentButton onClick={() => onPercentChange(percent)} selected={selected} text={`${prefix}${percent}%`} />;
};

const ZeroButton = () => {
  const { onPercentChange, priceDeltaPercentage, isMarketOrder } = useLimitPanelContext().limitPricePanel;
  const Components = useLimitPanelContext().Components;
  const percent = usePercent();
  if (BN(priceDeltaPercentage).isZero() || percent.includes(priceDeltaPercentage)) {
    return <PercentButton percent="0" />;
  }

  return <Components.ZeroButton onClick={() => onPercentChange("0")} text={`${priceDeltaPercentage}%`} />;
};

const MarketButton = () => {
  const { limitPricePanel, isTWAP } = useLimitPanelContext();
  const { onMarket, priceDeltaPercentage, limitPriceUi, isLoading, isMarketOrder } = limitPricePanel;
  const Components = useLimitPanelContext().Components;
  const selected = useMemo(() => !isLoading && BN(limitPriceUi || 0).gt(0) && BN(priceDeltaPercentage).isZero(), [priceDeltaPercentage, limitPriceUi, isLoading]);

  if (!isTWAP) return null;

  return <Components.PercentButton onClick={onMarket} selected={isMarketOrder} text="Market" />;
};

const TokenSelect = () => {
  const { inverted } = useLimitPanelContext().limitPricePanel;
  const Components = useLimitPanelContext().Components;
  const token = useTwapStore((s) => (inverted ? s.srcToken : s.dstToken));
  const { onDstSelect, onSrcSelect } = useLimitPanelContext();

  return <Components.TokenSelect token={token} onClick={inverted ? onSrcSelect : onDstSelect} />;
};

const InvertPrice = () => {
  const { onInvert } = useLimitPanelContext().limitPricePanel;

  return (
    <StyledInvertprice onClick={onInvert}>
      <Icon icon={<RiArrowUpDownLine size="16px" />} />
    </StyledInvertprice>
  );
};

const Title = () => {
  const { onDstSelect, onSrcSelect, limitPricePanel } = useLimitPanelContext();
  const Components = useLimitPanelContext().Components;

  const { inverted } = limitPricePanel;
  const token = useTwapStore((s) => (inverted ? s.dstToken : s.srcToken));

  return <Components.Title textLeft="When 1" textRight="is worth" token={token} onTokenClick={inverted ? onDstSelect : onSrcSelect} />;
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
});

const StyledInput = styled(NumericInput)({
  flex: 1,
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
