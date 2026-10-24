import { MILESTONES } from "@/lib/game";

const MAX = MILESTONES.at(-1)!.count;

export default function MilestoneBar({ count, color }: { count: number; color: string }) {
  const pct = Math.min(count, MAX) / MAX;
  return (
    <div className="w-full pt-1 pb-6">
      <div className="relative h-4 rounded-full bg-black/10">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${pct * 100}%`, background: color }}
        />
        {MILESTONES.map((m) => {
          const reached = count >= m.count;
          return (
            <div key={m.count} className="absolute top-1/2" style={{ left: `${(m.count / MAX) * 100}%` }}>
              <div
                className="-translate-x-1/2 -translate-y-1/2 size-5 rounded-full border-[3px] border-white"
                style={{ background: reached ? color : "#d6cfc4" }}
              />
              <div
                className={`absolute top-3 whitespace-nowrap text-xs text-black/50 ${m.count === MAX ? "-translate-x-full" : "-translate-x-1/2"}`}
              >
                {m.count} {m.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
