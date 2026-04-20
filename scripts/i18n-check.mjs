#!/usr/bin/env node
// locale JSON 파일끼리 키 집합이 동일한지 확인. 누락 키가 있으면 비-제로 exit code.
// 실행: `node scripts/i18n-check.mjs` 또는 `npm run i18n:check`.

import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const DIR = resolve(process.cwd(), "src/i18n/messages");

function flatten(obj, prefix = "") {
  const keys = [];
  if (obj === null || typeof obj !== "object") return keys;
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flatten(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
if (files.length < 2) {
  console.log(`[i18n-check] only ${files.length} locale file found — nothing to compare`);
  process.exit(0);
}

const keysByFile = {};
for (const f of files) {
  const content = JSON.parse(readFileSync(resolve(DIR, f), "utf8"));
  keysByFile[f] = new Set(flatten(content));
}

const union = new Set();
for (const set of Object.values(keysByFile)) for (const k of set) union.add(k);

let hasError = false;
const summary = [];
for (const [file, keys] of Object.entries(keysByFile)) {
  const missing = [...union].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !union.has(k)); // 이론상 발생 불가
  summary.push({ file, totalKeys: keys.size, missing, extra });
  if (missing.length > 0 || extra.length > 0) hasError = true;
}

if (!hasError) {
  console.log(`[i18n-check] ✓ all ${files.length} locales have identical ${union.size} keys`);
  process.exit(0);
}

console.error(`[i18n-check] ✗ key mismatch across locale files:\n`);
for (const row of summary) {
  if (row.missing.length === 0 && row.extra.length === 0) continue;
  console.error(`  [${row.file}] (${row.totalKeys}/${union.size} keys)`);
  for (const k of row.missing) console.error(`    - missing: ${k}`);
  for (const k of row.extra) console.error(`    - extra:   ${k}`);
}
process.exit(1);
