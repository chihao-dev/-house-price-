export default function SelectionCard({ label, selected, onClick }) {

  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer
        text-center
        px-3 py-2
        rounded-lg
        border
        transition
        duration-200

        ${selected
          ? "bg-indigo-500 text-white border-indigo-400"
          : "bg-black/30 text-gray-200 border-white/20 hover:bg-indigo-500/40"
        }
      `}
    >
      {label}
    </div>
  );
}