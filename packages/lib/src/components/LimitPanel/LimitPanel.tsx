import { Box, styled } from "@mui/material";
import { StyledColumnFlex, StyledRowFlex, StyledText } from "../../styles";
import { useTwapStore } from "../../store";
import { Icon, Message } from "../base";
import { RiArrowUpDownLine } from "@react-icons/all-files/ri/RiArrowUpDownLine";
import BN from "bignumber.js";
import { createContext, FC, useContext, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { useIsMarketOrder, useLimitPrice, useLimitPricePercentDiffFromMarket } from "../../hooks/hooks";
import { LimitPriceZeroButtonProps, LimitPricePercentProps, LimitPriceTitleProps, LimitPriceTokenSelectProps } from "../../types";
import { useOnLimitPercentageClick, onCustomChange } from "./hooks";
import { amountUiV2, formatDecimals } from "../../utils";
import { useTwapContext } from "../../context";
import { MarketPriceWarning } from "../Components";

interface Shared {
  onSrcSelect: () => void;
  onDstSelect: () => void;
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

const defaultPercent = [1, 5, 10];

const Context = createContext({} as Shared);

const useLimitPanelContext = () => useContext(Context);

export function LimitPanel({ className = "", onSrcSelect, onDstSelect, Components, styles }: Props) {
  const isMarketOrder = useIsMarketOrder();
  if (isMarketOrder) {
    return <MarketPriceWarning />;
  }

  return (
    <Context.Provider value={{ onSrcSelect, onDstSelect, Components, styles }}>
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
  const { Components } = useLimitPanelContext();
  const { isMarketOrder, isInvertedLimitPrice, isCustom, customLimitPrice, dstToken } = useTwapStore((s) => ({
    isInvertedLimitPrice: s.isInvertedLimitPrice,
    isMarketOrder: s.isMarketOrder,
    isCustom: s.customLimitPrice,
    customLimitPrice: s.customLimitPrice,
    dstToken: s.dstToken,
  }));
  const { isLoading, limitPrice } = useLimitPrice();

  const limitPriceUi = useMemo(() => {
    if (isCustom) {
      return customLimitPrice;
    }
    let res = amountUiV2(dstToken?.decimals, limitPrice);

    if (isInvertedLimitPrice) {
      res = BN(1)
        .div(res || 0)
        .toString();
    }

    return formatDecimals(res);
  }, [customLimitPrice, isCustom, isInvertedLimitPrice, limitPrice, dstToken]);

  const [value, setValue] = useState("");
  const onChange = onCustomChange();

  useEffect(() => {
    setValue(limitPriceUi || "");
  }, [limitPriceUi]);

  return (
    <StyledInputContainer>
      {isMarketOrder && <StyledAnyPrice className="twap-limit-panel-market-price">Get text from Eran</StyledAnyPrice>}
      <div style={{ opacity: isMarketOrder ? 0 : 1, pointerEvents: isMarketOrder ? "none" : "all" }}>
        <Components.Input isLoading={isLoading} onChange={onChange} value={value} />
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
  const inverted = useTwapStore((s) => s.isInvertedLimitPrice);
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
  const { inverted, isMarketOrder } = useTwapStore((s) => ({
    inverted: s.isInvertedLimitPrice,
    isMarketOrder: s.isMarketOrder,
  }));
  const priceDeltaPercentage = useLimitPricePercentDiffFromMarket();

  const limitPrice = useLimitPrice().limitPrice;
  const Components = useLimitPanelContext().Components;
  const limitPricePercent = useTwapStore((s) => s.limitPricePercent);

  const onPercentageChange = useOnLimitPercentageClick();

  const selected = useMemo(() => {
    const p = limitPricePercent || priceDeltaPercentage;
    if (BN(limitPrice || 0).isZero()) {
      return false;
    }

    return BN(p || 0).eq(percent);
  }, [limitPricePercent, percent, isMarketOrder, limitPrice, priceDeltaPercentage]);

  const prefix = percent === "0" ? "" : inverted ? "-" : !inverted && "+";

  return <Components.PercentButton onClick={() => onPercentageChange(percent)} selected={selected} text={`${prefix}${Math.abs(Number(percent))}%`} />;
};

const ZeroButton = () => {
  const limitPricePercent = useTwapStore((s) => s.limitPricePercent);
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
    return <Components.ZeroButton onClick={() => onPercentageChange("0")} text={`${priceDeltaPercentage}%`} />;
  }
  return <PercentButton percent="0" />;
};

const TokenSelect = () => {
  const { inverted } = useTwapStore((s) => ({
    inverted: s.isInvertedLimitPrice,
  }));
  const Components = useLimitPanelContext().Components;
  const token = useTwapStore((s) => (inverted ? s.srcToken : s.dstToken));
  const { onDstSelect, onSrcSelect } = useLimitPanelContext();

  return <Components.TokenSelect token={token} onClick={inverted ? onSrcSelect : onDstSelect} />;
};

const InvertPrice = () => {
  const onInvert = useTwapStore((s) => s.invertLimit);

  return (
    <StyledInvertprice onClick={onInvert}>
      <Icon icon={<RiArrowUpDownLine size="16px" />} />
    </StyledInvertprice>
  );
};

const Title = () => {
  const { onDstSelect, onSrcSelect } = useLimitPanelContext();
  const Components = useLimitPanelContext().Components;
  const t = useTwapContext().translations;
  const { inverted } = useTwapStore((s) => ({
    inverted: s.isInvertedLimitPrice,
  }));
  const token = useTwapStore((s) => (inverted ? s.dstToken : s.srcToken));

  return <Components.Title textLeft={t.swapOne} textRight={t.isWorth} token={token} onTokenClick={inverted ? onDstSelect : onSrcSelect} />;
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
