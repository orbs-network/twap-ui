import { ClickAwayListener, Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import _ from "lodash";
import { useMemo, useState } from "react";
import { TimeFormat } from "../store/store";
import NumericInput from "./NumericInput";

const displayValues = [
  {
    text: "Minutes",
    format: TimeFormat.Minutes,
    base: 1000 * 60,
  },
  {
    text: "Hours",
    format: TimeFormat.Hours,
    base: 1000 * 60 * 60,
  },
  {
    text: "Days",
    format: TimeFormat.Days,
    base: 1000 * 60 * 60 * 24,
  },
];

const uiFormatToMillis = (format: TimeFormat, value: number) => _.find(displayValues, (v) => v.format === format)!.base * value;

const millisToUiFormat = (format: TimeFormat, milliseconds: number) => milliseconds / _.find(displayValues, (v) => v.format === format)!.base;

interface Props {
  millis?: number;
  onChange: (timeFormat: TimeFormat, millis: number) => void;
  timeFormat?: TimeFormat;
}

function TimeSelector({ millis = 0, onChange, timeFormat = TimeFormat.Minutes }: Props) {
  const [showList, setShowList] = useState(false);

  const selectedListItem = useMemo(() => displayValues.find((item) => item.format === timeFormat), [timeFormat]);

  const onSelectListItem = (time: TimeFormat) => {
    setShowList(false);
    const inputValue = millisToUiFormat(timeFormat, millis);
    onChange(time, uiFormatToMillis(time, inputValue));
  };

  const onValueChange = (value?: number) => {
    console.log(value);

    if (value != null && value > 0 && value < 1) {
      value = 1;
    }
    onChange(timeFormat, uiFormatToMillis(timeFormat, value || 0));
  };

  return (
    <StyledContainer className="twap-time-selector">
      <StyledInput>
        <NumericInput value={millisToUiFormat(timeFormat, millis) || ""} onChange={(value) => onValueChange(parseFloat(value))} placeholder={"0"} />
        {/*  //TODO */}
      </StyledInput>

      <StyledTimeSelect>
        <StyledSelected onClick={() => setShowList(true)}>
          <Typography> {selectedListItem?.text}</Typography>
        </StyledSelected>
        {showList && (
          <ClickAwayListener onClickAway={() => setShowList(false)}>
            <StyledList className="twap-time-selector-list">
              {displayValues.map((item) => {
                const isSelected = timeFormat === item.format;
                return (
                  <StyledListItem className="twap-time-selector-list-item" selected={isSelected} onClick={() => onSelectListItem(item.format)} key={item.format}>
                    <Typography>{item.text}</Typography>
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
});

const StyledListItem = styled(Box)(({ selected }: { selected: boolean }) => ({
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
}));
const StyledSelected = styled(Box)({
  cursor: "pointer",
});
