import { WORD_SETS, type Word } from "./words.ts";

export type SpeciesId = keyof typeof WORD_SETS;

export type Species = {
  id: SpeciesId;
  theme: string;
  /** 1차 진화 / 최종 진화 이름 */
  names: [first: string, final: string];
  color: string;
  light: string;
  dark: string;
  words: readonly Word[];
};

const define = (s: Omit<Species, "words">): Species => ({ ...s, words: WORD_SETS[s.id] });

export const SPECIES: readonly Species[] = [
  define({ id: "forest", theme: "동물과 자연", names: ["뾰롱", "뾰로롱"], color: "#4caf50", light: "#c8f2c2", dark: "#2e7d32" }),
  define({ id: "food", theme: "음식과 맛", names: ["냠냠", "냠냠킹"], color: "#ff9800", light: "#ffe2b3", dark: "#e65100" }),
  define({ id: "school", theme: "학교와 직업", names: ["연필몽", "박사몽"], color: "#3f8ef5", light: "#c9e0ff", dark: "#1a5bbf" }),
  define({ id: "home", theme: "집과 가족", names: ["포근", "포근포근"], color: "#f06ba8", light: "#ffd3e8", dark: "#c2185b" }),
  define({ id: "heart", theme: "몸과 마음", names: ["콩닥", "두근두근"], color: "#ef5350", light: "#ffcdd2", dark: "#b71c1c" }),
  define({ id: "town", theme: "마을과 탈것", names: ["부릉", "부릉부릉"], color: "#14b8a6", light: "#bff3ec", dark: "#0f766e" }),
  define({ id: "time", theme: "숫자와 시간", names: ["째깍", "째깍째깍"], color: "#9c6ade", light: "#e6d7fb", dark: "#6a3fb0" }),
  define({ id: "play", theme: "놀이와 동작", names: ["통통", "통통볼트"], color: "#f5c518", light: "#fff3b8", dark: "#b8860b" }),
];

export function getSpecies(id: string): Species | undefined {
  return SPECIES.find((s) => s.id === id);
}
