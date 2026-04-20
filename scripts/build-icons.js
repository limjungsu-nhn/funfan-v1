#!/usr/bin/env node
/**
 * build-icons.js
 * --------------------------------------------------------------
 * icons/*.svg  →  css/components/icon.css 의 .icon-* 클래스 자동 생성/갱신
 *
 * 사용법:
 *   node scripts/build-icons.js              # icon.css 업데이트
 *   node scripts/build-icons.js --check      # 변경 없이 diff만 출력
 *
 * 동작:
 *   1) icons/ 폴더의 모든 *.svg 를 스캔
 *   2) 파일명 → 클래스명 변환 (account_circle.svg → .icon-account-circle)
 *   3) SVG 내용을 URL-encoded data URI 로 변환 (fill을 'black'으로 정규화 — mask-image 용)
 *   4) icon.css 의 Icons 섹션 구분자 (/* ---------- Icons ---------- *\/) 아래에서:
 *        - 같은 이름 단일 클래스 규칙이 있으면  → 해당 줄만 교체
 *        - 없으면                              → 알파벳 순 위치에 삽입
 *        - SVG 파일이 없는 기존 클래스/alias 규칙 → 건드리지 않음 (예: icon-cancel, alias 규칙)
 *   5) 요약 출력 (updated / added / orphan)
 *
 * 수동 작업 안내 (스크립트가 안 건드리는 것):
 *   - handoff/ICONS.md 의 매핑 행 (lucide 매핑, 한국어 설명은 사람이 작성)
 *   - handoff/ICONS.md / handoff/README.md 의 카운트 숫자
 *   - styleguide.html 아이콘 갤러리 카드
 *   → 스크립트가 종료 시 어떤 항목에 대해 수동 작업이 필요한지 알려줌
 * --------------------------------------------------------------
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'icons');
const ICON_CSS = path.join(ROOT, 'css/components/icon.css');
const ICONS_MD = path.join(ROOT, 'handoff/ICONS.md');

const CHECK_MODE = process.argv.includes('--check');

/* ------------------------------------------------------------------ */
/*  SVG → data URI                                                     */
/* ------------------------------------------------------------------ */

/**
 * Raw SVG 문자열을 CSS data URI 로 변환.
 * mask-image 용도이므로 색상은 'black' 으로 정규화
 * (실제 렌더 색상은 .icon 의 background-color: currentColor 로 제어).
 */
function svgToDataUri(svg) {
  let s = svg.trim();

  // 1) 한 줄로 (개행/연속 공백 정리)
  s = s.replace(/\s+/g, ' ');

  // 2) 속성 구분자를 single quote 로 통일 (outer url("...") 와 충돌 방지)
  s = s.replace(/"/g, "'");

  // 3) fill 색상 정규화: #xxx, rgb(), color() 등 → 'black'
  s = s.replace(/fill='(?!none)[^']*'/g, "fill='black'");

  // 4) style 의 fill 값도 정규화
  s = s.replace(/style='[^']*'/g, "style='fill:black;fill-opacity:1;'");

  // 5) URL-encode: CSS url() 내에서 안전하지 않은 문자들
  s = s
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/#/g, '%23');

  return `url("data:image/svg+xml,${s}")`;
}

function generateCssLine(className, uri) {
  return `.${className} { mask-image: ${uri}; -webkit-mask-image: ${uri}; }`;
}

/* ------------------------------------------------------------------ */
/*  Scan icons/                                                        */
/* ------------------------------------------------------------------ */

function scanIcons() {
  const files = fs
    .readdirSync(ICONS_DIR)
    .filter((f) => f.toLowerCase().endsWith('.svg'))
    .sort();

  const map = new Map(); // className → { line, source }
  for (const file of files) {
    const base = file.replace(/\.svg$/i, '');
    const className = 'icon-' + base.replace(/_/g, '-');
    const svg = fs.readFileSync(path.join(ICONS_DIR, file), 'utf8');
    const uri = svgToDataUri(svg);
    map.set(className, {
      line: generateCssLine(className, uri),
      source: file,
    });
  }
  return map;
}

/* ------------------------------------------------------------------ */
/*  Parse & patch icon.css                                             */
/* ------------------------------------------------------------------ */

function patchIconCss(iconMap) {
  const css = fs.readFileSync(ICON_CSS, 'utf8');
  const lines = css.split('\n');

  const HEADER = '/* ---------- Icons ---------- */';
  const headerIdx = lines.findIndex((l) => l.includes(HEADER));
  if (headerIdx === -1) {
    throw new Error(`icon.css 에서 "${HEADER}" 섹션 구분자를 찾지 못함.`);
  }

  const updated = new Set();
  const existing = new Set(); // 이미 CSS 에 선언된 모든 .icon-* 클래스 (alias 포함)
  const out = lines.slice(0, headerIdx + 1);
  const stats = { updated: 0, kept: 0 };
  const orphans = []; // CSS 에는 있는데 SVG 파일이 없는 클래스

  // alias 규칙은 여러 줄에 걸칠 수 있으므로 셀렉터를 누적해서 추적
  let pendingSelector = '';

  // Icons 섹션 순회
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i];

    // 현재 줄 셀렉터 누적 — '{' 가 등장하면 규칙 시작, 리셋
    const braceIdx = line.indexOf('{');
    const selectorChunk = braceIdx >= 0 ? line.slice(0, braceIdx) : line;
    pendingSelector += ' ' + selectorChunk;

    // 셀렉터 안의 모든 .icon-* 클래스를 existing 에 기록 (alias 포함)
    for (const match of pendingSelector.matchAll(/\.icon-([a-z0-9-]+)/g)) {
      existing.add('icon-' + match[1]);
    }

    // 규칙이 끝나면(혹은 '{'가 있으면) 셀렉터 리셋
    if (braceIdx >= 0) pendingSelector = '';

    // `.icon-NAME {` (단일 클래스 규칙) 만 자동 갱신 대상
    // data URI 안의 콤마와 혼동되지 않도록 '{' 앞쪽만 검사
    const m = line.match(/^\.icon-([a-z0-9-]+)\s*\{/);
    const selectorPart = line.split('{')[0];
    if (m && !selectorPart.includes(',')) {
      const cls = 'icon-' + m[1];
      if (iconMap.has(cls)) {
        out.push(iconMap.get(cls).line);
        updated.add(cls);
        stats.updated++;
        continue;
      }
      // SVG 파일이 없는 단일 클래스 → 그대로 유지하되 orphan 으로 리포트
      orphans.push(cls);
      out.push(line);
      stats.kept++;
      continue;
    }

    // alias 규칙, 빈 줄, 주석 등 → 그대로
    out.push(line);
  }

  // 신규 아이콘 추가 (알파벳 순으로 out 에 끼워 넣기)
  // updated 뿐 아니라 existing(alias 포함)에 이미 있는 클래스는 건너뜀
  const added = [];
  for (const [cls, info] of iconMap.entries()) {
    if (updated.has(cls) || existing.has(cls)) continue;
    added.push(cls);

    // out 에서 .icon-* 단일 클래스 규칙 중 정렬상 바로 뒤에 올 줄을 찾아 그 앞에 삽입
    let insertIdx = out.length;
    for (let i = headerIdx + 1; i < out.length; i++) {
      const l = out[i];
      const mm = l.match(/^\.icon-([a-z0-9-]+)\s*[\{,]/);
      if (mm && !l.startsWith('.icon--')) {
        const existing = 'icon-' + mm[1];
        if (existing > cls) {
          insertIdx = i;
          break;
        }
      }
    }
    out.splice(insertIdx, 0, info.line);
  }

  return {
    content: out.join('\n'),
    stats: { ...stats, added: added.length },
    added,
    orphans,
  };
}

/* ------------------------------------------------------------------ */
/*  ICONS.md 에 이미 등록되어 있는지 확인                                */
/* ------------------------------------------------------------------ */

function checkIconsMd(addedClasses) {
  if (!fs.existsSync(ICONS_MD)) return { missing: [] };
  const md = fs.readFileSync(ICONS_MD, 'utf8');
  const missing = addedClasses.filter((cls) => !md.includes(`\`${cls}\``));
  return { missing };
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

function main() {
  console.log('▸ icons/ 폴더 스캔...');
  const iconMap = scanIcons();
  console.log(`  ${iconMap.size} 개 SVG 파일 발견`);

  console.log('▸ icon.css 패치 생성...');
  const result = patchIconCss(iconMap);
  const before = fs.readFileSync(ICON_CSS, 'utf8');
  const changed = before !== result.content;

  if (!changed) {
    console.log('\n✔ 변경 없음. icon.css 는 이미 최신 상태입니다.');
    return;
  }

  if (CHECK_MODE) {
    console.log('\n[--check 모드] 다음 변경이 적용 대기 중:');
    console.log(`  업데이트: ${result.stats.updated}`);
    console.log(`  신규 추가: ${result.stats.added}`);
    if (result.added.length) {
      console.log('  추가될 클래스:');
      result.added.forEach((c) => console.log(`    + .${c}`));
    }
    console.log('\n실제 적용하려면: node scripts/build-icons.js');
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(ICON_CSS, result.content);
  console.log(`\n✔ icon.css 업데이트 완료 (${ICON_CSS.replace(ROOT + '/', '')})`);
  console.log(`  업데이트된 클래스: ${result.stats.updated}`);
  console.log(`  신규 추가된 클래스: ${result.stats.added}`);
  console.log(`  건드리지 않은 클래스: ${result.stats.kept} (alias 또는 SVG 파일 없음)`);

  if (result.added.length) {
    console.log('\n  신규 추가:');
    result.added.forEach((c) => console.log(`    + .${c}`));
  }

  if (result.orphans.length) {
    console.log('\n  ⚠ SVG 파일이 없는 기존 클래스 (변경 없이 유지):');
    result.orphans.forEach((c) => console.log(`    · .${c}`));
    console.log('  → icons/ 에 해당 SVG 를 추가하면 다음 실행 때 갱신됩니다.');
  }

  // ICONS.md 수동 작업 안내
  const mdCheck = checkIconsMd(result.added);
  if (mdCheck.missing.length) {
    console.log('\n  📝 수동 작업 필요 — handoff/ICONS.md 에 다음 항목 추가:');
    mdCheck.missing.forEach((c) => console.log(`    · \`${c}\` (lucide 매핑 + 한국어 설명)`));
    console.log('  그리고 handoff/README.md 의 아이콘 카운트도 갱신하세요.');
  }
}

try {
  main();
} catch (err) {
  console.error('\n✖ 빌드 실패:', err.message);
  process.exitCode = 2;
}
