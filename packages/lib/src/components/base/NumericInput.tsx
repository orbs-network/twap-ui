import styled from "styled-components";

import { NumericFormat } from "react-number-format";
import BN from "bignumber.js";
import React, { CSSProperties } from "react";
import { Loader } from "./Loader";
import { maxUint256 } from "viem";
import { useTwapContext } from "../../context";

export interface Props {
  onChange: (value: string) => void;
  value?: string | number;
  placeholder?: string;
  disabled?: boolean;
  isAllowed?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  loading?: boolean;
  className?: string;
  maxValue?: string;
  prefix?: string;
  decimalScale?: number;
  minAmount?: number;
  style?: CSSProperties;
}

function NumericInput({
  style = {},
  prefix = "",
  onChange,
  value,
  disabled = false,
  placeholder,
  onFocus,
  onBlur,
  loading = false,
  className = "",
  maxValue,
  decimalScale,
  minAmount,
}: Props) {
  const inputValue = value || minAmount || "";

  const {
    uiPreferences: { input },
    components: { Input },
  } = useTwapContext();

  const _placeholder = placeholder || input?.placeholder || "0";

  return (
    <StyledContainer className={`twap-input ${className}`} style={style}>
      {Input ? (
        <Input isLoading={loading} onChange={onChange} onBlur={onBlur} onFocus={onFocus} value={value?.toString() || ""} />
      ) : (
        <StyledFlex style={{ height: "100%", pointerEvents: disabled ? "none" : "auto" }} className={`${loading ? "twap-input-loading" : ""}`}>
          {loading && <StyledLoader className="twap-input-loader" />}
          <NumericFormat
            allowNegative={false}
            disabled={disabled}
            decimalScale={decimalScale}
            onBlur={onBlur}
            onFocus={onFocus}
            placeholder={_placeholder}
            isAllowed={(values) => {
              const { floatValue = 0 } = values;
              return maxValue ? floatValue <= parseFloat(maxValue) : BN(floatValue).isLessThanOrEqualTo(maxUint256.toString());
            }}
            prefix={prefix ? `${prefix} ` : ""}
            value={disabled && value === "0" ? "" : inputValue}
            thousandSeparator={input?.disableThousandSeparator ? undefined : ","}
            decimalSeparator="."
            customInput={StyledInput}
            type="text"
            min={minAmount}
            onValueChange={(values, _sourceInfo) => {
              if (_sourceInfo.source !== "event") {
                return;
              }

              onChange(values.value === "." ? "0." : values.value);
            }}
          />
        </StyledFlex>
      )}
    </StyledContainer>
  );
}

export default NumericInput;

const StyledLoader = styled(Loader)({
  position: "absolute",
  top: "50%",
  transform: "translate(0, -50%)",
});

const StyledContainer = styled("div")({
  flex: 1,
  height: "100%",
  position: "relative",
});

const StyledInput = styled("input")<{ disabled: boolean }>(({ disabled }) => ({
  pointerEvents: disabled ? "none" : "unset",
  height: "100%",
  width: "100%",
  fontSize: 16,
  border: "unset",
  background: "transparent",
  outline: "unset",
  fontWeight: 500,
}));

const StyledFlex = styled("div")({
  display: "flex",
  alignItems: "center",
});
