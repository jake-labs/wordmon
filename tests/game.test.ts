import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SPECIES } from "../src/data/monsters.ts";
import {
  buildQuiz,
  makeQuestion,
  MILESTONES,
  nextMilestone,
  pickStudyWords,
  requeue,
  stageFor,
} from "../src/lib/game.ts";

// 테스트를 재현 가능하게 만드는 고정 시드 난수
function seeded(seed = 42) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2 ** 31;
    return seed / 2 ** 31;
  };
}

describe("word data", () => {
  it("has 100 words per monster so the final evolution is reachable", () => {
    for (const s of SPECIES) assert.equal(s.words.length, MILESTONES.at(-1)!.count, s.id);
  });

  it("has no duplicate english words across all monsters", () => {
    const all = SPECIES.flatMap((s) => s.words.map((w) => w.en.toLowerCase()));
    assert.equal(new Set(all).size, all.length);
  });
});

describe("stageFor", () => {
  it("follows the 10 / 30 / 100 milestones", () => {
    assert.equal(stageFor(0), 0);
    assert.equal(stageFor(9), 0);
    assert.equal(stageFor(10), 1);
    assert.equal(stageFor(29), 1);
    assert.equal(stageFor(30), 2);
    assert.equal(stageFor(99), 2);
    assert.equal(stageFor(100), 3);
  });

  it("reports the next milestone", () => {
    assert.equal(nextMilestone(12)?.count, 30);
    assert.equal(nextMilestone(100), undefined);
  });
});

describe("pickStudyWords", () => {
  const words = SPECIES[0].words;

  it("picks the first unlearned words in order", () => {
    const learned = new Set([words[0].en, words[2].en]);
    const { words: picked, review } = pickStudyWords(words, learned);
    assert.equal(review, false);
    assert.deepEqual(
      picked.map((w) => w.en),
      [words[1], words[3], words[4], words[5], words[6]].map((w) => w.en),
    );
  });

  it("switches to review when everything is learned", () => {
    const { words: picked, review } = pickStudyWords(words, new Set(words.map((w) => w.en)), seeded());
    assert.equal(review, true);
    assert.equal(picked.length, 5);
  });
});

describe("quiz", () => {
  const pool = SPECIES.find((s) => s.id === "heart")!.words;

  it("never offers a second correct answer among the choices", () => {
    const rand = seeded(7);
    for (const word of pool) {
      for (const kind of ["meaning", "spelling", "listen"] as const) {
        const q = makeQuestion(word, kind, pool, rand);
        assert.equal(q.choices.length, 4);
        assert.equal(new Set(q.choices).size, 4);
        assert.equal(q.choices.filter((c) => c === q.answer).length, 1);
        const field = kind === "meaning" ? "ko" : "en";
        const other = field === "ko" ? "en" : "ko";
        for (const c of q.choices) {
          if (c === q.answer) continue;
          const match = pool.find((w) => w[field] === c)!;
          assert.notEqual(match[other], word[other], `${word.en}: ${c}`);
        }
      }
    }
  });

  it("asks every word twice without back-to-back repeats", () => {
    const words = pool.slice(0, 5);
    for (let seed = 1; seed < 50; seed++) {
      const quiz = buildQuiz(words, pool, { canListen: true, rand: seeded(seed) });
      assert.equal(quiz.length, 10);
      for (const w of words) assert.equal(quiz.filter((q) => q.word.en === w.en).length, 2);
      for (let i = 1; i < quiz.length; i++) assert.notEqual(quiz[i].word.en, quiz[i - 1].word.en);
    }
  });

  it("re-asks a missed question a few questions later", () => {
    const quiz = buildQuiz(pool.slice(0, 5), pool, { canListen: false, rand: seeded() });
    const next = requeue(quiz, 1, pool, seeded());
    assert.equal(next.length, quiz.length + 1);
    assert.equal(next[4].word.en, quiz[1].word.en);
    assert.equal(next[4].kind, quiz[1].kind);
  });
});
