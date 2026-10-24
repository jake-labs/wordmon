# wordmon

영어 단어 학습 앱.

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
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 빌드 결과 실행 |
| `npm run lint` | ESLint |
| `npm run typecheck` | 라우트 타입 생성 + `tsc --noEmit` |

## 개발 규칙

브랜치·커밋·PR·릴리스 규칙은 [docs/git-workflow.md](docs/git-workflow.md)를 따른다. 요약:

- `main`은 항상 배포 가능. 직접 push 금지(pre-push 훅이 차단).
- 작업은 `feat/…`, `fix/…` 등 짧은 브랜치(≤ 2일)에서 시작해 PR로 머지.
- 머지는 **Squash merge만**. 머지 후 브랜치는 자동 삭제.
- 커밋 메시지는 Conventional Commits (`feat(quiz): add streak counter`).
- PR마다 CI(lint → typecheck → test → build)가 돈다.

### 클론 직후 1회

```bash
git config core.hooksPath .githooks
```
