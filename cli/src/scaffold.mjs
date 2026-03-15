/**
 * 파일 복사 + 템플릿 치환
 */

import { readdir, readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { join, relative } from "node:path";

/** 바이너리 판별용 확장자 */
const BINARY_EXTS = new Set([".png", ".jpg", ".gif", ".ico", ".woff", ".woff2", ".ttf", ".eot"]);

/** 재귀적으로 디렉토리 내 모든 파일 경로를 수집 */
async function walkDir(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkDir(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

// npm publish 시 제외되는 dotfile을 언더스코어 접두사로 보관하고 복원
const DOTFILE_MAP = { _gitignore: ".gitignore" };

/** 파일명에서 플레이스홀더 치환 + dotfile 복원 */
function replaceFileName(name, names) {
  if (DOTFILE_MAP[name]) return DOTFILE_MAP[name];
  return name
    .replace(/__WidgetName__/g, names.pascalCase)
    .replace(/__widget_name__/g, names.snakeCase);
}

/** 파일 내용에서 플레이스홀더 치환 */
function replaceContent(content, names, pmConfig, templateComments) {
  let result = content
    .replace(/\{\{PASCAL_CASE\}\}/g, names.pascalCase)
    .replace(/\{\{SNAKE_CASE\}\}/g, names.snakeCase)
    .replace(/\{\{LOWERCASE\}\}/g, names.lowerCase)
    .replace(/\{\{DISPLAY_NAME\}\}/g, names.displayName)
    .replace(/\{\{KEBAB_CASE\}\}/g, names.kebabCase);

  if (templateComments) {
    result = result.replace(/\{\{I18N:(\w+)\}\}/g, (_, key) => {
      return templateComments[key] ?? `{{I18N:${key}}}`;
    });
  }

  return result;
}

/**
 * 템플릿을 대상 디렉토리에 스케폴딩
 * @param {string} templateDir - 템플릿 디렉토리 경로
 * @param {string} targetDir - 생성할 프로젝트 디렉토리 경로
 * @param {object} names - 이름 변환 결과
 * @param {object} pmConfig - 패키지 매니저 설정
 * @param {object} [templateComments] - i18n 템플릿 주석 ({{I18N:*}} 치환용)
 */
export async function scaffold(templateDir, targetDir, names, pmConfig, templateComments) {
  const files = await walkDir(templateDir);
  const created = [];

  for (const srcPath of files) {
    // 템플릿 기준 상대 경로
    const relPath = relative(templateDir, srcPath);

    // 경로의 각 부분에서 파일명 치환
    const destRelPath = relPath
      .split(/[\\/]/)
      .map((part) => replaceFileName(part, names))
      .join("/");

    const destPath = join(targetDir, destRelPath);
    const ext = srcPath.substring(srcPath.lastIndexOf(".")).toLowerCase();

    // 디렉토리 생성
    await mkdir(join(destPath, ".."), { recursive: true });

    if (BINARY_EXTS.has(ext)) {
      // 바이너리 파일은 그대로 복사
      await copyFile(srcPath, destPath);
    } else {
      // 텍스트 파일은 내용 치환
      const content = await readFile(srcPath, "utf-8");
      const replaced = replaceContent(content, names, pmConfig, templateComments);
      await writeFile(destPath, replaced, "utf-8");
    }

    created.push(destRelPath);
  }

  return created;
}
