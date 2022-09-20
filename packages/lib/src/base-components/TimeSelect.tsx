import { ClickAwayListener, Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import _ from "lodash";
import { useMemo, useState } from "react";
import { TimeFormat } from "../store/store";
import AmountInput from "./AmountInput";

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

const millisecondsToUiFormat = (format: TimeFormat, milliseconds: number) => milliseconds / _.find(displayValues, (v) => v.format === format)!.base;

interface Props {
  millis?: number;
  setMillis: (value: number) => void;
  setTimeFormat: (value: TimeFormat) => void;
  timeFormat?: TimeFormat;
}

function TimeSelect({ millis = 0, setMillis, timeFormat = TimeFormat.Minutes, setTimeFormat }: Props) {
  const [showList, setShowList] = useState(false);

  const selectedListItem = useMemo(() => displayValues.find((item) => item.format === timeFormat), [timeFormat]);

  const onSelectListItem = (time: TimeFormat) => {
    setShowList(false);

    const inputValue = millisecondsToUiFormat(timeFormat, millis);
    setTimeFormat(time);
    setMillis(uiFormatToMillis(time, inputValue));
  };

  const onValueChange = (value: number) => {
    setMillis(uiFormatToMillis(timeFormat, value));
  };

  return (
    <StyledContainer>
      <StyledInput>
        <AmountInput value={millisecondsToUiFormat(timeFormat, millis) || ""} onChange={(values) => onValueChange(values.floatValue || 0)} placeholder={"0"} />
      </StyledInput>

      <StyledTimeSelect>
        <StyledSelected onClick={() => setShowList(true)}>
          <Typography> {selectedListItem?.text}</Typography>
        </StyledSelected>
        {showList && (
          <ClickAwayListener onClickAway={() => setShowList(false)}>
            <StyledList>
              {displayValues.map((item) => {
                const isSelected = timeFormat === item.format;
                return (
                  <StyledListItem selected={isSelected} onClick={() => onSelectListItem(item.format)} key={item.format}>
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

export default TimeSelect;

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
  background: "#FFFFFF",
  boxShadow: "0px 10px 100px rgba(85, 94, 104, 0.1)",
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
  background: selected ? "#F8F8F8" : "transparent",
  transition: "0.2s all",
  "&:hover": {
    background: "#F8F8F8",
  },
  "& p": {
    fontSize: 14,
  },
}));
const StyledSelected = styled(Box)({
  cursor: "pointer",
});
