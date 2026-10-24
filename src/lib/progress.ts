"use client";

import { useSyncExternalStore } from "react";
import type { SpeciesId } from "@/data/monsters";

// 서버가 없으므로 진도는 브라우저 localStorage에만 저장한다.
// 스키마를 바꿀 때는 version을 올리고 migrate()에 변환을 추가한다.
const STORAGE_KEY = "wordmon:progress";
const VERSION = 1;

export type Progress = {
  version: typeof VERSION;
  /** 몬스터별로 외운 단어(en) 목록 */
  learned: Partial<Record<SpeciesId, string[]>>;
};

const EMPTY: Progress = { version: VERSION, learned: {} };

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function migrate(raw: unknown): Progress {
  if (raw && typeof raw === "object" && (raw as Progress).version === VERSION) {
    return raw as Progress;
  }
  return EMPTY;
}

function read(): Progress {
  if (cache) return cache;
  try {
    const text = window.localStorage.getItem(STORAGE_KEY);
    cache = text ? migrate(JSON.parse(text)) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: Progress) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 시크릿 모드 등 저장소를 못 쓰는 환경에서는 이번 접속 동안만 유지된다.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function learnedOf(progress: Progress, id: SpeciesId): ReadonlySet<string> {
  return new Set(progress.learned[id] ?? []);
}

export function markLearned(id: SpeciesId, en: string) {
  const current = read();
  const list = current.learned[id] ?? [];
  if (list.includes(en)) return;
  write({ ...current, learned: { ...current.learned, [id]: [...list, en] } });
}

export function resetProgress() {
  write(EMPTY);
}
