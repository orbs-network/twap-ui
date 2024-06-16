import { Box, Fade } from "@mui/material";
import { styled } from "@mui/system";
import Loader from "./Loader";
import { NumericFormat } from "react-number-format";
import { useTwapContext } from "../../context";
import BN from "bignumber.js";
import { CSSProperties } from "react";
import { maxUint256 } from "../../web3-candies/consts";
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

  return inputLoader ? inputLoader : <StyledLoader className="twap-input-loader" width="75%" height="60%" />;
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

  const { inputPlaceholder, input } = useTwapContext().uiPreferences;

  const _placeholder = placeholder || inputPlaceholder || "0.0";

  return (
    <StyledContainer className={`twap-input ${className}`} style={style}>
      {loading && <InputLoader />}
      <Fade in={input?.showOnLoading ? true : !loading} timeout={0}>
        <StyledFlex>
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
            thousandSeparator=","
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
      </Fade>
    </StyledContainer>
  );
}

export default NumericInput;

const StyledLoader = styled(Loader)({
  position: "absolute",
  top: "50%",
  transform: "translate(0, -50%)",
});

const StyledContainer = styled(Box)({
  flex: 1,
  height: "100%",
  position: "relative",
});

const StyledInput = styled("input")(({ disabled }: { disabled: boolean }) => ({
  pointerEvents: disabled ? "none" : "unset",
  height: "100%",
  width: "100%",
  fontSize: 16,
  border: "unset",
  background: "transparent",
  outline: "unset",
  fontWeight: 500,
}));

const StyledFlex = styled(Box)({
  display: "flex",
  alignItems: "center",
});
