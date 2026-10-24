# wordmon

초등학생용 영어 단어 수집 게임. 단어를 외우면 몬스터가 진화한다.

## 게임 규칙

- 몬스터 8마리 × 단어 100개 = 초등 권장 어휘 중심 800단어 (`src/data/words.ts`)
- 테마별로 몬스터가 정해져 있다: 동물과 자연, 음식과 맛, 학교와 직업, 집과 가족, 몸과 마음, 마을과 탈것, 숫자와 시간, 놀이와 동작
- 외운 단어 **10개 = 알**, **30개 = 1차 진화**, **100개 = 최종 진화**. 8마리 × 3단계 = 도감 24칸
- 한 번에 단어 5개: 단어 카드로 익히고 → 퀴즈(뜻 고르기 / 영어 고르기 / 듣고 고르기)에서 단어마다 2번 맞히면 '외운 단어'
- 틀린 문제는 몇 문제 뒤에 다시 나온다. 발음은 브라우저 내장 음성(Web Speech API)을 쓴다
- 진도는 브라우저 localStorage(`wordmon:progress`)에 저장된다

## 스택

- Next.js 16 (App Router, Turbopack) + React 19
- TypeScript (strict)
- Tailwind CSS 4
- ESLint 9

## 시작하기

```bash
npm install
npm run dev      # http://localhost:3000
```

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (정적 export → `out/`) |
| `npm start` | 빌드 결과 실행 (로컬 확인용) |
| `npm run lint` | ESLint |
| `npm run typecheck` | 라우트 타입 생성 + `tsc --noEmit` |
| `npm test` | 게임 로직·단어 데이터 테스트 (`node --test`) |

## 배포

`main`에 머지되면 GitHub Actions가 빌드해서 **GitHub Pages**에 올린다. 서버는 없다.

- URL: https://jake-labs.github.io/wordmon/
- `next.config.ts`가 `output: "export"`라서 빌드 결과물은 `out/` (정적 HTML/CSS/JS)
- project site라서 `BASE_PATH=/wordmon`으로 빌드한다 (`.github/workflows/deploy.yml`)
- 커스텀 도메인을 붙이면 `BASE_PATH`를 비우고 `public/CNAME`을 추가한다

### 정적 배포의 제약

서버 런타임이 없으므로 아래는 쓸 수 없다.

- SSR / ISR, `cookies()`, `headers()`, `middleware.ts`
- Server Actions, 동적 Route Handler
- `next/image` 기본 최적화 (`images.unoptimized: true`로 대체)

학습 진도 같은 사용자 데이터는 **브라우저 저장소(localStorage / IndexedDB)**에 둔다.
기기 간 동기화나 계정이 필요해지면 그때 Supabase 같은 BaaS를 붙이거나 호스팅을 옮긴다.

### 로컬에서 빌드 결과 확인

```bash
npm run build      # BASE_PATH 없이 빌드
npx serve out
```

`BASE_PATH=/wordmon`으로 빌드한 결과는 `/wordmon/` 하위 경로를 전제로 하므로 로컬 루트 서빙에서는 에셋이 404가 난다. 배포 환경과 동일하게 보려면 `BASE_PATH=/wordmon npm run build` 후 `out/`을 `/wordmon/` 경로에 마운트해서 확인한다.

## 개발 규칙

브랜치·커밋·PR·릴리스 규칙은 [docs/git-workflow.md](docs/git-workflow.md)를 따른다. 요약:

- `main`은 항상 배포 가능. 직접 push 금지(pre-push 훅이 차단).
- 작업은 `feat/…`, `fix/…` 등 짧은 브랜치(≤ 2일)에서 시작해 PR로 머지.
- 머지는 **Squash merge만**. 머지 후 브랜치는 자동 삭제.
- 커밋 메시지는 Conventional Commits (`feat(quiz): add streak counter`).
- PR마다 CI(lint → typecheck → test → build)가 돈다.

### 클론 직후

```bash
npm install   # prepare 스크립트가 core.hooksPath=.githooks 를 자동 설정
```
