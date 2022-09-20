import { ClickAwayListener, Typography } from "@mui/material";
import { Box, styled } from "@mui/system";
import { useMemo, useState } from "react";
import AmountInput from "./AmountInput";

export enum Time {
  Minutes,
  Hours,
  Days,
}

const list = [
  {
    text: "Minutes",
    value: Time.Minutes,
  },
  {
    text: "Hours",
    value: Time.Hours,
  },
  {
    text: "Days",
    value: Time.Days,
  },
];

interface Props {
  selected: Time;
}

function TimeSelect({ selected }: Props) {
  const [show, setShow] = useState(false);

  const selectedItem = useMemo(() => {
    return list.find((item) => item.value === selected);
  }, [selected]);

  const onSelect = (value: Time) => {
    setShow(false);
  };

  return (
    <StyledContainer>
      <StyledInput>
        <AmountInput value="" onChange={() => {}} placeholder={"0"} />
      </StyledInput>

      <StyledTimeSelect>
        <StyledSelected onClick={() => setShow(true)}>
          <Typography> {selectedItem?.text}</Typography>
        </StyledSelected>
        {show && (
          <ClickAwayListener onClickAway={() => setShow(false)}>
            <StyledList>
              {list.map((item) => {
                const isSelected = selected === item.value;
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
