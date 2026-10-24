"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import MilestoneBar from "@/components/MilestoneBar";
import MonsterArt from "@/components/MonsterArt";
import { getSpecies, type Species, type SpeciesId } from "@/data/monsters";
import type { Word } from "@/data/words";
import {
  buildQuiz,
  CORRECT_TO_LEARN,
  pickStudyWords,
  requeue,
  stageFor,
  stageName,
  type Question,
  type Stage,
} from "@/lib/game";
import { learnedOf, markLearned, useProgress } from "@/lib/progress";
import { canSpeak, sfx, speak } from "@/lib/sound";

type Session = { words: Word[]; review: boolean; startCount: number };

type Phase =
  | { name: "ready" }
  | { name: "cards"; index: number }
  | { name: "quiz"; queue: Question[]; index: number; picked: string | null; misses: number }
  | { name: "result"; misses: number };

export default function StudyScreen({ id }: { id: SpeciesId }) {
  const species = getSpecies(id)!;
  const progress = useProgress();
  const learned = learnedOf(progress, id);
  const [session, setSession] = useState<Session | null>(null);
  const [phase, setPhase] = useState<Phase>({ name: "ready" });
  const [hits, setHits] = useState<Record<string, number>>({});

  const start = () => {
    const picked = pickStudyWords(species.words, learned);
    setSession({ ...picked, startCount: learned.size });
    setHits({});
    setPhase({ name: "cards", index: 0 });
  };

  const startQuiz = () => {
    if (!session) return;
    const queue = buildQuiz(session.words, species.words, { canListen: canSpeak() });
    setPhase({ name: "quiz", queue, index: 0, picked: null, misses: 0 });
  };

  const answer = (choice: string) => {
    if (phase.name !== "quiz" || phase.picked !== null || !session) return;
    const q = phase.queue[phase.index];
    if (choice === q.answer) {
      sfx.correct();
      if (q.kind !== "meaning") speak(q.word.en);
      const n = (hits[q.word.en] ?? 0) + 1;
      setHits({ ...hits, [q.word.en]: n });
      if (n >= CORRECT_TO_LEARN && !session.review) markLearned(id, q.word.en);
      setPhase({ ...phase, picked: choice });
    } else {
      sfx.wrong();
      setPhase({
        ...phase,
        picked: choice,
        misses: phase.misses + 1,
        queue: requeue(phase.queue, phase.index, species.words),
      });
    }
  };

  const nextQuestion = () => {
    if (phase.name !== "quiz") return;
    const index = phase.index + 1;
    if (index >= phase.queue.length) setPhase({ name: "result", misses: phase.misses });
    else setPhase({ ...phase, index, picked: null });
  };

  const current = phase.name === "quiz" ? phase.queue[phase.index] : null;
  const isCorrect = current !== null && phase.name === "quiz" && phase.picked === current.answer;

  // 정답이면 잠깐 칭찬하고 자동으로 넘어간다. 오답이면 정답을 확인하고 직접 넘긴다.
  useEffect(() => {
    if (!isCorrect) return;
    const t = setTimeout(nextQuestion, 900);
    return () => clearTimeout(t);
  });

  // 카드와 듣기/뜻 문제는 화면에 나올 때 발음을 들려준다.
  const autoSpeak =
    phase.name === "cards" && session
      ? session.words[phase.index].en
      : current && current.kind !== "spelling"
        ? current.word.en
        : null;
  const speakKey = phase.name === "quiz" ? `q${phase.index}` : phase.name === "cards" ? `c${phase.index}` : "";
  useEffect(() => {
    if (autoSpeak) speak(autoSpeak);
  }, [autoSpeak, speakKey]);

  const stage = stageFor(learned.size);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <Link href={`/monster/${id}`} className="text-black/50 hover:text-black">
          ← 그만하기
        </Link>
        {phase.name === "quiz" && (
          <QuizProgress queue={phase.queue} index={phase.index} color={species.color} />
        )}
      </div>

      {phase.name === "ready" && (
        <Ready species={species} stage={stage} remaining={species.words.length - learned.size} onStart={start} />
      )}

      {phase.name === "cards" && session && (
        <WordCard
          species={species}
          word={session.words[phase.index]}
          index={phase.index}
          total={session.words.length}
          onNext={() =>
            phase.index + 1 < session.words.length ? setPhase({ name: "cards", index: phase.index + 1 }) : startQuiz()
          }
        />
      )}

      {phase.name === "quiz" && current && (
        <QuizCard
          key={phase.index}
          species={species}
          stage={stage}
          question={current}
          picked={phase.picked}
          onPick={answer}
          onNext={nextQuestion}
        />
      )}

      {phase.name === "result" && session && (
        <Result species={species} session={session} count={learned.size} misses={phase.misses} onAgain={start} />
      )}
    </main>
  );
}

function Ready({ species, stage, remaining, onStart }: { species: Species; stage: Stage; remaining: number; onStart: () => void }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 text-center animate-rise">
      <MonsterArt species={species} stage={stage} className="size-48" />
      <h1 className="text-3xl">{remaining > 0 ? "오늘의 단어 5개!" : "복습 시간!"}</h1>
      <p className="text-lg text-black/60">
        카드로 단어를 익히고, 퀴즈에서 한 단어를 {CORRECT_TO_LEARN}번 맞히면 외운 거예요.
      </p>
      <BigButton color={species.dark} onClick={onStart}>
        시작!
      </BigButton>
    </section>
  );
}

function WordCard({
  species,
  word,
  index,
  total,
  onNext,
}: {
  species: Species;
  word: Word;
  index: number;
  total: number;
  onNext: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-6">
      <div className="text-black/50">
        단어 카드 {index + 1} / {total}
      </div>
      <button
        key={word.en}
        type="button"
        onClick={() => speak(word.en)}
        className="flex w-full flex-col items-center gap-3 rounded-[2rem] border-4 bg-white px-6 py-12 shadow-[0_6px_0_rgba(0,0,0,0.08)] animate-pop"
        style={{ borderColor: species.color }}
      >
        <span className="font-mono text-5xl font-bold tracking-tight">{word.en}</span>
        <span className="text-3xl text-black/70">{word.ko}</span>
        <span className="mt-2 rounded-full bg-black/5 px-4 py-1 text-black/50">🔊 다시 듣기</span>
      </button>
      <BigButton color={species.dark} onClick={onNext}>
        {index + 1 < total ? "다음 단어" : "퀴즈 풀기!"}
      </BigButton>
    </section>
  );
}

const PROMPTS: Record<Question["kind"], string> = {
  meaning: "이 단어의 뜻은?",
  spelling: "이 뜻의 영어 단어는?",
  listen: "잘 듣고 맞는 단어를 골라요",
};

function QuizCard({
  species,
  stage,
  question,
  picked,
  onPick,
  onNext,
}: {
  species: Species;
  stage: Stage;
  question: Question;
  picked: string | null;
  onPick: (choice: string) => void;
  onNext: () => void;
}) {
  const answered = picked !== null;
  const correct = picked === question.answer;
  return (
    <section className="flex flex-1 flex-col gap-5">
      <div className="flex items-end gap-2">
        <MonsterArt species={species} stage={stage === 0 ? 1 : stage} className="size-20 shrink-0" />
        <div className="relative mb-6 rounded-2xl bg-white px-4 py-2 text-lg shadow-sm">
          {!answered ? PROMPTS[question.kind] : correct ? "딩동댕! 잘했어요 🎉" : "아쉬워요! 정답을 기억해요"}
        </div>
      </div>

      <div
        className={`flex min-h-40 flex-col items-center justify-center gap-2 rounded-[2rem] border-4 bg-white p-6 text-center ${answered && !correct ? "animate-shake" : "animate-pop"}`}
        style={{ borderColor: species.color }}
      >
        {question.kind === "meaning" && <span className="font-mono text-5xl font-bold">{question.word.en}</span>}
        {question.kind === "spelling" && <span className="text-4xl">{question.word.ko}</span>}
        {question.kind === "listen" && (
          <button
            type="button"
            onClick={() => speak(question.word.en)}
            className="flex size-24 items-center justify-center rounded-full text-5xl text-white"
            style={{ background: species.color }}
            aria-label="다시 듣기"
          >
            🔊
          </button>
        )}
        {question.kind !== "spelling" && question.kind !== "listen" && (
          <button type="button" onClick={() => speak(question.word.en)} className="text-black/40">
            🔊 다시 듣기
          </button>
        )}
        {answered && question.kind !== "meaning" && (
          <span className="text-black/60">
            {question.word.en} = {question.word.ko}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((c) => {
          const isAnswer = c === question.answer;
          const style =
            answered && isAnswer
              ? "bg-green-400 text-white border-green-500"
              : answered && c === picked
                ? "bg-red-400 text-white border-red-500"
                : "bg-white border-black/10 hover:border-black/30";
          return (
            <button
              key={c}
              type="button"
              disabled={answered}
              onClick={() => onPick(c)}
              className={`min-h-20 rounded-3xl border-4 px-3 py-4 text-2xl shadow-[0_4px_0_rgba(0,0,0,0.08)] transition ${question.kind === "meaning" ? "" : "font-mono"} ${style}`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {answered && !correct && (
        <BigButton color={species.dark} onClick={onNext}>
          알겠어요!
        </BigButton>
      )}
    </section>
  );
}

function QuizProgress({ queue, index, color }: { queue: Question[]; index: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-black/50">
      <div className="h-3 w-40 rounded-full bg-black/10">
        <div className="h-full rounded-full transition-[width]" style={{ width: `${(index / queue.length) * 100}%`, background: color }} />
      </div>
      {index + 1}/{queue.length}
    </div>
  );
}

function Result({
  species,
  session,
  count,
  misses,
  onAgain,
}: {
  species: Species;
  session: Session;
  count: number;
  misses: number;
  onAgain: () => void;
}) {
  const before = stageFor(session.startCount);
  const after = stageFor(count);
  const stars = misses === 0 ? 3 : misses <= 2 ? 2 : 1;
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 text-center animate-rise">
      {after > before ? (
        <Evolution species={species} from={before} to={after} />
      ) : (
        <MonsterArt species={species} stage={after} className="size-48" />
      )}
      <div className="text-4xl tracking-widest">
        {"★".repeat(stars)}
        <span className="text-black/15">{"★".repeat(3 - stars)}</span>
      </div>
      <h1 className="text-3xl">
        {session.review ? "복습 완료!" : `단어 ${session.words.length}개를 외웠어요!`}
      </h1>
      <div className="flex flex-wrap justify-center gap-2">
        {session.words.map((w) => (
          <button
            key={w.en}
            type="button"
            onClick={() => speak(w.en)}
            className="rounded-full px-3 py-1 font-mono"
            style={{ background: species.light }}
          >
            {w.en}
          </button>
        ))}
      </div>
      <div className="w-full px-2 pt-2">
        <MilestoneBar count={count} color={species.color} />
      </div>
      <div className="flex gap-3">
        <BigButton color={species.dark} onClick={onAgain}>
          한 번 더!
        </BigButton>
        <Link href="/" className="rounded-full bg-white px-8 py-4 text-2xl shadow-[0_6px_0_rgba(0,0,0,0.1)]">
          처음으로
        </Link>
      </div>
    </section>
  );
}

function Evolution({ species, from, to }: { species: Species; from: Stage; to: Stage }) {
  const [shown, setShown] = useState<Stage>(from);
  useEffect(() => {
    const t = setTimeout(() => {
      setShown(to);
      sfx.evolve();
    }, 1400);
    return () => clearTimeout(t);
  }, [to]);
  const evolved = shown === to;
  const name = stageName(species, to);
  const message =
    to === 1
      ? "앗! 알이 나타났어요!"
      : to === 2
        ? `알이 깨어나서 ${name}${josa(name, "이", "가")} 태어났어요!`
        : `${stageName(species, from)}${josa(stageName(species, from), "이", "가")} ${name}${josa(name, "으로", "로")} 진화했어요!`;
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <MonsterArt
          key={shown}
          species={species}
          stage={shown}
          className={`size-56 ${evolved ? "animate-pop" : "animate-shake [animation-iteration-count:infinite]"}`}
        />
        {evolved && <div className="pointer-events-none absolute inset-0 rounded-full bg-white animate-flash" />}
      </div>
      <p className="mt-2 min-h-8 text-2xl" style={{ color: species.dark }}>
        {evolved ? message : "어? 무슨 일이지...?"}
      </p>
    </div>
  );
}

/** 마지막 글자에 받침이 있으면 withBatchim, 없으면 without. 'ㄹ' 받침 + '으로'는 '로'를 쓴다. */
function josa(word: string, withBatchim: string, without: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return without;
  const jong = code % 28;
  if (jong === 0) return without;
  if (withBatchim === "으로" && jong === 8) return without;
  return withBatchim;
}

function BigButton({ color, onClick, children }: { color: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-10 py-4 text-2xl text-white shadow-[0_6px_0_rgba(0,0,0,0.25)] transition active:translate-y-1 active:shadow-[0_2px_0_rgba(0,0,0,0.25)]"
      style={{ background: color }}
    >
      {children}
    </button>
  );
}
