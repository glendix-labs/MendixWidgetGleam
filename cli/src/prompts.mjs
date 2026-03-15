/**
 * Interactive prompts (node:readline based)
 */

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { splitWords } from "./naming.mjs";
import { PM_CHOICES, detectPm } from "./pm.mjs";
import { LANG_CHOICES, getLangLabel, t } from "./i18n.mjs";

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";

/** Project name validation */
function validateName(lang, name) {
  if (!name || name.trim().length === 0) {
    return t(lang, "validate.nameRequired");
  }
  const words = splitWords(name.trim());
  if (words.length === 0) {
    return t(lang, "validate.needAlpha");
  }
  if (!/^[a-zA-Z][a-zA-Z0-9\-_]*$/.test(name.trim())) {
    return t(lang, "validate.invalidChars");
  }
  return null;
}

/** Collect options via interactive prompts */
export async function collectOptions(cliProjectName) {
  const rl = createInterface({ input: stdin, output: stdout });
  let done = false;

  rl.on("close", () => {
    if (!done) {
      console.log("\nCancelled.");
      process.exit(0);
    }
  });

  let projectName = cliProjectName;

  try {
    // 1. Language selection (multilingual labels — shown before language is chosen)
    console.log(
      `\n${BOLD}Language / 언어 / 言語:${RESET}`,
    );
    LANG_CHOICES.forEach((code, i) => {
      const label = getLangLabel(code);
      console.log(`  ${i + 1}) ${label}`);
    });

    let langAnswer = "";
    try {
      langAnswer = await rl.question(
        `${DIM}(1-${LANG_CHOICES.length}, default: 1)${RESET}: `,
      );
    } catch {
      // stdin closed — use default
    }

    let lang = "en";
    const langIndex = parseInt(langAnswer, 10);
    if (langIndex >= 1 && langIndex <= LANG_CHOICES.length) {
      lang = LANG_CHOICES[langIndex - 1];
    }

    // 2. Project name
    if (!projectName) {
      projectName = await rl.question(
        `${BOLD}${t(lang, "prompt.projectName")}${RESET} `,
      );
    }

    const nameError = validateName(lang, projectName);
    if (nameError) {
      done = true;
      rl.close();
      console.error(`\n${YELLOW}${nameError}${RESET}`);
      process.exit(1);
    }

    projectName = projectName.trim();

    // Check directory conflict
    const targetDir = resolve(process.cwd(), projectName);
    if (existsSync(targetDir)) {
      done = true;
      rl.close();
      console.error(
        `\n${YELLOW}${t(lang, "error.dirExists", { name: projectName })}${RESET}`,
      );
      process.exit(1);
    }

    // 3. Package manager selection
    const detected = detectPm();
    console.log(
      `\n${BOLD}${t(lang, "prompt.pmSelect")}${RESET} ${DIM}(${t(lang, "prompt.pmDetected", { detected })})${RESET}`,
    );
    PM_CHOICES.forEach((pm, i) => {
      const marker =
        pm === detected
          ? ` ${CYAN}${t(lang, "prompt.pmDetectedMarker")}${RESET}`
          : "";
      console.log(`  ${i + 1}) ${pm}${marker}`);
    });

    let pmAnswer = "";
    try {
      pmAnswer = await rl.question(
        `${t(lang, "prompt.pmChoose", { count: PM_CHOICES.length, default: detected })}: `,
      );
    } catch {
      // stdin closed — use default
    }

    let pm = detected;
    const pmIndex = parseInt(pmAnswer, 10);
    if (pmIndex >= 1 && pmIndex <= PM_CHOICES.length) {
      pm = PM_CHOICES[pmIndex - 1];
    } else if (pmAnswer.trim() && PM_CHOICES.includes(pmAnswer.trim())) {
      pm = pmAnswer.trim();
    }

    done = true;
    rl.close();
    return { projectName, pm, lang };
  } catch (err) {
    done = true;
    rl.close();
    if (err.code === "ERR_USE_AFTER_CLOSE") {
      process.exit(0);
    }
    throw err;
  }
}
