import { ClickAwayListener, Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import { useMemo, useState } from "react";
import { TimeFormat } from "../store/store";
import AmountInput from "./AmountInput";

const list = [
  {
    text: "Minutes",
    value: TimeFormat.Minutes,
  },
  {
    text: "Hours",
    value: TimeFormat.Hours,
  },
  {
    text: "Days",
    value: TimeFormat.Days,
  },
];

const uiFormatToMilliseconds = (selectedTime: TimeFormat, value?: number) => {
    if(!value){
      return 0
    }
  switch (selectedTime) {
    case TimeFormat.Minutes:
      return value * 60000;
    case TimeFormat.Hours:
      return value * 3.6e6;
    case TimeFormat.Days:
      return value * 8.64e7;
    default:
      return 0;
  }
};

const millisecondsToUiFormat = (selectedTime: TimeFormat, milliseconds?: number) => {

  if (!milliseconds) {
    return undefined
  }
  let result = 0;
  switch (selectedTime) {
    case TimeFormat.Minutes:
      result = milliseconds / 60000;
      break;
    case TimeFormat.Hours:
      result = milliseconds / 3.6e6;
      break;
    case TimeFormat.Days:
      result = milliseconds / 8.64e7;
      break;
    default:
      result = 0;
  }

  return result;
};

interface Props {
  milliseconds?: number;
  setValue: (value: number) => void;
  setTimeFormat: (value: TimeFormat) => void;
  timeFormat: TimeFormat;
}

function TimeSelect({ milliseconds, setValue, timeFormat, setTimeFormat }: Props) {
  const [show, setShow] = useState(false);

  const selectedItem = useMemo(() => {
    return list.find((item) => item.value === timeFormat);
  }, [timeFormat]);

  const onSelect = (time: TimeFormat) => {
    setShow(false);

    const inputValue = millisecondsToUiFormat(timeFormat, milliseconds);
    setTimeFormat(time);
    setValue(uiFormatToMilliseconds(time, inputValue));
  };

  const onChange = (value: number) => {
    setValue(uiFormatToMilliseconds(timeFormat, value));
  };

  return (
    <StyledContainer>
      <StyledInput>
        <AmountInput value={millisecondsToUiFormat(timeFormat, milliseconds) || ''} onChange={(values) => onChange(values.floatValue || 0)} placeholder={"0"} />
      </StyledInput>

      <StyledTimeSelect>
        <StyledSelected onClick={() => setShow(true)}>
          <Typography> {selectedItem?.text}</Typography>
        </StyledSelected>
        {show && (
          <ClickAwayListener onClickAway={() => setShow(false)}>
            <StyledList>
              {list.map((item) => {
                const isSelected = timeFormat === item.value;
                return (
                  <StyledListItem selected={isSelected} onClick={() => onSelect(item.value)} key={item.value}>
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
