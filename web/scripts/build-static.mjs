// Static export build for shared hosting.
//
// Sets STATIC_EXPORT=1 and runs `next build`, which next.config.ts reads to
// switch on `output: "export"`. A small runner rather than inline env syntax,
// which differs between Windows and POSIX shells.
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

// Run Next's CLI entry through node directly rather than the .bin shim:
// the shim is a .cmd on Windows, which needs `shell: true`, and passing
// args through a shell is both a deprecation warning and a quoting hazard.
const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const res = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: { ...process.env, STATIC_EXPORT: "1" },
});

if (res.status !== 0) process.exit(res.status ?? 1);

const out = path.resolve("out");
if (!fs.existsSync(out)) {
  console.error("\nExpected an out/ folder and found none.");
  process.exit(1);
}

// Report what has to be uploaded, and confirm .htaccess survived the copy —
// Next copies public/ verbatim, but a dotfile is easy to lose to tooling.
let files = 0;
let bytes = 0;
const walk = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else {
      files++;
      bytes += fs.statSync(p).size;
    }
  }
};
walk(out);

const htaccess = fs.existsSync(path.join(out, ".htaccess"));
console.log(`\nStatic export ready: out/`);
console.log(`  ${files} files, ${(bytes / 1048576).toFixed(1)} MB`);
console.log(`  .htaccess present: ${htaccess ? "yes" : "NO — redirects and caching will not apply"}`);
console.log(`\nUpload the CONTENTS of out/ to your web root (public_html).`);
