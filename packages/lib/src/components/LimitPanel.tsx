import { Box, styled } from "@mui/material";
import { StyledColumnFlex, StyledRowFlex } from "../styles";
import { useTwapStore } from "../store";
import { Icon, NumericInput } from "./base";
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
      <Container className={className}>
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
  const { onChange, limitPriceUi, isLoading } = limitPricePanel;
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(limitPriceUi || "");
  }, [limitPriceUi]);

  return <Components.Input isLoading={isLoading} onChange={onChange} value={value} />;
};

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
      <ZeroButton />
      {percent.map((it) => {
        return <PercentButton percent={it} key={it} />;
      })}
    </StyledPercentContainer>
  );
};

const PercentButton = ({ percent }: { percent: string }) => {
  const { inverted, onPercentChange, priceDeltaPercentage } = useLimitPanelContext().limitPricePanel;
  const Components = useLimitPanelContext().Components;

  const selected = useMemo(() => BN(priceDeltaPercentage).eq(percent), [priceDeltaPercentage]);

  const prefix = inverted ? "" : !inverted && "+";

  return <Components.PercentButton onClick={() => onPercentChange(percent)} selected={selected} text={`${prefix}${percent}%`} />;
};

const ZeroButton = () => {
  const { onMarket, priceDeltaPercentage } = useLimitPanelContext().limitPricePanel;
  const Components = useLimitPanelContext().Components;
  const percent = usePercent();
  if (BN(priceDeltaPercentage).isZero() || percent.includes(priceDeltaPercentage)) {
    return <PercentButton percent='0' />;
  }

  return <Components.ZeroButton onClick={onMarket} text={`${priceDeltaPercentage}%`} />;
};

const MarketButton = () => {
  const { onMarket, priceDeltaPercentage, limitPriceUi, isLoading } = useLimitPanelContext().limitPricePanel;
  const Components = useLimitPanelContext().Components;
  const percent = usePercent();
  const selected = useMemo(() => !isLoading && BN(limitPriceUi || 0).gt(0) && BN(priceDeltaPercentage).isZero(), [priceDeltaPercentage, limitPriceUi, isLoading]);

  if (BN(priceDeltaPercentage).isZero() || percent.includes(priceDeltaPercentage)) {
    return <Components.PercentButton onClick={onMarket} selected={selected} text="Market" />;
  }

  return <Components.CustomPercent onClick={onMarket} text={`${priceDeltaPercentage}%`} />;
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
