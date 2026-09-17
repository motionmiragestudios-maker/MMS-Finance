type SummaryCardProps = {
  label: string;
  value: string;
  change: string;
  direction?: "up" | "down" | "neutral";
};

export function SummaryCard({ label, value, change, direction = "neutral" }: SummaryCardProps) {
  const tone =
    direction === "up"
      ? "text-emerald-600 bg-emerald-50"
      : direction === "down"
        ? "text-rose-600 bg-rose-50"
        : "text-slate-600 bg-slate-100";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-500">{label}</p>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${tone}`}>{change}</span>
      </div>
      <div className="mt-4 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
