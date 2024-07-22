import styled from "styled-components";

import { NumericFormat } from "react-number-format";
import { useTwapContext } from "../../context/context";
import { maxUint256 } from "@defi.org/web3-candies";
import BN from "bignumber.js";
import { CSSProperties } from "react";
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

const InputLoader = () => {
  const { inputLoader } = useTwapContext().uiPreferences;

  return null;
  // return inputLoader ? inputLoader : <StyledLoader className="twap-input-loader" width="75%" height="60%" />;
};

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

  const { inputPlaceholder, input, disableThousandSeparator } = useTwapContext().uiPreferences;

  const _placeholder = placeholder || inputPlaceholder || "0.0";

  return (
    <StyledContainer className={`twap-input ${className}`} style={style}>
      {loading && <InputLoader />}

      <StyledFlex style={{ height: "100%" }}>
        <NumericFormat
          allowNegative={false}
          disabled={disabled}
          decimalScale={decimalScale}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={_placeholder}
          isAllowed={(values) => {
            const { floatValue = 0 } = values;
            return maxValue ? floatValue <= parseFloat(maxValue) : BN(floatValue).isLessThanOrEqualTo(maxUint256);
          }}
          prefix={prefix ? `${prefix} ` : ""}
          value={disabled && value === "0" ? "" : inputValue}
          thousandSeparator={disableThousandSeparator ? undefined : ","}
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
    </StyledContainer>
  );
}

export default NumericInput;

// const StyledLoader = styled(Loader)({
//   position: "absolute",
//   top: "50%",
//   transform: "translate(0, -50%)",
// });

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
