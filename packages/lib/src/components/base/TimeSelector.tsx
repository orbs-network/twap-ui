import { ClickAwayListener } from "@mui/material";
import { Box, styled } from "@mui/system";
import { useState } from "react";
import { useTwapContext } from "../../context";
import { Duration, TimeResolution } from "../../store";
import { StyledRowFlex, StyledText } from "../../styles";
import { Translations } from "../../types";
import NumericInput from "./NumericInput";
import { IoIosArrowDown } from "react-icons/io";

const timeArr: { text: keyof Translations; value: TimeResolution }[] = [
  {
    text: "minutes",
    value: TimeResolution.Minutes,
  },
  {
    text: "hours",
    value: TimeResolution.Hours,
  },
  {
    text: "days",
    value: TimeResolution.Days,
  },
];

const findSelectedResolutionText = (resolution: TimeResolution) => {
  return timeArr.find((t) => t.value === resolution)!.text;
};

interface Props {
  value: Duration;
  onChange: ({ resolution, amount }: Duration) => void;
  disabled?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
}

function TimeSelector({ value, onChange, disabled = false, className = "", onFocus, onBlur, placeholder = "0" }: Props) {
  const [showList, setShowList] = useState(false);
  const translations = useTwapContext().translations;

  const onTimeFormatChange = (resolution: TimeResolution) => {
    onChange({ resolution, amount: value.amount });
    setShowList(false);
  };

  const onOpenListClick = () => {
    if (disabled) return;
    setShowList(true);
  };

  return (
    <StyledContainer className={`twap-time-selector ${className}`} style={{ pointerEvents: disabled ? "none" : "unset" }}>
      <StyledInput>
        <NumericInput
          onBlur={onBlur}
          onFocus={onFocus}
          disabled={disabled}
          value={value.amount}
          onChange={(v) => onChange({ resolution: value.resolution, amount: Number(v) })}
          placeholder={placeholder}
        />
      </StyledInput>

      <StyledTimeSelect>
        <StyledSelected onClick={onOpenListClick} className="twap-time-selector-selected">
          <StyledText> {translations[findSelectedResolutionText(value.resolution)]}</StyledText>
          <IoIosArrowDown />
        </StyledSelected>
        {showList && (
          <ClickAwayListener onClickAway={() => setShowList(false)}>
            <StyledList className="twap-time-selector-list">
              {timeArr.map((item) => {
                const selected = item.value === value.resolution;
                return (
                  <StyledListItem
                    className={`twap-time-selector-list-item ${selected ? "twap-time-selector-list-item-selected" : ""}`}
                    onClick={() => onTimeFormatChange(item.value)}
                    key={item.value}
                  >
                    <StyledText>{translations[item.text]}</StyledText>
                  </StyledListItem>
                );
              })}
            </StyledList>
          </ClickAwayListener>
        )}
      </StyledTimeSelect>
    </StyledContainer>
  );
}

export default TimeSelector;

const StyledInput = styled(Box)({
  flex: 1,
  ".twap-input": {
    input: {
      textAlign: "right",
      paddingRight: 10,
      flex: "unset",
      width: "100%",
      "&::placeholder": {
        color: "white",
      },
    },
  },
});

const StyledTimeSelect = styled(Box)({
  position: "relative",
  "& p": {
    fontSize: 14,
    fontWeight: 600,
  },
});

const StyledContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  flex: 1,
  gap: 10,
});

const StyledList = styled(Box)({
  zIndex: 99,
  position: "absolute",
  top: "-50%",
  right: -18,
  borderRadius: 20,
  padding: "11px 0px",
  width: 150,
  overflow: "hidden",
});

const StyledListItem = styled(Box)({
  padding: "0px 24px",
  textAlign: "left",
  height: 36,
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  transition: "0.2s all",
  "& p": {
    fontSize: 14,
  },
});

const StyledSelected = styled(StyledRowFlex)({
  cursor: "pointer",
  gap: 5,
  svg: {
    width: 14,
    height: 14,
  },
});
