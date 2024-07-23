import { styled } from "styled-components";
import { useCallback, useState } from "react";
import { useTwapContext } from "../../context/context";
import { Duration, TimeResolution, Translations } from "../../types";
import NumericInput from "./NumericInput";
import { IoIosArrowDown } from "@react-icons/all-files/io/IoIosArrowDown";
import { StyledRowFlex } from "../../styles";
import { ClickAwayListener } from "./ClickAwayListener";

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

export function TimeSelector({ value, onChange, disabled = false, className = "", onFocus, onBlur, placeholder = "0" }: Props) {
  const onResolutionSelect = useCallback(
    (resolution: TimeResolution) => {
      onChange({ resolution, amount: value.amount });
    },
    [onChange]
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

      <ResolutionSelect resolution={value.resolution} onChange={onResolutionSelect} />
    </StyledContainer>
  );
}

export const ResolutionSelect = ({ onChange, resolution, className = "" }: { onChange: (resolution: TimeResolution) => void; resolution: TimeResolution; className?: string }) => {
  const translations = useTwapContext().translations;

  const [open, setOpen] = useState<boolean>(false);

  const onSelect = useCallback(
    (resolution: TimeResolution) => {
      setOpen(false);
      onChange(resolution);
    },
    [onChange]
  );

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Container className="twap-time-selector">
        <StyledSelected onClick={() => setOpen(!open)} className={`${className} twap-time-selector-button`}>
         <p> {translations[findSelectedResolutionText(resolution)]}</p>
          <IoIosArrowDown />
        </StyledSelected>
        {open && (
          <Menu className="twap-time-selector-menu">
            {timeArr.map((item) => (
              <StyledMenuItem className="twap-time-selector-menu-item" key={item.value} onClick={() => onSelect(item.value)}>
                {translations[item.text]}
              </StyledMenuItem>
            ))}
          </Menu>
        )}
      </Container>
    </ClickAwayListener>
  );
};

const Container = styled.div`
  position: relative;
`;

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

const StyledSelected = styled("button")({
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "0px",
  fontSize: 14,
  textTransform: "none",
  color: "inherit",
  cursor: "pointer",
  svg: {
    width: 14,
    height: 14,
  },
});

const Menu = styled.div`
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 5px;
  top: 100%;
`;

const StyledMenuItem = styled.div`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;
