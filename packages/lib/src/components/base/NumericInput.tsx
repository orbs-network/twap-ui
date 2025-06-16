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

function NumericInput({ prefix = "", onChange, value, disabled = false, placeholder, onFocus, onBlur, loading = false, className = "", maxValue, decimalScale, minAmount }: Props) {
  const inputValue = value || minAmount || "";

  const {
    components: { Input },
  } = useTwapContext();

  const _placeholder = placeholder || "0";

  if (Input) {
    return <Input isLoading={loading} onChange={onChange} onBlur={onBlur} onFocus={onFocus} value={value?.toString() || ""} />;
  }

  return (
    <div className={`twap-input ${className} ${loading ? "twap-input-loading" : ""}`} style={{ height: "100%", pointerEvents: disabled ? "none" : "auto" }}>
      {loading && <Loader />}
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
        thousandSeparator={","}
        decimalSeparator="."
        type="text"
        min={minAmount}
        onValueChange={(values, _sourceInfo) => {
          if (_sourceInfo.source !== "event") {
            return;
          }

          onChange(values.value === "." ? "0." : values.value);
        }}
      />
    </div>
  );
}

export default NumericInput;
