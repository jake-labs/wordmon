"use client";

import Link from "next/link";
import MonsterArt from "@/components/MonsterArt";
import { SPECIES } from "@/data/monsters";
import { nextMilestone, stageFor, stageName } from "@/lib/game";
import { useProgress } from "@/lib/progress";

export default function HomeScreen() {
  const progress = useProgress();
  const counts = SPECIES.map((s) => progress.learned[s.id]?.length ?? 0);
  const total = counts.reduce((a, b) => a + b, 0);
  const totalWords = SPECIES.reduce((a, s) => a + s.words.length, 0);
  const found = counts.reduce((a, c) => a + stageFor(c), 0);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-5xl text-orange-500 drop-shadow-[0_3px_0_#3b2f2f]">워드몬</h1>
        <p className="text-lg text-black/60">영어 단어를 외우면 몬스터가 진화해요!</p>
      </header>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white p-4 text-center shadow-[0_4px_0_rgba(0,0,0,0.08)]">
          <div className="text-sm text-black/50">외운 단어</div>
          <div className="text-3xl">
            {total}
            <span className="text-lg text-black/40"> / {totalWords}</span>
          </div>
        </div>
        <Link
          href="/dex"
          className="rounded-3xl bg-white p-4 text-center shadow-[0_4px_0_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5"
        >
          <div className="text-sm text-black/50">📖 몬스터 도감</div>
          <div className="text-3xl">
            {found}
            <span className="text-lg text-black/40"> / {SPECIES.length * 3}</span>
          </div>
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {SPECIES.map((s, i) => {
          const count = counts[i];
          const stage = stageFor(count);
          const next = nextMilestone(count);
          return (
            <Link
              key={s.id}
              href={`/monster/${s.id}`}
              className="group flex flex-col items-center rounded-3xl border-4 bg-white p-3 shadow-[0_5px_0_rgba(0,0,0,0.08)] transition hover:-translate-y-1"
              style={{ borderColor: s.light }}
            >
              <MonsterArt species={s} stage={stage} className="size-28" animate={stage > 0} />
              <div className="text-lg">{stage === 0 ? s.theme : stageName(s, stage)}</div>
              <div className="text-xs text-black/50">{stage === 0 ? "새 알을 찾아요" : s.theme}</div>
              <div className="mt-2 h-2.5 w-full rounded-full bg-black/10">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(count / s.words.length) * 100}%`, background: s.color }}
                />
              </div>
              <div className="mt-1 text-xs text-black/50">
                {next ? `${next.label}까지 ${next.count - count}단어` : "최종 진화 완료! ⭐"}
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
