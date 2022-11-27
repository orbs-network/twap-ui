import React, { useState } from "react";
import App from "./App";
import { Box, styled } from "@mui/system";

const Second = () => {
  return <div>Swap</div>;
};

type UI = "app" | "second";
function Wrapper() {
  const [ui, setUi] = useState<UI>("app");
  return (
    <div>
      <StyledButtons>
        <button onClick={() => setUi("app")}>app</button>
        <button onClick={() => setUi("second")}>second</button>
      </StyledButtons>
      <div>{ui === "app" ? <App /> : ui === "second" ? <Second /> : null}</div>
    </div>
  );
}

export default Wrapper;

const StyledButtons = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 20,
});
