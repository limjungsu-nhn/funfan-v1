# FunFan v1.0 — 프로젝트 구조

이 문서는 **왜 이렇게 구성되어 있는지**와 **파일이 어떻게 연결되는지**를 설명합니다.
개발자가 프로토타입을 읽고 Shadcn/Tailwind로 재구현할 때 참고용.

---

## 한눈에

```
_FunFan_v1.0/
├── index.html                   ← 페이지 인덱스(개발용 진입점)
├── workspace.html               ← 작업실 대시보드
├── workroom.html                ← 워크룸(타이머 + 태스크 + AI)
├── workspace-onboarding.html    ← 온보딩(랜딩 → 확장 → AI 대화)
├── account-setting.html         ← 설정 페이지 + AI 채팅
├── series-post-management.html  ← 시리즈 관리 + AI 채팅
├── styleguide.html              ← 모든 컴포넌트 쇼케이스(⭐ 살아있는 레퍼런스)
│
├── css/
│   ├── tokens/                  ← 디자인 토큰(색/간격/타이포)
│   │   ├── color.css
│   │   ├── layout.css
│   │   └── typography.css
│   ├── components/              ← BEM 기반 컴포넌트 CSS
│   │   ├── button.css           (26개 컴포넌트)
│   │   ├── chat-msg.css
│   │   ├── ...
│   └── styleguide.css           ← styleguide.html 전용 유틸
│
├── js/
│   ├── core/
│   │   └── keyboard-focus.js    ← using-mouse 패턴(모든 페이지 공용)
│   └── components/
│       ├── chat.js              ← AI 채팅 모듈(Chat.setup)
│       └── stat-card.js         ← 통계 카드 바차트 로직
│
├── img/                         ← 배경 이미지 등 리소스
├── icons/                       ← 파비콘 등
├── logo/                        ← 로고 리소스
│
├── handoff/                     ← 개발 핸드오프 문서(이 폴더)
│   ├── README.md
│   ├── design-tokens.json
│   ├── tailwind-preset.ts
│   ├── COMPONENTS.md
│   ├── ICONS.md
│   ├── ARCHITECTURE.md          ← 이 파일
│   ├── GETTING_STARTED.md
│   └── CONVENTIONS.md
│
├── CLAUDE.md                    ← 프로젝트 규칙(AI 작업 지침)
├── vercel.json                  ← Vercel 배포 설정
└── .claude/launch.json          ← 로컬 개발 서버 설정
```

---

## 왜 Vanilla HTML/CSS/JS인가?

### 의도
- **빠른 프로토타이핑**: 번들러·프레임워크 설치 없이 즉시 확인
- **단일 진실 소스**: CSS 파일 하나가 곧 디자인 스펙
- **개발팀과 분리**: 디자인이 먼저 확정된 후 Shadcn/Tailwind로 이식

### 제약
- 반응형·상태 관리·라우팅은 **개발 단계의 문제**
- 프로토는 1440px 고정 레이아웃만 다룸
- `Chat.setup()` 같은 모듈 패턴으로 **개념은 공유**하되 구현은 리포지토리에 강결합

---

## 로딩 순서 (각 HTML 페이지)

```html
<head>
  <!-- 1. Tokens — 반드시 먼저 -->
  <link rel="stylesheet" href="css/tokens/color.css">
  <link rel="stylesheet" href="css/tokens/layout.css">
  <link rel="stylesheet" href="css/tokens/typography.css">

  <!-- 2. 컴포넌트 (알파벳 순) — 토큰 이후 -->
  <link rel="stylesheet" href="css/components/button.css">
  <link rel="stylesheet" href="css/components/chat-msg.css">
  <!-- ... 필요한 것만 -->

  <!-- 3. 스크립트 (defer) -->
  <script src="js/core/keyboard-focus.js" defer></script>
  <script src="js/components/chat.js" defer></script>
  <!-- 페이지별 추가 스크립트 -->
</head>

<body>
  <!-- 컨텐츠 -->
  <script>
    // 페이지별 IIFE/인라인 로직
    document.addEventListener('DOMContentLoaded', () => {
      Chat.setup({ root: ..., getReply: ... });
    });
  </script>
</body>
```

**중요**:
- `Chat.setup()` 호출은 반드시 `DOMContentLoaded` 안에서 — chat.js가 `defer`로 나중에 로드되기 때문
- 인라인 `<script>`는 순서대로 실행되므로 **토큰 → 컴포넌트 → 스크립트** 순서 준수

---

## 데이터 흐름 (프로토 수준)

### 로컬 상태
- **없음** (프로토는 상태 관리 프레임워크 사용 안 함)
- 페이지 새로고침 시 초기화

### 영속 상태 (localStorage)
| Key | 용도 |
|---|---|
| `funfan-task-list` | 워크룸 태스크 목록 |
| `rightPanelOpen` | 우측 패널 열림/닫힘 상태 |

### 네트워크 요청
- **없음** — AI 답변은 `getReply(text)` 함수가 키워드 기반 매칭으로 하드코딩된 응답 반환
- 개발 시 실제 API로 교체 포인트: `Chat.setup({ getReply })` 파라미터

---

## 컴포넌트 상호작용 지도

```
[workspace.html]
  ├── navbar(좌 로고 / 우 액션)
  ├── left-panel(네비게이션)
  ├── 메인 영역
  │   ├── stat-card × 2
  │   ├── revenue-card(바 차트)
  │   └── review-item × N(최근 댓글)
  └── right-panel(AI 채팅)
       ├── panel-header
       ├── chat-msg × N / my-msg × N
       ├── msg-bubble(suggestion chips)
       └── chat-input + send-btn

[workroom.html]
  ├── navbar (normal | --work-mode)
  ├── left-panel
  ├── task-list-panel(오른쪽 슬라이드인)
  ├── workspace
  │   ├── radio-card(모드 선택) — normal
  │   └── timer-display(mini 모드)
  │       ├── timer-presets(5/10/30/60분)
  │       ├── input-wood(커스텀 시간)
  │       └── 타이머 버튼(상태 머신)
  └── right-panel(AI 채팅)
```

---

## 확장 포인트 (개발 쪽이 바꿀 곳)

| 항목 | 프로토 위치 | 개발 쪽 대응 |
|---|---|---|
| AI 응답 | `workspace.html`의 `RESPONSES[]` + `getReply()` | 실제 API 호출 |
| 태스크 저장 | `localStorage` | DB/백엔드 |
| 인증 | 없음 | Shadcn Auth 컴포넌트 + 백엔드 |
| 라우팅 | HTML 파일 분할 | React Router / Next.js App Router |
| 반응형 | 1440px 고정 | 추후 디자인에서 breakpoint 정의 |

---

## 저장소 = 살아있는 스펙

- 디자인 업데이트 시 이 저장소에 반영 (토큰·컴포넌트·인터랙션)
- **개발자는 의심될 때 `styleguide.html` + 해당 CSS 원본을 진실로**
- 핸드오프 문서는 스냅샷 — 시간이 지나면 저장소와 어긋날 수 있음
