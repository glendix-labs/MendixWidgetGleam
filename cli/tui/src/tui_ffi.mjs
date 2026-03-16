import { existsSync } from "node:fs";
import { resolve } from "node:path";

export function dir_exists(name) {
  return existsSync(resolve(process.cwd(), name));
}

export function detect_pm() {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.startsWith("pnpm/")) return "pnpm";
  if (ua.startsWith("yarn/")) return "yarn";
  if (ua.startsWith("bun/")) return "bun";
  return "npm";
}

export function process_exit(code) {
  process.exit(code);
}

export function is_valid_name(name) {
  return /^[a-zA-Z][a-zA-Z0-9\-_]*$/.test(name);
}

export function split_words(input) {
  let result = input.replace(/([a-z])([A-Z])/g, "$1 $2");
  result = result.replace(/([0-9])([a-zA-Z])/g, "$1 $2");
  result = result.replace(/([a-zA-Z])([0-9])/g, "$1 $2");
  return result
    .split(/[-_\s]+/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 0);
}
