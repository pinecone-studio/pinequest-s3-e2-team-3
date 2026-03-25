/**
 * Manual Cloudflare Pages upload from your machine:
 * - Current branch `main` (or CF_PAGES_BRANCH_PRODUCTION) → production (no `--branch`)
 * - Any other branch → preview (`--branch <name>`)
 */

import { execSync, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const productionBranch = process.env.CF_PAGES_BRANCH_PRODUCTION ?? "main";

function getBranch() {
  try {
    const b = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
      cwd: root,
    }).trim();
    if (b && b !== "HEAD") return b;
    const sha = execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      cwd: root,
    }).trim();
    if (sha) return `detached-${sha}`;
  } catch {
    // ignore
  }
  return "";
}

const branch = getBranch();
if (!branch) {
  console.error(
    "deploy-pages: Not in a git repo or branch could not be read. Run from the project clone.",
  );
  process.exit(1);
}

const isProduction = branch === productionBranch;
const args = ["pages", "deploy", ".vercel/output/static"];
if (!isProduction) args.push("--branch", branch);

try {
  const hash = execSync("git rev-parse HEAD", {
    encoding: "utf8",
    cwd: root,
  }).trim();
  if (hash) args.push("--commit-hash", hash);
} catch {
  // optional
}

console.log(
  isProduction
    ? `deploy-pages: production (branch ${branch})`
    : `deploy-pages: preview (branch ${branch})`,
);

const result = spawnSync("wrangler", args, { stdio: "inherit", cwd: root });
process.exit(result.status ?? 1);
