export default function SliderInput({ label, value, setValue, min, max, unit }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-semibold">{value} {unit}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-indigo-500"
      />
    </div>
  );
}