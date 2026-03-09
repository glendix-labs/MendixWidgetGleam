/**
 * create-mendix-widget-gleam 메인 오케스트레이션
 */

import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
import { execSync } from "node:child_process";
import { collectOptions } from "./prompts.mjs";
import { generateNames } from "./naming.mjs";
import { getPmConfig } from "./pm.mjs";
import { scaffold } from "./scaffold.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, "..", "template");

const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const YELLOW = "\x1b[33m";

const VERSION = "1.0.0";

const HELP = `
${BOLD}create-mendix-widget-gleam${RESET} — Gleam + Mendix Pluggable Widget 프로젝트 생성

${BOLD}사용법:${RESET}
  npx create-mendix-widget-gleam [project-name]

${BOLD}옵션:${RESET}
  --help, -h       도움말 표시
  --version, -v    버전 표시

${BOLD}예시:${RESET}
  npx create-mendix-widget-gleam my-cool-widget
  npx create-mendix-widget-gleam MyCoolWidget
`;

export async function main(args) {
  // 플래그 처리
  if (args.includes("--help") || args.includes("-h")) {
    console.log(HELP);
    return;
  }
  if (args.includes("--version") || args.includes("-v")) {
    console.log(VERSION);
    return;
  }

  console.log(
    `\n${BOLD}${CYAN}create-mendix-widget-gleam${RESET} ${DIM}v${VERSION}${RESET}\n`,
  );

  // CLI 인자에서 프로젝트명 추출 (플래그 제외)
  const positional = args.filter((a) => !a.startsWith("-"));
  const cliProjectName = positional[0] || null;

  // 프롬프트로 설정 수집
  const { projectName, pm } = await collectOptions(cliProjectName);

  // 이름 변환
  const names = generateNames(projectName);
  if (!names) {
    console.error(`${YELLOW}오류: 유효하지 않은 프로젝트 이름입니다.${RESET}`);
    process.exit(1);
  }

  const pmConfig = getPmConfig(pm);
  const targetDir = resolve(process.cwd(), names.kebabCase);

  // 요약 표시
  console.log(`\n${BOLD}프로젝트 설정:${RESET}`);
  console.log(`  디렉토리:       ${CYAN}${names.kebabCase}/${RESET}`);
  console.log(`  위젯 이름:      ${names.pascalCase}`);
  console.log(`  Gleam 모듈:     ${names.snakeCase}`);
  console.log(`  패키지 매니저:  ${pm}`);
  console.log();

  // 디렉토리 생성
  await mkdir(targetDir, { recursive: true });

  // 템플릿 스케폴딩
  console.log(`${DIM}파일 생성 중...${RESET}`);
  const created = await scaffold(TEMPLATE_DIR, targetDir, names, pmConfig);
  console.log(`${GREEN}✓${RESET} ${created.length}개 파일 생성 완료`);

  // CLAUDE.md 생성
  await generateClaudeMd(targetDir, names, pm, pmConfig);
  console.log(`${GREEN}✓${RESET} CLAUDE.md 생성 완료`);

  // README.md 생성
  await generateReadme(targetDir, names, pm, pmConfig);
  console.log(`${GREEN}✓${RESET} README.md 생성 완료`);

  // git init
  try {
    execSync("git init", { cwd: targetDir, stdio: "ignore" });
    console.log(`${GREEN}✓${RESET} git 저장소 초기화 완료`);
  } catch {
    // git이 없어도 계속 진행
  }

  // 완료 메시지
  console.log(`
${GREEN}${BOLD}프로젝트가 생성되었습니다!${RESET}

${BOLD}다음 단계:${RESET}

  ${CYAN}cd ${names.kebabCase}${RESET}
  ${CYAN}gleam run -m scripts/install${RESET}   ${DIM}# 의존성 설치${RESET}
  ${CYAN}gleam run -m scripts/dev${RESET}       ${DIM}# 개발 서버 시작${RESET}
  ${CYAN}gleam run -m scripts/build${RESET}     ${DIM}# 프로덕션 빌드${RESET}
`);
}

/** CLAUDE.md 생성 */
async function generateClaudeMd(targetDir, names, pm, pmConfig) {
  const { writeFile } = await import("node:fs/promises");

  const content = `# ${names.pascalCase}

Gleam 언어로 Mendix Pluggable Widget을 개발하여 "Hello World"를 화면에 렌더링하는 프로젝트.

## Goal

**JSX를 사용하지 않고, 오직 Gleam으로만** 위젯을 작성한다. Gleam 코드를 JavaScript로 컴파일하고, 컴파일된 JS가 곧 Mendix Pluggable Widget의 진입점이 된다.

## Tech Stack

- **Gleam** → JavaScript 컴파일 (target: javascript)
- **Gleam FFI** (\`@external\` 어노테이션 + FFI 파일) — React API와 Mendix API를 Gleam에서 직접 호출
- **Mendix Pluggable Widget** (React 19)
- **Package Manager**: ${pm} (npm 의존성은 \`gleam run -m scripts/install\`로 설치)
- **Build**: \`@mendix/pluggable-widgets-tools\` (Rollup 기반)

## Architecture

\`\`\`
src/
  widget/                             # 핵심 Gleam 코드 (개발자가 작업하는 곳)
    ${names.snakeCase}.gleam           #   위젯 메인 모듈
    react_ffi.mjs                     #   React FFI 어댑터 (React 원시 함수)
    mendix_ffi.mjs                    #   Mendix FFI 어댑터 (Mendix 런타임 타입 접근)
    react.gleam                       #   핵심 타입 + createElement + fragment/text/none
    react/                            #   React 모듈 (prop, hook, event, html)
    mendix.gleam                      #   Mendix 핵심 타입 + Props 접근자
    mendix/                           #   Mendix API 모듈 (editable_value, action, list_value 등)
    editor_config.gleam               #   Studio Pro 속성 패널 설정
  scripts/                            # 빌드/개발 스크립트 (gleam run -m으로 실행)
    cmd.gleam                         #   셸 명령어 실행 유틸리티
    cmd_ffi.mjs                       #   Node.js child_process FFI
    install.gleam                     #   npm 의존성 설치
    build.gleam                       #   프로덕션 빌드
    dev.gleam                         #   개발 서버
    start.gleam                       #   Mendix 테스트 프로젝트 연동
    release.gleam                     #   릴리즈 빌드
    lint.gleam                        #   ESLint 실행
    lint_fix.gleam                    #   ESLint 자동 수정
  ${names.pascalCase}.js                # 브릿지 진입점
  ${names.pascalCase}.editorConfig.js   # 브릿지 (editorConfig)
  ${names.pascalCase}.xml               # 위젯 속성 정의
  package.xml                         # Mendix 패키지 매니페스트
  ui/
    ${names.pascalCase}.css             # 위젯 스타일시트
gleam.toml                            # Gleam 프로젝트 설정
docs/
  gleam_language_tour.md              # Gleam 언어 레퍼런스
\`\`\`

## Build Pipeline

\`\`\`
[src/widget/*.gleam] + [src/widget/react_ffi.mjs] + [src/widget/mendix_ffi.mjs]
    ↓  gleam run -m scripts/build
[build/dev/javascript/${names.snakeCase}/widget/*.mjs]
    ↓  src/${names.pascalCase}.js (브릿지)가 import
    ↓  Rollup (pluggable-widgets-tools build:web)
[dist/1.0.0/mendix.${names.lowerCase}.${names.pascalCase}.mpk]
\`\`\`

## Commands

\`\`\`bash
gleam run -m scripts/install   # 의존성 설치
gleam run -m scripts/build     # 위젯 프로덕션 빌드 (.mpk 생성)
gleam run -m scripts/dev       # 개발 서버 (HMR, port 3000)
gleam run -m scripts/start     # Mendix 테스트 프로젝트와 연동 개발
gleam run -m scripts/lint      # ESLint 실행
gleam run -m scripts/lint_fix  # ESLint 자동 수정
gleam run -m scripts/release   # 릴리즈 빌드
gleam build --target javascript  # Gleam → JS 컴파일만
gleam test                       # Gleam 테스트 실행
gleam format                     # Gleam 코드 포맷팅
\`\`\`

## Gleam FFI Convention

- FFI는 도메인별로 분리: \`react_ffi.mjs\` (React 원시 함수), \`mendix_ffi.mjs\` (Mendix 런타임 타입 접근)
- \`react.gleam\`/\`mendix.gleam\`에서 \`@external(javascript, "./<ffi>.mjs", "<function>")\` 형식으로 바인딩
- \`react/*.gleam\`에서 \`@external(javascript, "../react_ffi.mjs", "<function>")\` 형식으로 바인딩
- \`mendix/*.gleam\`에서 \`@external(javascript, "../mendix_ffi.mjs", "<function>")\` 형식으로 바인딩
- FFI 파일에는 API 래핑만 작성. 위젯 로직은 반드시 Gleam으로 작성
- \`mendix_ffi.mjs\`에서 JS \`undefined\`/\`null\` ↔ Gleam \`Option\` 변환 자동 처리

## Mendix API Modules

- \`mendix.gleam\` — \`ValueStatus\`, \`ObjectItem\`, Props 접근자 (\`get_prop\`, \`get_string_prop\`)
- \`mendix/editable_value.gleam\` — \`EditableValue\` (편집 가능한 값)
- \`mendix/action.gleam\` — \`ActionValue\` (마이크로플로우/나노플로우 실행)
- \`mendix/dynamic_value.gleam\` — \`DynamicValue\` (동적 읽기 전용 값)
- \`mendix/list_value.gleam\` — \`ListValue\`, \`FilterCondition\`, \`SortInstruction\`
- \`mendix/list_attribute.gleam\` — \`ListAttributeValue\` 등 리스트 연결 타입
- \`mendix/selection.gleam\` — 단일/다중 선택
- \`mendix/reference.gleam\` — 참조 관계 값
- \`mendix/date.gleam\` — \`JsDate\` (JS Date opaque 래퍼)
- \`mendix/big.gleam\` — \`Big\` (Big.js 고정밀 십진수 래퍼)
- \`mendix/file.gleam\` — 파일/이미지
- \`mendix/icon.gleam\` — 아이콘
- \`mendix/formatter.gleam\` — 값 포맷팅/파싱
- \`mendix/filter.gleam\` — 필터 조건 빌더

## Mendix Widget Conventions

- 위젯 ID: \`mendix.${names.lowerCase}.${names.pascalCase}\`
- JSX 파일을 작성하지 않는다. 모든 React 로직은 Gleam + FFI로 구현
- Redraw 등 외부 Gleam React 라이브러리는 사용하지 않는다

## Code Style

- Gleam 파일: \`gleam format\` 사용
- FFI 파일(\`react_ffi.mjs\`, \`mendix_ffi.mjs\`): API 노출만 담당, 비즈니스 로직 금지
- 한국어 주석 사용
`;

  await writeFile(join(targetDir, "CLAUDE.md"), content, "utf-8");
}

/** README.md 생성 */
async function generateReadme(targetDir, names, pm, pmConfig) {
  const { writeFile } = await import("node:fs/promises");

  const runCmd = pm === "npm" ? "npm run" : pm;

  const content = `# ${names.pascalCase}

Gleam 언어로 작성된 Mendix Pluggable Widget.

## 시작하기

### 사전 요구사항

- [Gleam](https://gleam.run/getting-started/installing/) (최신 버전)
- [Node.js](https://nodejs.org/) (v18+)
- ${pm}

### 설치

\`\`\`bash
gleam run -m scripts/install
\`\`\`

### 개발

\`\`\`bash
gleam run -m scripts/dev
\`\`\`

### 빌드

\`\`\`bash
gleam run -m scripts/build
\`\`\`

빌드 결과물(\`.mpk\`)은 \`dist/\` 디렉토리에 생성됩니다.

### 기타 명령어

\`\`\`bash
gleam run -m scripts/start      # Mendix 테스트 프로젝트 연동
gleam run -m scripts/lint       # ESLint 실행
gleam run -m scripts/lint_fix   # ESLint 자동 수정
gleam run -m scripts/release    # 릴리즈 빌드
gleam build --target javascript # Gleam → JS 컴파일만
gleam test                      # 테스트 실행
gleam format                    # 코드 포맷팅
\`\`\`

## 프로젝트 구조

\`\`\`
src/
  widget/                          # Gleam 위젯 코드
    ${names.snakeCase}.gleam        #   메인 위젯 모듈
    react_ffi.mjs                  #   React FFI 어댑터
    mendix_ffi.mjs                 #   Mendix FFI 어댑터
    react.gleam + react/           #   React 모듈 계층
    mendix.gleam + mendix/         #   Mendix API 모듈 계층
    editor_config.gleam            #   Studio Pro 속성 패널
  scripts/                         # 빌드/개발 스크립트
  ${names.pascalCase}.js             # Mendix 브릿지 진입점
  ${names.pascalCase}.xml            # 위젯 속성 정의
\`\`\`

## 기술 스택

- **Gleam** → JavaScript 컴파일
- **Gleam FFI** — React/Mendix API 직접 바인딩
- **Mendix Pluggable Widget** (React 19)
- **${pm}** — 패키지 매니저

## 라이센스

Apache-2.0
`;

  await writeFile(join(targetDir, "README.md"), content, "utf-8");
}
