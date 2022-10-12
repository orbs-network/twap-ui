import { ClickAwayListener, Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import _ from "lodash";
import { useState } from "react";
import { TimeFormat } from "../store/TimeFormat";
import NumericInput from "./NumericInput";

interface Props {
  millis?: number;
  onChange: (timeFormat: TimeFormat, millis: number) => void;
  selectedTimeFormat: TimeFormat;
  disabled?: boolean;
}

function TimeSelector({ millis = 0, onChange, selectedTimeFormat = TimeFormat.Minutes, disabled = false }: Props) {
  const [showList, setShowList] = useState(false);

  const onTimeFormatChange = (newTimeFormat: TimeFormat) => {
    onChange(newTimeFormat, selectedTimeFormat.transmute(newTimeFormat, millis));
    setShowList(false);
  };

  const onMillisChange = (uiValue?: string) => {
       onChange(selectedTimeFormat, uiValue == null  ? 0 :  selectedTimeFormat.uiToMillis(uiValue));
  };

  const onOpenListClick = () => {
    if (disabled) return;
    setShowList(true);
  };

  return (
    <StyledContainer className="twap-time-selector" style={{ pointerEvents: disabled ? "none" : "unset" }}>
      <StyledInput>
        <NumericInput disabled={disabled} value={millis ? selectedTimeFormat.millisToUi(millis) :  undefined} onChange={(value) => onMillisChange(value === '' ? undefined : value)} placeholder={"0"} />
      </StyledInput>

      <StyledTimeSelect>
        <StyledSelected onClick={onOpenListClick}>
          <Typography> {selectedTimeFormat.toString()}</Typography>
        </StyledSelected>
        {showList && (
          <ClickAwayListener onClickAway={() => setShowList(false)}>
            <StyledList className="twap-time-selector-list">
              {TimeFormat.All.map((item) => {
                const selected = item.key === selectedTimeFormat.key;
                return (
                  <StyledListItem
                    className={`twap-time-selector-list-item ${selected ? "twap-time-selector-list-item-selected" : ""}`}
                    onClick={() => onTimeFormatChange(item)}
                    key={item.key}
                  >
                    <Typography>{item.key}</Typography>
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
  "& input": {
    textAlign: "right",
    flex: "unset",
    width: "100%",
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
  paddingRight: 10,
  gap: 10,
});

const StyledList = styled(Box)({
  zIndex: 99,
  position: "absolute",
  top: "-50%",
  right: -30,
  borderRadius: 30,
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

const StyledSelected = styled(Box)({
  cursor: "pointer",
});
