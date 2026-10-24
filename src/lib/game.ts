import type { Species } from "../data/monsters.ts";
import type { Word } from "../data/words.ts";

/** 0: 아직 없음, 1: 알, 2: 1차 진화, 3: 최종 진화 */
export type Stage = 0 | 1 | 2 | 3;

export const MILESTONES = [
  { count: 10, stage: 1, label: "알" },
  { count: 30, stage: 2, label: "1차 진화" },
  { count: 100, stage: 3, label: "최종 진화" },
] as const satisfies readonly { count: number; stage: Stage; label: string }[];

export const SESSION_SIZE = 5;
/** 한 단어를 '외웠다'고 인정하는 정답 횟수 */
export const CORRECT_TO_LEARN = 2;

export function stageFor(learnedCount: number): Stage {
  let stage: Stage = 0;
  for (const m of MILESTONES) if (learnedCount >= m.count) stage = m.stage;
  return stage;
}

export function nextMilestone(learnedCount: number) {
  return MILESTONES.find((m) => learnedCount < m.count);
}

export function stageName(species: Species, stage: Stage): string {
  switch (stage) {
    case 0:
      return "???";
    case 1:
      return `${species.names[0]}의 알`;
    case 2:
      return species.names[0];
    case 3:
      return species.names[1];
  }
}

export type Rand = () => number;

export function shuffle<T>(items: readonly T[], rand: Rand = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** 아직 못 외운 단어를 학습 순서대로 고른다. 다 외웠으면 복습용으로 무작위로 고른다. */
export function pickStudyWords(
  words: readonly Word[],
  learned: ReadonlySet<string>,
  rand: Rand = Math.random,
  size = SESSION_SIZE,
): { words: Word[]; review: boolean } {
  const fresh = words.filter((w) => !learned.has(w.en)).slice(0, size);
  if (fresh.length > 0) return { words: fresh, review: false };
  return { words: shuffle(words, rand).slice(0, size), review: true };
}

/**
 * meaning: 영어를 보고 뜻 고르기
 * spelling: 뜻을 보고 영어 고르기
 * listen: 발음을 듣고 영어 고르기
 */
export type QuestionKind = "meaning" | "spelling" | "listen";

export type Question = {
  word: Word;
  kind: QuestionKind;
  choices: string[];
  answer: string;
};

const CHOICE_COUNT = 4;

export function makeQuestion(
  word: Word,
  kind: QuestionKind,
  pool: readonly Word[],
  rand: Rand = Math.random,
): Question {
  const field = kind === "meaning" ? "ko" : "en";
  const answer = word[field];
  // 뜻이나 철자가 같은 단어는 정답이 둘이 되므로 오답 후보에서 뺀다.
  const candidates = pool.filter((w) => w.en !== word.en && w.ko !== word.ko);
  const distractors: string[] = [];
  for (const w of shuffle(candidates, rand)) {
    const value = w[field];
    if (value !== answer && !distractors.includes(value)) distractors.push(value);
    if (distractors.length === CHOICE_COUNT - 1) break;
  }
  return { word, kind, answer, choices: shuffle([answer, ...distractors], rand) };
}

/** 단어마다 두 번(뜻 → 철자/듣기) 묻는다. 같은 단어가 연달아 나오지 않도록 라운드를 나눈다. */
export function buildQuiz(
  words: readonly Word[],
  pool: readonly Word[],
  { canListen, rand = Math.random }: { canListen: boolean; rand?: Rand },
): Question[] {
  const first = shuffle(words, rand).map((w) => makeQuestion(w, "meaning", pool, rand));
  const second = shuffle(words, rand).map((w) =>
    makeQuestion(w, canListen && rand() < 0.5 ? "listen" : "spelling", pool, rand),
  );
  if (second.length > 1 && first.at(-1)?.word.en === second[0].word.en) {
    second.push(second.shift()!);
  }
  return [...first, ...second];
}

/** 틀린 문제는 보기를 섞어서 몇 문제 뒤에 다시 낸다. */
export function requeue(
  queue: readonly Question[],
  index: number,
  pool: readonly Word[],
  rand: Rand = Math.random,
): Question[] {
  const missed = queue[index];
  const retry = makeQuestion(missed.word, missed.kind, pool, rand);
  const at = Math.min(index + 3, queue.length);
  return [...queue.slice(0, at), retry, ...queue.slice(at)];
}
