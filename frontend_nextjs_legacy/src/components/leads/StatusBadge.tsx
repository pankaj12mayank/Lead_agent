import clsx from "clsx";

const styles: Record<string, string> = {
  new: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  ready: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  contacted: "bg-violet-500/15 text-violet-200 ring-violet-500/30",
  converted: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  const s = (status || "unknown").toLowerCase();
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[s] || "bg-zinc-700/40 text-zinc-300 ring-zinc-600"
      )}
    >
      {status || "—"}
    </span>
  );
}
