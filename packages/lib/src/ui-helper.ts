const handleSwitchStyles = ({ thumb, thumbActive, track, trackActive }: { thumb?: string; thumbActive?: string; track?: string; trackActive?: string }) => {
  return {
    ".twap-switch": {
      "& .MuiSwitch-thumb": {
        background: thumb,
      },
      "& .MuiSwitch-track": {
        background: `${track}!important`,
        opacity: "1!important",
      },
      "& .Mui-checked+.MuiSwitch-track": {
        backgroundColor: `${trackActive}!important`,
        opacity: "1!important",
      },
      "& .Mui-checked .MuiSwitch-thumb": {
        background: thumbActive,
      },
    },
  };
};

export const uiHelper = {
  handleSwitchStyles,
};
