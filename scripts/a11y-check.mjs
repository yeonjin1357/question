#!/usr/bin/env node
// 최소 a11y 점검 스크립트. 개발 서버를 미리 띄운 뒤 실행:
//   $ npm run dev
//   $ npm run a11y
//
// 각 대상 URL 의 서버 렌더링 HTML 을 가져와 heuristic 으로 다음을 확인한다:
//   - <html lang> 속성 존재
//   - <title> 존재
//   - 정확히 1개의 <h1>
//   - 최소 1개의 <main> 랜드마크
//   - <img> 요소의 alt 속성
//   - <button>/<a> 에 접근 가능한 텍스트
//   - 중복된 id 없음
//
// 이 스크립트는 axe-core 같은 완전한 접근성 엔진을 대체하지 않는다.
// 심도 있는 감사는 브라우저의 axe DevTools 확장을 사용할 것.

const TARGETS = [
  { url: "/en", name: "home (en)" },
  { url: "/ko", name: "home (ko)" },
  { url: "/en/archive", name: "archive list" },
  { url: "/en/suggest", name: "suggest form" },
  { url: "/does-not-exist-xyz", name: "404", expectedStatus: 404 },
];

const BASE = process.env.A11Y_BASE_URL ?? "http://localhost:3000";

/** @typedef {{ name: string; pass: boolean; detail?: string }} Check */
/** @typedef {{ target: { url: string; name: string }; ok: boolean; status: number; checks: Check[] }} PageResult */

function pickAll(re, html) {
  const m = [];
  let exec;
  while ((exec = re.exec(html)) !== null) m.push(exec);
  return m;
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, "").trim();
}

/** @returns {Check[]} */
function analyse(html) {
  /** @type {Check[]} */
  const checks = [];

  // 1. <html lang>
  const htmlTag = html.match(/<html\b[^>]*>/i);
  const lang = htmlTag?.[0].match(/\blang=["']([^"']+)["']/i)?.[1];
  checks.push({
    name: "<html lang> attribute",
    pass: Boolean(lang),
    detail: lang ? `lang="${lang}"` : "missing",
  });

  // 2. <title>
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  checks.push({
    name: "<title>",
    pass: Boolean(title),
    detail: title ? `"${title.slice(0, 80)}"` : "missing",
  });

  // 3. <h1>
  const h1s = pickAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, html).map((m) => stripTags(m[1] ?? ""));
  checks.push({
    name: "exactly one non-empty <h1>",
    pass: h1s.length === 1 && h1s[0].length > 0,
    detail: h1s.length === 0 ? "none" : `found ${h1s.length}`,
  });

  // 4. <main>
  const mainCount = pickAll(/<main\b/gi, html).length;
  checks.push({
    name: "<main> landmark",
    pass: mainCount >= 1,
    detail: mainCount === 0 ? "missing" : `${mainCount} found`,
  });

  // 5. <img alt>
  const imgs = pickAll(/<img\b([^>]*)>/gi, html);
  const imgsMissingAlt = imgs.filter((m) => !/\balt=["'][^"']*["']/i.test(m[1] ?? ""));
  checks.push({
    name: "all <img> have alt",
    pass: imgsMissingAlt.length === 0,
    detail:
      imgsMissingAlt.length === 0
        ? `${imgs.length} images`
        : `${imgsMissingAlt.length}/${imgs.length} missing alt`,
  });

  // 6. 버튼/링크 접근 가능한 텍스트
  const emptyButtons = pickAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi, html).filter((m) => {
    const attrs = m[1] ?? "";
    const inner = stripTags(m[2] ?? "");
    const hasAria = /\baria-label(?:ledby)?=["'][^"']+["']/i.test(attrs);
    return !hasAria && inner.length === 0;
  });
  checks.push({
    name: "<button> has accessible name",
    pass: emptyButtons.length === 0,
    detail: emptyButtons.length === 0 ? "ok" : `${emptyButtons.length} empty`,
  });

  const emptyAnchors = pickAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, html).filter((m) => {
    const attrs = m[1] ?? "";
    const inner = stripTags(m[2] ?? "");
    const hasAria = /\baria-label(?:ledby)?=["'][^"']+["']/i.test(attrs);
    return !hasAria && inner.length === 0;
  });
  checks.push({
    name: "<a> has accessible name",
    pass: emptyAnchors.length === 0,
    detail: emptyAnchors.length === 0 ? "ok" : `${emptyAnchors.length} empty`,
  });

  // 7. 중복 id
  const ids = pickAll(/\sid=["']([^"']+)["']/gi, html).map((m) => m[1]);
  const seen = new Set();
  const dupes = new Set();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  checks.push({
    name: "no duplicate id attributes",
    pass: dupes.size === 0,
    detail: dupes.size === 0 ? `${ids.length} ids` : `dupes: ${[...dupes].join(", ")}`,
  });

  return checks;
}

async function run() {
  /** @type {PageResult[]} */
  const results = [];
  let overallFail = false;

  for (const target of TARGETS) {
    const expected = target.expectedStatus ?? 200;
    let res;
    try {
      res = await fetch(`${BASE}${target.url}`, { redirect: "manual" });
    } catch (err) {
      console.error(
        `[a11y] ✗ ${target.name} (${target.url}) — fetch failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      console.error(`[a11y]   start dev server first:  npm run dev`);
      overallFail = true;
      continue;
    }
    // 기대 상태가 아니면 본문을 검사해도 의미 없음
    if (res.status !== expected) {
      console.error(
        `[a11y] ✗ ${target.name} (${target.url}) — expected ${expected}, got ${res.status}`,
      );
      overallFail = true;
      continue;
    }
    const html = await res.text();
    const checks = analyse(html);
    const ok = checks.every((c) => c.pass);
    if (!ok) overallFail = true;
    results.push({ target, ok, status: res.status, checks });
  }

  console.log("");
  console.log("a11y heuristic audit");
  console.log("====================");
  for (const r of results) {
    console.log(
      `\n[${r.ok ? "✓" : "✗"}] ${r.target.name}  (${r.status}  ${r.target.url})`,
    );
    for (const c of r.checks) {
      const mark = c.pass ? "  ✓" : "  ✗";
      console.log(`${mark} ${c.name}${c.detail ? `  — ${c.detail}` : ""}`);
    }
  }
  console.log("");
  if (overallFail) {
    console.log("See failures above. For deeper checks use axe DevTools in browser.");
    process.exit(1);
  } else {
    console.log("All heuristic checks passed.");
    console.log("For WCAG coverage use axe DevTools in browser.");
  }
}

run();
