import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { StyledApp, StyledContent, StyledDappSelector } from "./styles";
import { hooks } from "@orbs-network/twap-ui";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import pangolin from "./Pangolin";
import spiritswap from "./SpiritSwap";
import spookyswap from "./SpookySwap";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/system";
import { useMemo } from "react";

const defaultDapp = spiritswap;
const dapps = [spiritswap, pangolin, spookyswap];

const useSelectedDapp = () => {
  const location = useLocation();
  return location.pathname.split("/")[1];
};

function App() {
  return (
    <StyledApp className="App">
      <DappSelector />
      <StyledContent>
        <Routes>
          {dapps.map(({ path, Component }) => {
            return <Route path={path} element={<Component />} key={path} />;
          })}
          <Route path="*" element={<defaultDapp.Component />} />
        </Routes>
      </StyledContent>
    </StyledApp>
  );
}

export default App;

const DappSelector = () => {
  const reset = hooks.resetState();
  const navigate = useNavigate();
  const selected = useSelectedDapp();

  const onSelect = (path: string) => {
    reset();
    setTimeout(() => {
      navigate(path);
    }, 50);
  };
  return (
    <StyledDappSelector>
      <Select
        MenuProps={{
          TransitionProps: { style: { background: "black" } },
        }}
        value={selected}
        renderValue={(value) => <SelectedValue value={value} />}
        onChange={(event: SelectChangeEvent) => onSelect(event.target.value)}
        style={{ color: "white" }}
      >
        {dapps.map((dapp) => {
          return (
            <StyledMenuItem key={dapp.path} value={dapp.path}>
              <img src={dapp.logo} />
              <Typography>{dapp.name}</Typography>
            </StyledMenuItem>
          );
        })}
      </Select>
    </StyledDappSelector>
  );
};

const SelectedValue = ({ value }: { value: string }) => {
  const selectedItem = useMemo(() => {
    return dapps.find((d) => d.path === value);
  }, [value]);

  return (
    <StyledSelected>
      <img src={selectedItem?.logo} />
      <Typography>{selectedItem?.name}</Typography>
    </StyledSelected>
  );
};

const StyledMenuItem = styled(MenuItem)({
  display: "flex",
  alignItems: "center",
  gap: 10,
  "& img": {
    width: 30,
    height: 30,
    objectFit: "containt",
    borderRadius: 50,
  },
});

const StyledSelected = styled(StyledMenuItem)({
  padding: 10,
});
