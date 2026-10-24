"use client";

import Link from "next/link";
import MilestoneBar from "@/components/MilestoneBar";
import MonsterArt from "@/components/MonsterArt";
import { getSpecies, type SpeciesId } from "@/data/monsters";
import { nextMilestone, stageFor, stageName } from "@/lib/game";
import { learnedOf, useProgress } from "@/lib/progress";
import { speak } from "@/lib/sound";

export default function MonsterScreen({ id }: { id: SpeciesId }) {
  const species = getSpecies(id)!;
  const learned = learnedOf(useProgress(), id);
  const count = learned.size;
  const stage = stageFor(count);
  const next = nextMilestone(count);
  const done = count >= species.words.length;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6">
      <Link href="/" className="self-start text-black/50 hover:text-black">
        ← 처음으로
      </Link>

      <section
        className="flex flex-col items-center rounded-[2rem] p-6"
        style={{ background: `linear-gradient(180deg, ${species.light}, #fff)` }}
      >
        <MonsterArt species={species} stage={stage} className="size-56" />
        <h1 className="mt-2 text-3xl">{stage === 0 ? "아직 알이 없어요" : stageName(species, stage)}</h1>
        <p className="text-black/50">{species.theme} 몬스터</p>
        <p className="mt-3 text-center text-lg">
          {next
            ? stage === 0
              ? `단어 ${next.count - count}개를 더 외우면 알이 나타나요!`
              : `단어 ${next.count - count}개를 더 외우면 ${next.label}해요!`
            : "최종 진화를 마쳤어요! 복습으로 실력을 지켜요."}
        </p>
        <div className="mt-4 w-full px-2">
          <MilestoneBar count={count} color={species.color} />
        </div>
        <Link
          href={`/monster/${id}/study`}
          className="mt-1 rounded-full px-10 py-4 text-2xl text-white shadow-[0_6px_0_rgba(0,0,0,0.25)] transition active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.25)]"
          style={{ background: species.dark }}
        >
          {done ? "복습하기" : "단어 공부하기"}
        </Link>
      </section>

      <section className="rounded-[2rem] bg-white p-5">
        <h2 className="mb-3 text-xl">
          단어장 <span className="text-black/40">{count} / {species.words.length}</span>
        </h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {species.words.map((w) =>
            learned.has(w.en) ? (
              <li key={w.en}>
                <button
                  type="button"
                  onClick={() => speak(w.en)}
                  className="flex w-full flex-col items-start rounded-2xl px-3 py-2 text-left transition hover:brightness-95"
                  style={{ background: species.light }}
                >
                  <span className="font-mono text-lg">{w.en} 🔊</span>
                  <span className="text-sm text-black/60">{w.ko}</span>
                </button>
              </li>
            ) : (
              <li key={w.en} className="rounded-2xl bg-black/5 px-3 py-2 text-black/25">
                <span className="text-lg">? ? ?</span>
                <span className="block text-sm">아직 몰라요</span>
              </li>
            ),
          )}
        </ul>
      </section>
    </main>
  );
}
