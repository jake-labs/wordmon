"use client";

export function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** 브라우저 내장 음성(Web Speech API)으로 영어 발음을 들려준다. */
export function speak(text: string) {
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-US";
  utter.rate = 0.85;
  const voice = synth.getVoices().find((v) => v.lang === "en-US");
  if (voice) utter.voice = voice;
  synth.speak(utter);
}

let ctx: AudioContext | null = null;

function tone(freqs: number[], step: number, type: OscillatorType = "sine") {
  try {
    ctx ??= new AudioContext();
    const start = ctx.currentTime;
    freqs.forEach((freq, i) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const t = start + i * step;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + step * 1.6);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + step * 1.8);
    });
  } catch {
    // 오디오를 못 쓰는 환경이면 효과음 없이 진행한다.
  }
}

export const sfx = {
  correct: () => tone([660, 880], 0.09),
  wrong: () => tone([220, 180], 0.12, "triangle"),
  evolve: () => tone([523, 659, 784, 1047, 1319], 0.11),
};
