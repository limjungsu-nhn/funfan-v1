# v1.03 → v1.04 마이그레이션 가이드

1·2차 핸드오프 이후 수신하는 개발자를 위한 브리지 문서.

---

## 한 줄 요약

페이지 HTML 내부의 `<style>` 블록이 `css/pages/*.css` 파일로 **추출**되었습니다.
**CSS 규칙의 내용은 100% 동일** · 파일 위치만 이동했습니다.

---

## 변경 매핑

| v1.03 위치 | v1.04 위치 |
|---|---|
| `index.html` 의 `<style>` 블록 | `css/pages/index.css` |
| `workspace.html` 의 `<style>` 블록 | `css/pages/workspace.css` |
| `workspace-onboarding.html` 의 `<style>` 블록 | `css/pages/workspace.css` + `css/pages/workspace-onboarding.css` |
| `workroom.html` 의 `<style>` 블록 | `css/pages/workroom.css` |
| `series-home.html` 의 `<style>` 블록 | `css/pages/series-home.css` |
| `series-post-management.html` 의 `<style>` 블록 | `css/pages/series-post-management.css` |
| `account-setting.html` 의 `<style>` 블록 | `css/pages/account-setting.css` |

각 HTML 파일의 해당 위치에는 이제 아래 한 줄만 있습니다:

```html
<!-- 페이지 전용 App Shell (구 <style> 블록) -->
<link rel="stylesheet" href="css/pages/<page>.css">
```

---

## 왜 바꿨나

1. **CLAUDE.md Rule #1** — "인라인 스타일·페이지 전용 임시 CSS 금지" 엄격 준수
2. **페이지 HTML은 마크업만** — 스타일은 항상 외부 CSS로 (컴포넌트 CSS 원칙과 동일)
3. **하드코딩 수치 정리** — `gap: 12px` 등 12곳을 `var(--space-3)` 등 토큰으로 치환

---

## 개발자 영향 요약

### React/Shadcn 이식 관점 — **영향 없음**
- 규칙의 **내용**(selector, 속성, 값)은 완전히 동일
- `components/*.css` → React 컴포넌트 · `pages/*.css` → React 레이아웃 컴포넌트로 이식하면 됨
- `design-tokens.json`, `tailwind-preset.ts`, `COMPONENTS.md` 등 **핸드오프 계약 문서는 그대로**

### HTML을 리터럴 레퍼런스로 보는 관점 — **인지 비용 약간 증가**
- 이전: `workroom.html` 하나만 열면 마크업 + 스타일 모두 확인 가능
- 현재: `workroom.html` (마크업) + `css/pages/workroom.css` (스타일) 양쪽을 열어야 함
- 대부분의 IDE에서 `<link href="...">` 클릭으로 즉시 이동 가능

### Diff 노이즈 — **1회성**
- v1.04 커밋에서 모든 페이지 HTML이 대규모로 바뀜 + 7개 CSS 파일 신규 추가
- 이후 페이지 레이아웃 수정은 `css/pages/*.css`만 바뀜 → **앞으로는 오히려 diff가 깔끔해짐**

---

## 이식 가이드

### components/ vs pages/ 차이
| 폴더 | 성격 | React 이식 단위 |
|---|---|---|
| `css/components/*.css` | 재사용 가능한 컴포넌트 (버튼, 카드 등) | 독립 컴포넌트 (`<Button>`, `<StatCard>`) |
| `css/pages/*.css` | 페이지 고유 App Shell · 레이아웃 | 페이지 레이아웃 컴포넌트 (`<WorkspaceLayout>`, `<WorkroomLayout>`) |

### pages/의 CSS를 React로 옮길 때
- 일반적으로 Next.js App Router라면 해당 페이지의 `layout.tsx` 또는 `page.tsx` 스타일로 이식
- 클래스명(`.workspace__timer`, `.timer-display` 등)은 필요시 CSS Module 또는 Tailwind 유틸리티로 변환
- `.workspace--mini`, `.mini-mode` 같은 modifier는 React state + conditional className 패턴으로

---

## 참고

- 자세한 변경 이력: [`CHANGELOG.md`](./CHANGELOG.md) v1.04 항목
- 파일 구조: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- 금지 사항/관행: [`CONVENTIONS.md`](./CONVENTIONS.md)
