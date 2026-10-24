"use client";

import Link from "next/link";
import MonsterArt from "@/components/MonsterArt";
import { SPECIES } from "@/data/monsters";
import { MILESTONES, stageFor, stageName } from "@/lib/game";
import { useProgress } from "@/lib/progress";

export default function DexScreen() {
  const progress = useProgress();
  const entries = SPECIES.flatMap((species) => {
    const reached = stageFor(progress.learned[species.id]?.length ?? 0);
    return MILESTONES.map((m) => ({ species, milestone: m, found: reached >= m.stage }));
  });
  const found = entries.filter((e) => e.found).length;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6">
      <Link href="/" className="self-start text-black/50 hover:text-black">
        ← 처음으로
      </Link>
      <header className="text-center">
        <h1 className="text-4xl">📖 몬스터 도감</h1>
        <p className="mt-1 text-lg text-black/60">
          {found} / {entries.length} 발견
          {found === entries.length && " — 도감 완성! 🏆"}
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        {entries.map(({ species, milestone, found }, i) => (
          <Link
            key={`${species.id}-${milestone.stage}`}
            href={`/monster/${species.id}`}
            className="flex flex-col items-center rounded-3xl bg-white p-2 pb-3 shadow-[0_4px_0_rgba(0,0,0,0.06)]"
            style={found ? { background: species.light } : undefined}
          >
            <div className="self-start pl-1 font-mono text-xs text-black/40">No.{String(i + 1).padStart(3, "0")}</div>
            <MonsterArt species={species} stage={milestone.stage} silhouette={!found} animate={false} className="size-24" />
            <div className="text-base">{found ? stageName(species, milestone.stage) : "???"}</div>
            <div className="text-xs text-black/45">
              {found ? species.theme : `${species.theme} ${milestone.count}단어`}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
