# FunFan v1.0 — 개발자 첫 실행 가이드

프로토타입을 로컬에서 띄우고, Shadcn/Tailwind 프로젝트에 토큰을 연결하는 방법.

---

## 0. 전제

- 디자인 프로토타입 저장소를 **clone**해둔 상태
- Python 3 설치 (대부분의 mac/linux에 기본 포함)
- 개발 쪽은 별도의 React/Next.js 프로젝트 준비됨

---

## 1. 프로토타입 로컬 실행

```bash
cd /path/to/funfan-v1
python3 -m http.server 8788
```

브라우저:
- http://localhost:8788/index.html — **페이지 인덱스**(모든 페이지 링크 + 구현 상태 ✅/⏳)
- http://localhost:8788/styleguide.html — **컴포넌트 쇼케이스(가장 중요)**
- http://localhost:8788/workspace.html — 작업실 대시보드
- http://localhost:8788/workroom.html — 워크룸 (normal)
- http://localhost:8788/workroom.html?mode=mini&tab=0 — 워크룸 (mini/공개)
- http://localhost:8788/workroom.html?mode=mini&tab=1 — 워크룸 (mini/비공개)
- http://localhost:8788/workspace-onboarding.html — 워크스페이스 온보딩
- http://localhost:8788/creative-partner-onboarding-01.html ~ `05.html` — 파트너 온보딩 5단계
- http://localhost:8788/series-home.html — 시리즈 홈
- http://localhost:8788/series-post-management.html — 시리즈 관리
- http://localhost:8788/account-setting.html — 크리에이터 설정
- http://localhost:8788/reader-account-setting.html — 리더 설정
- http://localhost:8788/mypage.html — 마이페이지 (Phase 0: 프로필 헤더 + 설정 진입)

> 포트 8788은 `.claude/launch.json` 기준. 다른 포트로 띄워도 무방.

---

## 2. Tailwind 프로젝트에 토큰 연결

### 2-1. 파일 복사
`handoff/tailwind-preset.ts`를 개발 프로젝트에 복사.
권장 위치: `src/styles/tailwind-preset.ts` 또는 프로젝트 루트 `design/tailwind-preset.ts`.

### 2-2. `tailwind.config.ts`에 등록
```ts
import type { Config } from 'tailwindcss';
import funfanPreset from './src/styles/tailwind-preset';

export default {
  presets: [funfanPreset],
  content: ['./src/**/*.{ts,tsx}'],
  // 추가 커스터마이징은 여기서
} satisfies Config;
```

### 2-3. 기본 스타일
```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* body 기본값 */
html, body {
  font-family: theme('fontFamily.base');
  font-size: theme('fontSize.body-md[0]');
  line-height: theme('fontSize.body-md[1].lineHeight');
  min-width: theme('minWidth.base'); /* 1440px */
}
```

### 2-4. 동작 확인
```tsx
// 토큰이 잘 연결됐는지 간단 테스트
<button className="bg-nature-3 hover:bg-nature-2 text-white-100 px-space-4 py-space-2 rounded-lg">
  Test
</button>
```

nature-3(진한 초록) 배경에 hover 시 nature-2(더 진함)로 변하면 성공.

---

## 3. 컴포넌트 구현 시작 순서 (권장)

### Phase 1 — Foundation
1. **Typography** utility 적용 검증
2. **Button** (cva 재정의 — `COMPONENTS.md` 참고)
3. **Icon** 치환 (`ICONS.md`의 lucide 매핑)

### Phase 2 — Form
4. **Input** / **Textarea** / **Checkbox** / **RadioCard**

### Phase 3 — Layout
5. **Navbar** / **LeftPanel** / **RightPanel** / **PanelHeader**

### Phase 4 — Data
6. **StatCard** / **RevenueCard**(차트) / **ReviewItem**

### Phase 5 — AI 채팅
7. **ChatMsg** / **MyMsg** / **ChatInput** / **SendBtn**
8. `chat.js` 로직을 React hook으로 포팅 (useChat, useTypewriter)

### Phase 6 — Workroom
9. **TaskList** / **TimerDisplay** / 상태 머신

---

## 4. 페이지 매핑 예시

프로토 페이지 → 개발 라우트 예시:

| 프로토 | 권장 라우트 |
|---|---|
| `workspace.html` | `/app` 또는 `/dashboard` |
| `workroom.html` | `/workroom` |
| `workroom.html?mode=mini` | `/workroom/session?tab=public` (쿼리 or 상태) |
| `workspace-onboarding.html` | `/onboarding` |
| `account-setting.html` | `/settings/account` |
| `series-post-management.html` | `/series` |

---

## 5. 디자인 업데이트 동기화 워크플로우

프로토가 업데이트될 때:

1. 디자인 쪽이 저장소 push + 업데이트 공지
2. 개발 쪽: `git pull` 후 `handoff/` 확인
3. **토큰 변경이 있으면** `tailwind-preset.ts` 덮어쓰기
4. **컴포넌트 추가가 있으면** `COMPONENTS.md` + `styleguide.html` 확인 → 신규 variant 추가
5. **아이콘 추가가 있으면** `ICONS.md` → lucide 치환

---

## 6. 자주 묻는 질문

**Q. 프로토타입의 Cloudflare Wrangler(`.wrangler/`)는 뭐죠?**
A. 디자인 쪽이 `wrangler pages dev`로 띄워본 흔적입니다. `.gitignore`에 있으므로 무시. 정식 실행은 `python3 -m http.server`.

**Q. 왜 몇 페이지(workspace-onboarding 등)는 채팅이 미리 구현돼 있지?**
A. 프로토는 `Chat.setup({ root, getReply })` 함수 하나로 공통화되어 있습니다. React 쪽에서는 `<ChatPanel getReply={...} />` 컴포넌트로 추상화 추천.

**Q. 다크모드 대응은?**
A. **현재 프로토는 미지원.** 추후 디자인에서 토큰을 `--color-*`와 `--color-*-dark`로 분리할 예정. Tailwind 쪽은 `dark:` variant 사용 가능하게 구조만 준비.

**Q. i18n은?**
A. 프로토는 **일본어 고정**(UI 카피). 실제 서비스는 i18n 준비 필요.

**Q. 브라우저 지원 범위는?**
A. 프로토는 **최신 Chrome/Safari** 기준. `:has()` 선택자 사용 중(input-wood의 focus-visible). 개발은 프로젝트 정책 따름.

---

## 7. 긴급 참조

- **프로토 저장소**: `https://github.com/limjungsu-nhn/funfan-v1`
- **핸드오프 문서**: `handoff/`
- **실제 렌더**: `http://localhost:8788/styleguide.html`
- **디자인 규칙 원본**: `CLAUDE.md`
