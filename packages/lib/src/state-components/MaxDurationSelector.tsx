import { TimeSelector } from "../components";
import { useTwapStore } from "../store";

function MaxDurationSelector() {
  const duration = useTwapStore((store) => store.duration);
  const onChange = useTwapStore((store) => store.setDuration);

  return <TimeSelector value={duration} onChange={onChange} />;
}

export default MaxDurationSelector;
