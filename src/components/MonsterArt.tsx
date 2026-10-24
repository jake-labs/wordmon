import type { ReactNode } from "react";
import type { Species, SpeciesId } from "@/data/monsters";
import type { Stage } from "@/lib/game";

type Props = {
  species: Species;
  stage: Stage;
  /** 도감에서 아직 못 만난 모습을 그림자로 보여줄 때 */
  silhouette?: boolean;
  animate?: boolean;
  className?: string;
};

type Palette = Pick<Species, "color" | "light" | "dark">;
type Shape = { cy: number; rx: number; ry: number };

const BABY: Shape = { cy: 124, rx: 56, ry: 50 };
const FINAL: Shape = { cy: 120, rx: 68, ry: 60 };

const INK = "#3b2f2f";
const STROKE = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round", strokeLinecap: "round" } as const;

export default function MonsterArt({ species, stage, silhouette, animate = true, className }: Props) {
  const motion = animate ? (stage === 1 ? "animate-wobble" : stage > 1 ? "animate-bob" : "") : "";
  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={silhouette ? "아직 만나지 못한 몬스터" : undefined}
      className={`${className ?? ""} ${silhouette ? "brightness-0 opacity-20" : ""}`}
    >
      <ellipse cx={100} cy={186} rx={stage === 3 ? 62 : 48} ry={8} fill="#000" opacity={0.08} />
      <g className={motion} style={{ transformOrigin: "100px 180px" }}>
        {stage === 0 && <Nest />}
        {stage === 1 && <Egg id={species.id} p={species} />}
        {stage >= 2 && <Creature id={species.id} p={species} final={stage === 3} />}
      </g>
    </svg>
  );
}

function Nest() {
  return (
    <g>
      <path d="M40 146 Q42 184 100 184 Q158 184 160 146Z" fill="#c69c6d" {...STROKE} />
      <ellipse cx={100} cy={146} rx={60} ry={12} fill="#8d6e4c" {...STROKE} />
      <path d="M56 162 Q80 170 104 164 M96 174 Q122 178 144 166" fill="none" stroke="#8d6e4c" strokeWidth={3} strokeLinecap="round" />
      <text x={100} y={126} textAnchor="middle" fontSize={64} fontWeight={700} fill="#c7bfb6">
        ?
      </text>
    </g>
  );
}

const EGG_PATTERNS: Record<SpeciesId, (p: Palette) => ReactNode> = {
  forest: (p) => (
    <>
      <ellipse cx={80} cy={95} rx={10} ry={16} transform="rotate(-30 80 95)" fill={p.color} />
      <ellipse cx={122} cy={130} rx={10} ry={16} transform="rotate(30 122 130)" fill={p.color} />
      <ellipse cx={92} cy={150} rx={7} ry={11} transform="rotate(-20 92 150)" fill={p.color} />
    </>
  ),
  food: (p) => (
    <>
      <circle cx={82} cy={100} r={9} fill={p.color} />
      <circle cx={120} cy={92} r={6} fill={p.color} />
      <circle cx={112} cy={135} r={11} fill={p.color} />
      <circle cx={80} cy={145} r={6} fill={p.color} />
    </>
  ),
  school: (p) => (
    <path d="M48 118 L64 106 L80 118 L96 106 L112 118 L128 106 L144 118 L152 112" fill="none" stroke={p.color} strokeWidth={8} strokeLinejoin="round" />
  ),
  home: (p) => (
    <>
      <path d={heartPath(85, 100, 10)} fill={p.color} />
      <path d={heartPath(120, 132, 12)} fill={p.color} />
      <path d={heartPath(88, 152, 7)} fill={p.color} />
    </>
  ),
  heart: (p) => <path d={heartPath(100, 122, 22)} fill={p.color} />,
  town: (p) => (
    <>
      <rect x={46} y={108} width={108} height={16} fill={p.color} />
      <rect x={60} y={113} width={14} height={6} rx={2} fill="#fff" />
      <rect x={93} y={113} width={14} height={6} rx={2} fill="#fff" />
      <rect x={126} y={113} width={14} height={6} rx={2} fill="#fff" />
    </>
  ),
  time: (p) => (
    <>
      <path d={starPath(84, 100, 11)} fill={p.color} />
      <path d={starPath(122, 128, 13)} fill={p.color} />
      <circle cx={92} cy={150} r={5} fill={p.color} />
    </>
  ),
  play: (p) => <path d="M108 62 L84 114 L104 114 L90 168 L124 104 L104 104 L118 62Z" fill={p.color} />,
};

function Egg({ id, p }: { id: SpeciesId; p: Palette }) {
  return (
    <g>
      <defs>
        <clipPath id={`egg-${id}`}>
          <ellipse cx={100} cy={115} rx={54} ry={68} />
        </clipPath>
      </defs>
      <ellipse cx={100} cy={115} rx={54} ry={68} fill={p.light} />
      <g clipPath={`url(#egg-${id})`}>{EGG_PATTERNS[id](p)}</g>
      <ellipse cx={100} cy={115} rx={54} ry={68} fill="none" {...STROKE} />
      <ellipse cx={78} cy={78} rx={10} ry={16} transform="rotate(25 78 78)" fill="#fff" opacity={0.7} />
    </g>
  );
}

function Creature({ id, p, final }: { id: SpeciesId; p: Palette; final: boolean }) {
  const s = final ? FINAL : BABY;
  const top = s.cy - s.ry;
  const bottom = s.cy + s.ry;
  const feature = FEATURES[id];
  return (
    <g>
      {feature.back?.(p, s, final)}
      {!feature.noFeet && (
        <>
          <ellipse cx={100 - s.rx * 0.5} cy={bottom - 2} rx={16} ry={10} fill={p.dark} {...STROKE} />
          <ellipse cx={100 + s.rx * 0.5} cy={bottom - 2} rx={16} ry={10} fill={p.dark} {...STROKE} />
        </>
      )}
      {final && (
        <>
          <ellipse cx={100 - s.rx + 4} cy={s.cy + 10} rx={12} ry={18} transform={`rotate(25 ${100 - s.rx + 4} ${s.cy + 10})`} fill={p.color} {...STROKE} />
          <ellipse cx={100 + s.rx - 4} cy={s.cy + 10} rx={12} ry={18} transform={`rotate(-25 ${100 + s.rx - 4} ${s.cy + 10})`} fill={p.color} {...STROKE} />
        </>
      )}
      <ellipse cx={100} cy={s.cy} rx={s.rx} ry={s.ry} fill={p.color} {...STROKE} />
      <ellipse cx={100} cy={s.cy + s.ry * 0.35} rx={s.rx * 0.58} ry={s.ry * 0.5} fill={p.light} />
      <Face cy={s.cy - s.ry * 0.2} final={final} />
      {feature.front?.(p, s, final)}
      <path d={`M${100 - s.rx * 0.55} ${top + 16} Q${100 - s.rx * 0.3} ${top + 4} ${100 - s.rx * 0.05} ${top + 6}`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.55} />
    </g>
  );
}

function Face({ cy, final }: { cy: number; final: boolean }) {
  const dx = final ? 24 : 21;
  const r = final ? 12 : 11;
  return (
    <g>
      {[-1, 1].map((side) => (
        <g key={side}>
          <circle cx={100 + side * dx} cy={cy} r={r} fill="#fff" stroke={INK} strokeWidth={3} />
          <circle cx={100 + side * dx + 2} cy={cy + 1} r={r * 0.6} fill={INK} />
          <circle cx={100 + side * dx + 5} cy={cy - 3} r={r * 0.25} fill="#fff" />
          {final && (
            <path d={`M${100 + side * (dx - 10)} ${cy - r - 6} L${100 + side * (dx + 10)} ${cy - r - 10}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          )}
          <ellipse cx={100 + side * (dx + 14)} cy={cy + 16} rx={8} ry={5} fill="#ff8fa3" opacity={0.7} />
        </g>
      ))}
      {final ? (
        <path d={`M86 ${cy + 16} Q100 ${cy + 34} 114 ${cy + 16}Z`} fill="#c0392b" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      ) : (
        <path d={`M92 ${cy + 17} Q100 ${cy + 24} 108 ${cy + 17}`} fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      )}
    </g>
  );
}

type Draw = (p: Palette, s: Shape, final: boolean) => ReactNode;
const FEATURES: Record<SpeciesId, { back?: Draw; front?: Draw; noFeet?: boolean }> = {
  forest: {
    back: (p, s, final) =>
      final && (
        <>
          {[-40, 0, 40].map((deg) => (
            <ellipse key={deg} cx={100} cy={s.cy - s.ry - 12} rx={13} ry={28} transform={`rotate(${deg} 100 ${s.cy - s.ry + 14})`} fill="#7ed957" {...STROKE} />
          ))}
          <path d={`M${100 + s.rx - 10} ${s.cy + 30} Q${190} ${s.cy + 20} ${186} ${s.cy - 20} Q${150} ${s.cy - 6} ${100 + s.rx - 14} ${s.cy + 18}Z`} fill="#7ed957" {...STROKE} />
        </>
      ),
    front: (p, s, final) => {
      const top = s.cy - s.ry;
      return final ? (
        <g>
          {[0, 72, 144, 216, 288].map((deg) => (
            <circle key={deg} cx={round(100 + 8 * Math.cos((deg * Math.PI) / 180))} cy={round(top + 2 + 8 * Math.sin((deg * Math.PI) / 180))} r={6} fill="#ff9ecb" stroke={INK} strokeWidth={2} />
          ))}
          <circle cx={100} cy={top + 2} r={5} fill="#ffd54f" stroke={INK} strokeWidth={2} />
        </g>
      ) : (
        <g>
          <path d={`M100 ${top + 2} L100 ${top - 16}`} stroke={p.dark} strokeWidth={5} strokeLinecap="round" />
          <ellipse cx={88} cy={top - 20} rx={13} ry={7} transform={`rotate(-25 88 ${top - 20})`} fill="#7ed957" {...STROKE} />
          <ellipse cx={112} cy={top - 20} rx={13} ry={7} transform={`rotate(25 112 ${top - 20})`} fill="#7ed957" {...STROKE} />
        </g>
      );
    },
  },
  food: {
    front: (p, s, final) => {
      const top = s.cy - s.ry;
      return final ? (
        <g>
          <circle cx={80} cy={top - 14} r={16} fill="#fff" {...STROKE} />
          <circle cx={120} cy={top - 14} r={16} fill="#fff" {...STROKE} />
          <circle cx={100} cy={top - 24} r={19} fill="#fff" {...STROKE} />
          <rect x={72} y={top - 10} width={56} height={18} rx={4} fill="#fff" {...STROKE} />
        </g>
      ) : (
        <g>
          <path d={`M100 ${top + 2} Q104 ${top - 14} 116 ${top - 22}`} fill="none" stroke="#5d4037" strokeWidth={4} strokeLinecap="round" />
          <ellipse cx={116} cy={top - 24} rx={9} ry={5} transform={`rotate(-30 116 ${top - 24})`} fill="#7ed957" stroke={INK} strokeWidth={2} />
          <circle cx={98} cy={top - 6} r={11} fill="#e53935" {...STROKE} />
          <circle cx={94} cy={top - 9} r={3} fill="#fff" opacity={0.8} />
        </g>
      );
    },
  },
  school: {
    front: (p, s, final) => {
      const top = s.cy - s.ry;
      const eyeY = s.cy - s.ry * 0.2;
      return final ? (
        <g>
          <circle cx={76} cy={eyeY} r={17} fill="none" stroke={INK} strokeWidth={4} />
          <circle cx={124} cy={eyeY} r={17} fill="none" stroke={INK} strokeWidth={4} />
          <path d={`M93 ${eyeY} L107 ${eyeY}`} stroke={INK} strokeWidth={4} />
          <rect x={78} y={top - 6} width={44} height={16} fill={INK} />
          <path d={`M100 ${top - 24} L150 ${top - 8} L100 ${top + 6} L50 ${top - 8}Z`} fill="#37474f" {...STROKE} />
          <path d={`M100 ${top - 8} L142 ${top + 2} L142 ${top + 22}`} fill="none" stroke="#ffd54f" strokeWidth={4} strokeLinecap="round" />
          <circle cx={142} cy={top + 26} r={5} fill="#ffd54f" />
        </g>
      ) : (
        <g transform={`rotate(15 100 ${top})`}>
          <rect x={93} y={top - 30} width={14} height={30} fill="#ffd54f" {...STROKE} />
          <rect x={93} y={top - 40} width={14} height={10} rx={3} fill="#ff8fa3" {...STROKE} />
          <path d={`M93 ${top} L100 ${top + 12} L107 ${top}Z`} fill="#f5d5a8" {...STROKE} />
        </g>
      );
    },
  },
  home: {
    back: (p, s, final) => {
      const top = s.cy - s.ry;
      const len = final ? 40 : 28;
      return (
        <>
          <ellipse cx={72} cy={top - len / 2 + 14} rx={13} ry={len} transform={`rotate(${final ? -15 : -40} 72 ${top + 14})`} fill={p.color} {...STROKE} />
          <ellipse cx={128} cy={top - len / 2 + 14} rx={13} ry={len} transform={`rotate(${final ? 15 : 40} 128 ${top + 14})`} fill={p.color} {...STROKE} />
          <ellipse cx={72} cy={top - len / 2 + 16} rx={6} ry={len - 10} transform={`rotate(${final ? -15 : -40} 72 ${top + 14})`} fill={p.light} />
          <ellipse cx={128} cy={top - len / 2 + 16} rx={6} ry={len - 10} transform={`rotate(${final ? 15 : 40} 128 ${top + 14})`} fill={p.light} />
        </>
      );
    },
    front: (p, s, final) => {
      if (!final) return null;
      const top = s.cy - s.ry;
      const neck = s.cy + s.ry * 0.12;
      return (
        <g>
          <path d={`M44 ${neck} Q100 ${neck + 26} 156 ${neck} L156 ${neck + 12} Q100 ${neck + 38} 44 ${neck + 12}Z`} fill="#ffd54f" {...STROKE} />
          <rect x={124} y={neck + 12} width={14} height={30} rx={4} fill="#ffd54f" {...STROKE} />
          <path d={`M100 ${top + 8} L80 ${top - 4} L80 ${top + 20}Z M100 ${top + 8} L120 ${top - 4} L120 ${top + 20}Z`} fill="#ff5c8a" {...STROKE} />
          <circle cx={100} cy={top + 8} r={6} fill="#ff5c8a" {...STROKE} />
        </g>
      );
    },
  },
  heart: {
    back: (p, s, final) =>
      final && (
        <>
          <path d={heartPath(32, s.cy - 22, 28)} transform={`rotate(-30 32 ${s.cy - 22})`} fill="#ff9eaa" {...STROKE} />
          <path d={heartPath(168, s.cy - 22, 28)} transform={`rotate(30 168 ${s.cy - 22})`} fill="#ff9eaa" {...STROKE} />
        </>
      ),
    front: (p, s, final) => {
      const top = s.cy - s.ry;
      return (
        <g>
          <path d={heartPath(100, s.cy + s.ry * 0.42, final ? 17 : 13)} fill="#fff" {...STROKE} strokeWidth={3} />
          <path d={`M100 ${top + 2} Q96 ${top - 14} 100 ${top - 22}`} fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
          <path d={heartPath(100, top - 28, final ? 11 : 8)} fill={p.dark} {...STROKE} strokeWidth={3} />
        </g>
      );
    },
  },
  town: {
    noFeet: true,
    back: (p, s, final) =>
      final && (
        <>
          <path d={`M${100 - s.rx + 8} ${s.cy - 10} L${14} ${s.cy - 34} L${26} ${s.cy + 4}Z`} fill={p.light} {...STROKE} />
          <path d={`M${100 + s.rx - 8} ${s.cy - 10} L${186} ${s.cy - 34} L${174} ${s.cy + 4}Z`} fill={p.light} {...STROKE} />
        </>
      ),
    front: (p, s, final) => {
      const top = s.cy - s.ry;
      const bottom = s.cy + s.ry;
      const wheel = (cx: number) => (
        <g key={cx}>
          <circle cx={cx} cy={bottom} r={final ? 15 : 12} fill="#455a64" {...STROKE} />
          <circle cx={cx} cy={bottom} r={5} fill="#cfd8dc" />
        </g>
      );
      return (
        <g>
          {wheel(100 - s.rx * 0.5)}
          {wheel(100 + s.rx * 0.5)}
          <path d={`M100 ${top + 2} L100 ${top - 20}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          {final ? (
            <g>
              <rect x={88} y={top - 52} width={24} height={36} rx={7} fill="#37474f" {...STROKE} />
              <circle cx={100} cy={top - 44} r={4} fill="#ef5350" />
              <circle cx={100} cy={top - 34} r={4} fill="#ffd54f" />
              <circle cx={100} cy={top - 24} r={4} fill="#66bb6a" />
            </g>
          ) : (
            <circle cx={100} cy={top - 26} r={9} fill="#ffd54f" {...STROKE} />
          )}
        </g>
      );
    },
  },
  time: {
    back: (p, s, final) =>
      final && (
        <>
          <path d={starPath(62, s.cy - s.ry - 4, 16)} fill="#ffd54f" {...STROKE} />
          <path d={starPath(138, s.cy - s.ry - 4, 16)} fill="#ffd54f" {...STROKE} />
          <path d={`M${100 + s.rx - 8} ${s.cy + 20} Q${196} ${s.cy + 10} ${180} ${s.cy - 46} Q${186} ${s.cy} ${100 + s.rx - 12} ${s.cy + 6}Z`} fill="#ffd54f" {...STROKE} />
        </>
      ),
    front: (p, s, final) => {
      const cy = s.cy + s.ry * 0.4;
      const r = final ? 19 : 15;
      return (
        <g>
          <circle cx={100} cy={cy} r={r} fill="#fff" {...STROKE} strokeWidth={3} />
          <path d={`M100 ${cy} L100 ${cy - r + 5} M100 ${cy} L${100 + r - 7} ${cy}`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
          {!final && <circle cx={100} cy={s.cy - s.ry - 6} r={7} fill={p.dark} {...STROKE} strokeWidth={3} />}
        </g>
      );
    },
  },
  play: {
    back: (p, s, final) => {
      const k = final ? 1.15 : 1;
      const x = 100 + s.rx - (final ? 24 : 12);
      const y = s.cy + 14;
      return (
        <path
          d={`M${x} ${y} L${x + 26 * k} ${y - 14 * k} L${x + 18 * k} ${y - 22 * k} L${x + 44 * k} ${y - 44 * k} L${x + 20 * k} ${y - 36 * k} L${x + 28 * k} ${y - 28 * k} L${x - 2} ${y - 18}Z`}
          fill="#ffe066"
          {...STROKE}
        />
      );
    },
    front: (p, s, final) => {
      const top = s.cy - s.ry;
      return final ? (
        <g>
          <path d={`M${100 - s.rx * 0.82} ${top + 30} Q100 ${top + 10} ${100 + s.rx * 0.82} ${top + 30} L${100 + s.rx * 0.88} ${top + 42} Q100 ${top + 22} ${100 - s.rx * 0.88} ${top + 42}Z`} fill="#ef5350" {...STROKE} strokeWidth={3} />
          <path d={starPath(100, top + 24, 7)} fill="#fff" />
          <path d={`M${100 - s.rx * 0.5} ${top + 8} L${100 - s.rx * 0.62} ${top - 22} L${100 - s.rx * 0.2} ${top + 2}Z`} fill={p.color} {...STROKE} />
          <path d={`M${100 + s.rx * 0.5} ${top + 8} L${100 + s.rx * 0.62} ${top - 22} L${100 + s.rx * 0.2} ${top + 2}Z`} fill={p.color} {...STROKE} />
        </g>
      ) : (
        <g>
          <path d={`M${100 - s.rx * 0.5} ${top + 10} L${100 - s.rx * 0.6} ${top - 14} L${100 - s.rx * 0.18} ${top + 3}Z`} fill={p.color} {...STROKE} />
          <path d={`M${100 + s.rx * 0.5} ${top + 10} L${100 + s.rx * 0.6} ${top - 14} L${100 + s.rx * 0.18} ${top + 3}Z`} fill={p.color} {...STROKE} />
        </g>
      );
    },
  },
};

// 삼각함수 결과는 서버(Node)와 브라우저에서 끝자리가 달라 하이드레이션이 어긋나므로 반올림한다.
function round(n: number) {
  return Math.round(n * 10) / 10;
}

function heartPath(cx: number, cy: number, s: number) {
  return `M${cx} ${cy + s * 0.9} C${cx - s * 1.5} ${cy + s * 0.1} ${cx - s * 0.9} ${cy - s * 1.1} ${cx} ${cy - s * 0.35} C${cx + s * 0.9} ${cy - s * 1.1} ${cx + s * 1.5} ${cy + s * 0.1} ${cx} ${cy + s * 0.9}Z`;
}

function starPath(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    return `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
  });
  return `M${pts.join(" L")}Z`;
}
