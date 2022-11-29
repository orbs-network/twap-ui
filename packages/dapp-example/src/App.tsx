import { lazy, Suspense, useMemo, useState } from "react";
import _ from "lodash";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Configs } from "@orbs-network/twap";
import { StyledApp, StyledContent, StyledDappSelector } from "./styles";
import { hooks } from "@orbs-network/twap-ui";

const dapps = [Configs.Pangolin.partner, Configs.SpookySwap.partner, Configs.SpiritSwap.partner];

function App() {
  const [selectedDapp, setSelectedDapp] = useState(Configs.Pangolin.partner);
  const SelectedDapp = useMemo(() => lazy(() => import(`./${selectedDapp}`)), [selectedDapp]);
  const reset = hooks.resetState();

  const onDappSelect = (dapp: string) => {
    reset();
    setSelectedDapp(dapp);
  };

  return (
    <StyledApp className="App">
      <DappSelector selectedDapp={selectedDapp} selectDapp={onDappSelect} />
      <StyledContent>
        <Suspense>
          <SelectedDapp />
        </Suspense>
      </StyledContent>
    </StyledApp>
  );
}

export default App;

const DappSelector = ({ selectedDapp, selectDapp }: { selectedDapp: string; selectDapp: (value: string) => void }) => {
  return (
    <StyledDappSelector>
      <Select
        MenuProps={{
          TransitionProps: { style: { background: "black" } },
        }}
        value={selectedDapp}
        label="Dapp"
        onChange={(event: SelectChangeEvent) => selectDapp(event.target.value)}
        style={{ color: "white" }}
      >
        {dapps.map((dapp) => {
          return (
            <MenuItem key={dapp} value={dapp}>
              {dapp}
            </MenuItem>
          );
        })}
      </Select>
    </StyledDappSelector>
  );
};
