import { Button, Menu, MenuItem } from "@mui/material";
import { Box, styled } from "@mui/system";
import { useCallback, useState } from "react";
import { useTwapContext } from "../../context";
import { Duration, TimeResolution } from "../../store";
import { Translations } from "../../types";
import NumericInput from "./NumericInput";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { StyledRowFlex } from "../../styles";

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
    text: "weeks",
    value: TimeResolution.Weeks,
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
  const translations = useTwapContext().translations;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const onSelect = useCallback(
    (resolution: TimeResolution) => {
      handleClose();
      onChange({ resolution, amount: value.amount });
    },
    [handleClose, onChange, value.amount]
  );

  return (
    <StyledContainer className={`twap-time-selector ${className}`} style={{ pointerEvents: disabled ? "none" : "unset" }}>
      <StyledInput
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        value={value.amount}
        onChange={(v) => onChange({ resolution: value.resolution, amount: Number(v) })}
        placeholder={placeholder}
      />

      <StyledSelected onClick={handleClick} className="twap-time-selector-menu-button">
        {translations[findSelectedResolutionText(value.resolution)]}
        <IoIosArrowDown />
      </StyledSelected>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {timeArr.map((item) => {
          return (
            <StyledMenuItem
              className='twap-time-selector-menu-item'
              key={item.value}
              onClick={() => onSelect(item.value)}
            >
              {translations[item.text]}
            </StyledMenuItem>
          );
        })}
      </Menu>
    </StyledContainer>
  );
}

export default TimeSelector;

const StyledInput = styled(NumericInput)({
  flex: 1,
  input: {
    textAlign: "left",
    paddingLeft: 10,
    flex: "unset",
    width: "100%",
    "&::placeholder": {
      color: "white",
    },
  },
});

const StyledContainer = styled(StyledRowFlex)({});

const StyledMenuItem  = styled(MenuItem)({
  fontSize: 14,
})

const StyledSelected = styled(Button)({
  gap: 5,
  padding: "0px",
  fontSize: 14,
  textTransform: "none",
  color:'inherit',
  marginRight: 10,
  ".MuiTouchRipple-root": {
    display: "none",
  },
  "&:hover": {
    backgroundColor: "transparent",
  },
  svg: {
    width: 14,
    height: 14,
  },
});
