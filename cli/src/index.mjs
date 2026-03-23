/**
 * create-mendix-widget-gleam main orchestration
 */

import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { collect_options } from "../tui/build/dev/javascript/tui/tui.mjs";
import { collectOptions } from "./prompts.mjs";
import { generateNames } from "./naming.mjs";
import { getPmConfig } from "./pm.mjs";
import { scaffold } from "./scaffold.mjs";
import { t, getTemplateComments, getLangLabel } from "./i18n.mjs";
import { generateClaudeMdContent } from "./templates/claude_md.mjs";
import { generateReadmeContent } from "./templates/readme_md.mjs";
import { generateWidgetsReadmeContent } from "./templates/widgets_readme.mjs";
import { generateLicenseContent } from "./licenses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, "..", "template");

const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";

const VERSION = JSON.parse(
  await readFile(join(__dirname, "..", "package.json"), "utf-8"),
).version;

const HELP = `
${BOLD}create-mendix-widget-gleam${RESET} — Create Gleam + Mendix Pluggable Widget projects

${BOLD}Usage:${RESET}
  npx create-mendix-widget-gleam [project-name]

${BOLD}Options:${RESET}
  --help, -h       Show help
  --version, -v    Show version

${BOLD}Examples:${RESET}
  npx create-mendix-widget-gleam my-cool-widget
  npx create-mendix-widget-gleam MyCoolWidget
`;

const BANNER_LINES = [
  ["                   ████                                               ████   ████", ""],
  ["                   ████                                               ████  ██████", ""],
  ["                   ████                                               ████   ████", ""],
  ["                   ████                                               ████", "           █▓█"],
  ["   ████████ ████   ████      ████████     ████ ███████        ███████ ████   ████", "    ▓░▓█"],
  [" ███████████████   ████    ████████████   ██████████████    ██████████████   ████", "    ▓░░▓▓▓▓"],
  ["█████     ██████   ████   ████     █████  █████     ████   █████     █████   ████", "  ▓▓░░░░░░▓"],
  ["████       █████   ████  ████       ████  █████     ████   ████      █████   ████", " ▓░░░░░▒░▒█"],
  ["████        ████   ████  ███████████████  █████     ████   ████       ████   ████", " █▓░▒░▒░░▓"],
  ["█████      █████   ████  ████             █████     ████   ████      █████   ████", "  █▓░░▒░░▓"],
  [" ███████████████   ████   █████     ██    █████     ████   █████    ██████   ████", "   ▓░░░░░▓"],
  ["  █████████ ████   ████    ████████████   █████     ████    ██████████████   ████", "   ▓░▒▓█▓▓"],
  ["            ████   ████      ████████     █████     ████      ██████  ████   ████", "   █▓█"],
  ["   █       ████", ""],
  ["  █████████████", ""],
  ["   ██████████", ""],
];

const header = '\n' + BANNER_LINES.map(([g, l]) =>
  `${CYAN}${BOLD}${g}${RESET}${MAGENTA}${l}${RESET}`
).join('\n') + '\n';

export async function main(args) {
  // Ctrl+C 즉시 종료
  process.on("SIGINT", () => process.exit(130));

  // Flag handling
  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP);
    return;
  }
  if (args.includes("--version") || args.includes("-v")) {
    console.log(VERSION);
    return;
  }

  // Extract project name from CLI args (excluding flags)
  const positional = args.filter((a) => !a.startsWith("-"));
  const cliProjectName = positional[0] || "";

  // Collect options — etch TUI (TTY) with readline fallback (non-TTY/pipe)
  let projectName, pm, lang, organization, copyright, license, version, author, projectPath;
  let usedFallback = false;
  try {
    const options = await collect_options(cliProjectName);
    projectName = options.project_name;
    pm = options.pm;
    lang = options.lang;
    organization = options.organization;
    copyright = options.copyright;
    license = options.license;
    version = options.version;
    author = options.author;
    projectPath = options.project_path;
  } catch {
    // Fallback: readline prompts (non-TTY, CI, pipe, etc.)
    usedFallback = true;
    console.log(header);
    const result = await collectOptions(cliProjectName || null);
    projectName = result.projectName;
    pm = result.pm;
    lang = result.lang;
    organization = result.organization;
    copyright = result.copyright;
    license = result.license;
    version = result.version;
    author = result.author;
    projectPath = result.projectPath;
  }

  if (!usedFallback) console.log(header);

  // Name transformations
  const names = generateNames(projectName);
  if (!names) {
    console.error(`${YELLOW}${t(lang, "error.invalidName")}${RESET}`);
    process.exit(1);
  }

  const pmConfig = getPmConfig(pm);
  const targetDir = resolve(process.cwd(), names.kebabCase);

  // Summary
  console.log(`\n${BOLD}${t(lang, "summary.title")}${RESET}`);
  console.log(`  ${t(lang, "summary.directory")}       ${CYAN}${names.kebabCase}/${RESET}`);
  console.log(`  ${t(lang, "summary.widgetName")}      ${names.pascalCase}`);
  console.log(`  ${t(lang, "summary.gleamModule")}     ${names.snakeCase}`);
  console.log(`  ${t(lang, "summary.organization")}   ${organization}`);
  console.log(`  ${t(lang, "summary.version")}        ${version}`);
  console.log(`  ${t(lang, "summary.license")}        ${license}`);
  console.log(`  ${t(lang, "summary.author")}         ${author}`);
  console.log(`  ${t(lang, "summary.copyright")}      ${copyright}`);
  console.log(`  ${t(lang, "summary.projectPath")}    ${projectPath}`);
  console.log(`  ${t(lang, "summary.packageManager")}  ${pm}`);
  console.log(`  ${t(lang, "summary.language")}        ${getLangLabel(lang)}`);
  console.log();

  // Create directory
  await mkdir(targetDir, { recursive: true });

  // Build template comments (i18n for template placeholders)
  const templateComments = {
    ...getTemplateComments(lang),
    widgets_readme: generateWidgetsReadmeContent(lang),
  };

  // Scaffold options
  const scaffoldOptions = { organization, copyright, license, version, author, projectPath };

  // Scaffold templates
  console.log(`${DIM}${t(lang, "progress.generatingFiles")}${RESET}`);
  const created = await scaffold(TEMPLATE_DIR, targetDir, names, pmConfig, templateComments, scaffoldOptions);
  console.log(`${GREEN}✓${RESET} ${t(lang, "progress.filesCreated", { count: created.length })}`);

  // Generate LICENSE
  await writeFile(
    join(targetDir, "LICENSE"),
    generateLicenseContent(license, copyright),
    "utf-8",
  );
  console.log(`${GREEN}✓${RESET} ${t(lang, "progress.licenseCreated")}`);

  // Generate CLAUDE.md (always English, comment lang instruction varies)
  await writeFile(
    join(targetDir, "CLAUDE.md"),
    generateClaudeMdContent(lang, names, pm, pmConfig, organization),
    "utf-8",
  );
  console.log(`${GREEN}✓${RESET} ${t(lang, "progress.claudeMdCreated")}`);

  // Generate README.md
  await writeFile(
    join(targetDir, "README.md"),
    generateReadmeContent(lang, names, pm, pmConfig, license),
    "utf-8",
  );
  console.log(`${GREEN}✓${RESET} ${t(lang, "progress.readmeCreated")}`);

  // git init
  try {
    execSync("git init", { cwd: targetDir, stdio: "ignore" });
    console.log(`${GREEN}✓${RESET} ${t(lang, "progress.gitInit")}`);
  } catch {
    // git not available — continue
  }

  // Gleam → JS compilation (pipe로 Erlang 관련 Unused value warning 숨김)
  console.log(`\n${BOLD}${t(lang, "progress.gleamCompiling")}${RESET}`);
  try {
    execSync("gleam build --target javascript", {
      cwd: targetDir,
      stdio: "pipe",
    });
    console.log(`${GREEN}✓${RESET} ${t(lang, "progress.gleamCompiled")}`);
  } catch (e) {
    const output = (e.stderr || e.stdout || "").toString();
    if (output) console.error(output);
    console.error(
      `\n${YELLOW}${t(lang, "error.gleamCompileFail")}${RESET}`,
    );
    console.error(`  ${CYAN}gleam build --target javascript${RESET}\n`);
  }

  // Install dependencies
  console.log(`\n${BOLD}${t(lang, "progress.depsInstalling", { pm })}${RESET}\n`);
  try {
    execSync(pmConfig.install, {
      cwd: targetDir,
      stdio: "inherit",
    });
    console.log(`\n${GREEN}✓${RESET} ${t(lang, "progress.depsInstalled")}`);
  } catch {
    console.error(
      `\n${YELLOW}${t(lang, "error.depsInstallFail")}${RESET}`,
    );
    console.error(`  ${CYAN}${pmConfig.install}${RESET}\n`);
  }

  // Run glendix/install
  console.log(`\n${BOLD}${t(lang, "progress.glendixInstalling")}${RESET}\n`);
  try {
    execSync("gleam run -m glendix/install", {
      cwd: targetDir,
      stdio: "inherit",
    });
    console.log(`\n${GREEN}✓${RESET} ${t(lang, "progress.glendixInstalled")}`);
  } catch {
    console.error(
      `\n${YELLOW}${t(lang, "error.glendixInstallFail")}${RESET}`,
    );
    console.error(`  ${CYAN}gleam run -m glendix/install${RESET}\n`);
  }

  // Production build
  console.log(`\n${BOLD}${t(lang, "progress.buildingWidget")}${RESET}\n`);
  try {
    execSync("gleam run -m glendix/build", {
      cwd: targetDir,
      stdio: "inherit",
    });
    console.log(`\n${GREEN}✓${RESET} ${t(lang, "progress.widgetBuilt")}`);
  } catch {
    console.error(
      `\n${YELLOW}${t(lang, "error.buildFail")}${RESET}`,
    );
    console.error(`  ${CYAN}gleam run -m glendix/build${RESET}\n`);
  }

  // Done
  console.log(`
${GREEN}${BOLD}${t(lang, "done.title")}${RESET}

${BOLD}${t(lang, "done.nextSteps")}${RESET}

  ${CYAN}cd ${names.kebabCase}${RESET}
  ${CYAN}gleam run -m glendix/dev${RESET}             ${DIM}${t(lang, "done.devServer")}${RESET}
  ${CYAN}gleam run -m glendix/build${RESET}           ${DIM}${t(lang, "done.prodBuild")}${RESET}
  ${CYAN}gleam run -m mendraw/marketplace${RESET}     ${DIM}${t(lang, "done.marketplace")}${RESET}
`);

  // etch TUI 이벤트 서버의 stdin 리스너가 이벤트 루프를 유지하므로 명시적 종료
  process.exit(0);
}
