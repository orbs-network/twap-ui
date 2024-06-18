import { Box, styled } from "@mui/material";
import { StyledColumnFlex, StyledRowFlex } from "../styles";
import { useTwapStore } from "../store";
import { useLimitPriceV3 } from "../hooks";
import { Icon, NumericInput } from "./base";
import TokenDisplay from "./base/TokenDisplay";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import BN from "bignumber.js";
import { createContext, FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";

interface Shared {
  onSrcSelect: () => void;
  onDstSelect: () => void;
  Components: {
    PercentButton: FC<{ text: string; selected: boolean; onClick: () => void }>;
    CustomPercent: FC<{ text: string; onClick: () => void }>;
  };
  styles?: {
    percentButtonsGap: string;
  };
}

interface Props extends Shared {
  className?: string;
}

interface ContextProps extends Shared {}

const defaultPercent = [1, 5, 10];

const Context = createContext({} as ContextProps);

const useLimitPanelContext = () => useContext(Context);

export function LimitPanel({ className = "", onSrcSelect, onDstSelect, Components, styles }: Props) {
  return (
    <Context.Provider value={{ onSrcSelect, onDstSelect, Components, styles }}>
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
  const { onChange, limitPrice, isLoading } = useLimitPriceV3();
  const [value, setValue] = useState("");
    
  useEffect(() => {
    setValue(limitPrice || "");
  }, [limitPrice]);

  return <StyledInput loading={isLoading} placeholder="0" onChange={onChange} value={value} />;
};

const usePercent = () => {
  const { inverted } = useLimitPriceV3();
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
  return (
    <StyledPercentContainer style={{ gap: styles?.percentButtonsGap || 5 }}>
      <MarketButton />
      {percent.map((it) => {
        return <PercentButton percent={it} key={it} />;
      })}
    </StyledPercentContainer>
  );
};

const PercentButton = ({ percent }: { percent: string }) => {
  const { inverted, onPercentChange, priceDeltaPercentage } = useLimitPriceV3();
  const Components = useLimitPanelContext().Components;

  const selected = useMemo(() => BN(priceDeltaPercentage).eq(percent), [priceDeltaPercentage]);

  const prefix = inverted ? "" : !inverted && "+";

  return <Components.PercentButton onClick={() => onPercentChange(percent)} selected={selected} text={`${prefix}${percent}%`} />;
};

const MarketButton = () => {
  const { onResetToMarket, priceDeltaPercentage, limitPrice, isLoading } = useLimitPriceV3();
  const Components = useLimitPanelContext().Components;
  const percent = usePercent();
  const selected = useMemo(() => !isLoading && BN(limitPrice || 0).gt(0) && BN(priceDeltaPercentage).isZero(), [priceDeltaPercentage, limitPrice, isLoading]);

  const onClick = useCallback(() => {
    onResetToMarket();
  }, [onResetToMarket]);

  if (BN(priceDeltaPercentage).isZero() || percent.includes(priceDeltaPercentage)) {
    return <Components.PercentButton onClick={onClick} selected={selected} text="Market" />;
  }

  return <Components.CustomPercent onClick={onClick} text={`${priceDeltaPercentage}%`} />;
};

const TokenSelect = () => {
  const { inverted } = useLimitPriceV3();
  const token = useTwapStore((s) => (inverted ? s.srcToken : s.dstToken));
  const { onDstSelect, onSrcSelect } = useLimitPanelContext();

  return (
    <StyledTokenSelect onClick={inverted ? onSrcSelect : onDstSelect}>
      <StyledTokenDisplay symbol={token?.symbol} logo={token?.logoUrl} />
    </StyledTokenSelect>
  );
};

const InvertPrice = () => {
  const { invert } = useLimitPriceV3();

  return (
    <StyledInvertprice onClick={invert}>
      <Icon icon={<RiArrowUpDownLine size="16px" />} />
    </StyledInvertprice>
  );
};

const Title = () => {
  const { onDstSelect, onSrcSelect } = useLimitPanelContext();

  const { inverted } = useLimitPriceV3();
  const token = useTwapStore((s) => (inverted ? s.dstToken : s.srcToken));

  return (
    <StyledTitle>
      <span>When 1</span>
      <StyledTokenSelect onClick={inverted ? onDstSelect : onSrcSelect}>
        <StyledTokenDisplay symbol={token?.symbol} logo={token?.logoUrl} />
      </StyledTokenSelect>
      <span>is worth</span>
    </StyledTitle>
  );
};

const StyledTitle = styled(StyledRowFlex)({
  flex: 1,
  justifyContent: "flex-start",
  span: {
    opacity: 0.8,
  },
});

const StyledInvertprice = styled(Box)({
  cursor: "pointer",
  "&:hover": {
    opacity: 0.8,
  },
});

const StyledTokenSelect = styled(StyledRowFlex)({
  cursor: "pointer",
  width: "auto",
  "&:hover": {
    opacity: 0.8,
  },
});

const StyledTokenDisplay = styled(TokenDisplay)({
  gap: 5,
  ".twap-token-logo": {
    width: 18,
    height: 18,
  },
  p: {
    fontSize: 16,
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

const Container = styled(StyledColumnFlex)({});
