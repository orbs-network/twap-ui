export function Checkbox({ checked, setChecked }: { checked: boolean; setChecked: () => void }) {
  return <input type="checkbox" checked={checked} onChange={setChecked} className="twap-checkbox" />;
}
