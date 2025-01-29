import { TimeUnit } from "@orbs-network/twap-sdk";
import React, { useCallback } from "react";
import { useWidgetContext } from "../..";
import { Labels } from "../../components";
import { StyledColumnFlex, StyledRowFlex } from "../../styles";

const LimitPanelExpirationOptions = [
  {
    text: "1 Day",
    value: TimeUnit.Days,
  },
  {
    text: "1 Week",
    value: TimeUnit.Weeks,
  },
  {
    text: "1 Month",
    value: TimeUnit.Months,
  },
  {
    text: "1 Year",
    value: TimeUnit.Years,
  },
];

export const LimitPanelDeadlineSelect = ({
  options = LimitPanelExpirationOptions,
  className = "",
}: {
  options?: {
    text: string;
    value: TimeUnit;
  }[];
  className?: string;
}) => {
  const { twap } = useWidgetContext();
  const selectedExpiry = twap.values.durationMilliseconds;

  const onChange = useCallback(
    (unit: TimeUnit) => {
      twap.actionHandlers.setDuration({ unit, value: 1 });
    },
    [twap.actionHandlers.setDuration],
  );

  return (
    <StyledColumnFlex className={className}>
      <Labels.MaxDurationLabel />
      <StyledRowFlex>
        {options.map((it) => {
          return (
            <button key={it.value} onClick={() => onChange(it.value)} className={selectedExpiry === it.value ? "selected" : ""}>
              {it.text}
            </button>
          );
        })}
      </StyledRowFlex>
    </StyledColumnFlex>
  );
};
