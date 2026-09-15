import { readFileSync } from "node:fs";
console.log(`const projectRoot = ${JSON.stringify(process.cwd())};`);
console.log(
  `const existingSpace = ${Number(process.env.BILI_TASK_SPACE) || "null"};`,
);
console.log(
  `const checkFrom = ${JSON.stringify(process.env.BILI_CHECK_FROM || "")};`,
);
process.stdout.write(readFileSync("scripts/browser-review1.mjs", "utf8"));
