# wordmon Git 브랜치 전략

**전제: 1인 개발 + main 머지 시 자동 배포**

배포 단위가 곧 `main`이므로, `develop`/`release` 같은 상시 브랜치는 두지 않는다.
모든 작업은 **1~2일 안에 끝나는 짧은 브랜치**로 만들고, `main`은 항상 배포 가능한 상태로 유지한다.
(Trunk-based development + Squash Merge)

---

## 1. 브랜치 모델

```
main ──●────●────●────────●────●────●──▶  (항상 배포 가능 / 보호됨)
        \        /          \       /
         ●──●──●            ●──●──●
       feat/...            fix/...
        (≤ 2일)             (≤ 2일)
```

| 브랜치 | 역할 | 수명 |
| --- | --- | --- |
| `main` | 배포 브랜치. 직접 push 금지 | 영구 |
| `feat/*` | 기능 개발 | ≤ 2일 |
| `fix/*` | 버그 수정 | ≤ 1일 |
| `chore/*`, `docs/*`, `refactor/*`, `test/*`, `perf/*` | 그 외 | 수 시간 ~ 1일 |
| `hotfix/*` | 운영 장애 긴급 수정 (똑같이 `main`에서 분기 → PR) | 수 시간 |

**규칙**

- 모든 브랜치는 `main`에서 분기하고 `main`으로 돌아간다.
- 2일을 넘길 것 같으면 기능을 쪼갠다. 불가능하면 feature flag(`if (flags.newEditor)`)로 숨겨서 먼저 머지한다.
- 머지된 브랜치는 즉시 삭제한다(로컬/원격 모두).

## 2. 브랜치 네이밍

```
<type>/<이슈번호?>-<kebab-case-요약>
```

```
feat/12-daily-streak
fix/27-quiz-crash-on-empty
refactor/extract-scoring-service
docs/git-workflow
hotfix/41-login-500
```

- 영문 소문자 + 하이픈만. 한글/공백/대문자 금지.
- 이슈 번호가 있으면 붙인다(없으면 생략).
- `feature/`, `bugfix/` 같은 축약 없는 이름은 쓰지 않는다.

## 3. 커밋 컨벤션 (Conventional Commits)

```
<type>(<scope>): <subject>

<body: 왜 바꿨는지>

<footer: BREAKING CHANGE / Refs #12>
```

| type | 용도 |
| --- | --- |
| `feat` | 사용자에게 보이는 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 동작 변화 없는 구조 개선 |
| `perf` | 성능 개선 |
| `test` | 테스트 추가/수정 |
| `docs` | 문서 |
| `chore` | 빌드/설정/의존성 |
| `style` | 포맷팅(로직 무변경) |

```
feat(quiz): add streak counter to result screen
fix(auth): handle expired refresh token on cold start
chore(deps): bump vite to 6.1.0
```

- subject는 명령문·소문자 시작·마침표 없음, 50자 이내.
- `wip`, `임시`, `수정` 같은 커밋은 만들지 않는다(쌓이면 PR 전에 `git rebase -i`로 정리).
- 커밋 하나 = 논리적 변경 하나. 포맷팅과 로직 변경은 분리한다.

### 커밋 메시지 자동 검사

`.githooks/commit-msg`에 있고, `core.hooksPath`로 연결되어 있다(저장소에 버전 관리됨).

```bash
git config core.hooksPath .githooks   # 클론 후 1회
```

`feat|fix|refactor|perf|test|docs|chore|style|build|ci` 외의 type, 72자 초과 첫 줄은 커밋이 거부된다.
우회가 필요하면 `git commit --no-verify`.

## 4. 일상 작업 흐름

```bash
# 1) 최신 main에서 시작
git switch main
git pull --ff-only

# 2) 브랜치 생성
git switch -c feat/12-daily-streak

# 3) 작업 — 커밋은 작게, 자주
git add -p
git commit -m "feat(quiz): add streak counter to result screen"

# 4) 머지 전 main 위로 정리
git fetch origin
git rebase origin/main

# 5) push + PR
git push -u origin HEAD
gh pr create --fill --base main

# 6) 리뷰(1인이면 셀프 리뷰: diff 전체 훑기) → Squash Merge
gh pr merge --squash --delete-branch

# 7) 로컬 정리
git switch main && git pull --ff-only && git branch -d feat/12-daily-streak
```

- **머지는 Squash Merge만** 사용한다. `main` 히스토리가 PR 1개 = 커밋 1개로 선형 유지된다.
- `main`에는 merge commit / rebase merge를 허용하지 않는다(히스토리 파편화 방지).
- PR은 작을수록 좋다: 리뷰 기준 **400줄 이내**, 파일 10개 이내.

## 5. PR 규칙 (1인이라도 PR을 쓰는 이유)

1인이어도 PR을 남기면 ① CI 게이트 ② 변경 이유 기록 ③ 셀프 리뷰 강제 ④ 롤백 단위 확보라는 이점이 있다.

- 제목은 커밋 컨벤션과 동일하게.
- 본문: **무엇을 / 왜 / 어떻게 확인했는지** 3줄 이상. 스크린샷은 UI 변경 시.
- Draft PR로 일찍 올려 CI를 먼저 돌려도 된다.
- 머지 조건: CI green + (셀프)리뷰 완료 + `main` 최신 상태.

## 6. 릴리스와 태깅

배포는 `main` push로 자동이지만, **버전 태그**는 따로 찍어 롤백 지점을 만든다.

- SemVer: `MAJOR.MINOR.PATCH` — 파괴적 변경 / 기능 추가 / 버그 수정
- 태그는 annotated: `git tag -a v0.2.0 -m "v0.2.0: 스트릭, 오답노트"`
- CHANGELOG는 커밋 메시지에서 자동 생성(Conventional Commits 덕분).
  - 옵션 A: `release-please` GitHub Action (PR 기반, 권장)
  - 옵션 B: 수동 `git-cliff` / `conventional-changelog`

```bash
gh release create v0.2.0 --generate-notes --target main
```

## 7. 배포 & 롤백

| 상황 | 대응 |
| --- | --- |
| 방금 머지한 PR이 문제 | `gh pr revert` 로 revert PR 생성 → Squash Merge (히스토리 보존) |
| 태그 단위 롤백 | 이전 태그로 재배포 (Vercel/Cloud Run이면 대시보드에서 promote) |
| 긴급 수정 | `hotfix/*` → PR → Squash Merge → patch 태그 |
| DB 마이그레이션 | 항상 **뒤로 호환**되게 2단계로 (추가 → 배포 → 정리). 롤백해도 스키마가 깨지지 않아야 함 |

- `git reset --hard` + force push로 `main`을 되돌리지 않는다.
- 배포 후 5분은 로그/에러율을 확인한다(자동 배포의 유일한 안전장치).

## 8. main 보호 설정

**현재 상태: private 저장소 + Free 플랜이라 GitHub 브랜치 보호는 사용할 수 없다**
(`403 Upgrade to GitHub Pro or make this repository public`). 대신 3중으로 막는다.

| 수단 | 내용 | 적용 위치 |
| --- | --- | --- |
| 로컬 pre-push 훅 | `main` 직접 push 차단 | `.githooks/pre-push` |
| 머지 방식 제한 | Squash merge만 허용, 머지 후 브랜치 자동 삭제 | 저장소 설정 |
| CI | PR마다 lint/typecheck/test/build, 빨간 PR은 머지하지 않는 규율 | `.github/workflows/ci.yml` |

```bash
# 이미 적용됨 — 저장소 머지 정책
gh api -X PATCH repos/jake-labs/wordmon \
  -F allow_squash_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=false \
  -F delete_branch_on_merge=true
```

> 공개 저장소로 전환하거나 GitHub Pro로 업그레이드하면 아래를 켠다.
>
> ```bash
> gh api -X PUT repos/jake-labs/wordmon/branches/main/protection \
>   -F "required_status_checks[strict]=true" \
>   -F "required_status_checks[contexts][]=verify" \
>   -F "enforce_admins=true" \
>   -F "required_pull_request_reviews[required_approving_review_count]=0" \
>   -F "restrictions=" \
>   -F "allow_force_pushes=false" \
>   -F "allow_deletions=false"
> ```

## 9. 로컬 git 설정 (권장)

```bash
git config --global pull.ff only          # 암묵적 merge commit 방지
git config --global fetch.prune true      # 삭제된 원격 브랜치 정리
git config --global rebase.autoStash true # rebase 전 변경사항 자동 stash
git config --global rerere.enabled true   # 같은 충돌 재해결 방지
git config --global merge.conflictstyle zdiff3

git config --global alias.st "status -sb"
git config --global alias.lg "log --oneline --graph --decorate -20"
git config --global alias.sw "switch"
git config --global alias.sync "!git switch main && git pull --ff-only"
git config --global alias.cleanup "!git branch --merged main | grep -v main | xargs -r git branch -d"
```

## 10. CI 최소 구성

PR마다: `lint → typecheck → test → build`. `main` push 시: 위 + 배포.
`.github/workflows/ci.yml` 하나로 시작하고, 배포는 같은 워크플로의 `main` 조건 job으로 붙인다.

## 11. PR 전 체크리스트

- [ ] `git rebase origin/main` 완료, 로컬 테스트 통과
- [ ] 커밋 메시지 Conventional Commits 형식
- [ ] 디버그 로그/`console.log`/주석 처리된 코드 제거
- [ ] 비밀값 하드코딩 없음 (`.env`는 커밋 금지)
- [ ] PR 본문에 무엇을/왜/검증 방법 기재
- [ ] UI 변경 시 스크린샷 첨부
