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

  // Gleam → JS 컴파일
  console.log(`\n${BOLD}Gleam 컴파일 중...${RESET}\n`);
  try {
    execSync("gleam build --target javascript", {
      cwd: targetDir,
      stdio: "inherit",
    });
    console.log(`\n${GREEN}✓${RESET} Gleam 컴파일 완료`);
  } catch {
    console.error(
      `\n${YELLOW}⚠ Gleam 컴파일 실패. 프로젝트 디렉토리에서 직접 실행하세요:${RESET}`,
    );
    console.error(`  ${CYAN}gleam build --target javascript${RESET}\n`);
  }

  // 의존성 설치 (사용자가 선택한 패키지 매니저 사용)
  console.log(`\n${BOLD}의존성 설치 중... (${pm})${RESET}\n`);
  try {
    execSync(pmConfig.install, {
      cwd: targetDir,
      stdio: "inherit",
    });
    console.log(`\n${GREEN}✓${RESET} 의존성 설치 완료`);
  } catch {
    console.error(
      `\n${YELLOW}⚠ 의존성 설치 실패. 프로젝트 디렉토리에서 직접 실행하세요:${RESET}`,
    );
    console.error(`  ${CYAN}${pmConfig.install}${RESET}\n`);
  }

  // Playwright Chromium 브라우저 설치 (미설치 시에만)
  try {
    const chromiumExists =
      execSync(
        `node -e "const fs=require('fs'),pw=require('playwright');process.stdout.write(String(fs.existsSync(pw.chromium.executablePath())))"`,
        { cwd: targetDir, encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] },
      ).trim() === "true";

    if (!chromiumExists) {
      console.log(`\n${BOLD}Playwright Chromium 설치 중...${RESET}\n`);
      try {
        execSync("npx playwright install chromium", {
          cwd: targetDir,
          stdio: "inherit",
        });
        console.log(`\n${GREEN}✓${RESET} Playwright Chromium 설치 완료`);
      } catch {
        console.error(
          `\n${YELLOW}⚠ Playwright 브라우저 설치 실패. 프로젝트 디렉토리에서 직접 실행하세요:${RESET}`,
        );
        console.error(
          `  ${CYAN}npx playwright install chromium${RESET}\n`,
        );
      }
    } else {
      console.log(`${GREEN}✓${RESET} Playwright Chromium 이미 설치됨`);
    }
  } catch {
    // playwright 패키지 미설치 시 무시
  }

  // 프로덕션 빌드
  console.log(`\n${BOLD}위젯 빌드 중...${RESET}\n`);
  try {
    execSync("gleam run -m glendix/build", {
      cwd: targetDir,
      stdio: "inherit",
    });
    console.log(`\n${GREEN}✓${RESET} 위젯 빌드 완료`);
  } catch {
    console.error(
      `\n${YELLOW}⚠ 빌드 실패. 프로젝트 디렉토리에서 직접 실행하세요:${RESET}`,
    );
    console.error(`  ${CYAN}gleam run -m glendix/build${RESET}\n`);
  }

  // 완료 메시지
  console.log(`
${GREEN}${BOLD}프로젝트가 생성되었습니다!${RESET}

${BOLD}다음 단계:${RESET}

  ${CYAN}cd ${names.kebabCase}${RESET}
  ${CYAN}gleam run -m glendix/dev${RESET}             ${DIM}# 개발 서버 시작${RESET}
  ${CYAN}gleam run -m glendix/build${RESET}           ${DIM}# 프로덕션 빌드${RESET}
  ${CYAN}gleam run -m glendix/marketplace${RESET}     ${DIM}# Marketplace 위젯 다운로드${RESET}
`);
}

/** CLAUDE.md 생성 */
async function generateClaudeMd(targetDir, names, pm, pmConfig) {
  const { writeFile } = await import("node:fs/promises");

  const content = `# ${names.pascalCase}

Gleam 언어로 Mendix Pluggable Widget을 개발하여 "Hello World"를 화면에 렌더링하는 프로젝트.

## Goal

**JSX를 사용하지 않고, 오직 Gleam으로만** 위젯을 작성한다. Gleam 코드를 JavaScript로 컴파일하고, 컴파일된 JS가 곧 Mendix Pluggable Widget의 진입점이 된다. React와 Mendix API 바인딩은 [glendix](https://hexdocs.pm/glendix/) 패키지가 제공한다.

## Tech Stack

- **Gleam** → JavaScript 컴파일 (target: javascript)
- **[glendix](https://hexdocs.pm/glendix/)** — React + Mendix Pluggable Widget API의 Gleam FFI 바인딩 (Hex 패키지)
- **Mendix Pluggable Widget** (React 19)
- **Package Manager**: ${pm} (기본 npm 의존성은 \`gleam run -m glendix/install\`로 설치, \`bindings.json\` 외부 React 패키지는 수동 설치 필요)
- **Build**: \`@mendix/pluggable-widgets-tools\` (Rollup 기반)

## Architecture

\`\`\`
src/
  ${names.snakeCase}.gleam             # 위젯 메인 모듈
  editor_config.gleam                 # Studio Pro 속성 패널 설정
  editor_preview.gleam                # Studio Pro 디자인 뷰 미리보기
  components/
    hello_world.gleam               # Hello World 공유 컴포넌트
  ${names.pascalCase}.xml               # 위젯 속성 정의
  package.xml                         # Mendix 패키지 매니페스트
  ui/
    ${names.pascalCase}.css             # 위젯 스타일시트
widgets/                                # .mpk 위젯 파일 (glendix/widget로 바인딩)
bindings.json                           # 외부 React 컴포넌트 바인딩 설정
package.json                            # npm 의존성 (React, 외부 라이브러리 등)
gleam.toml                            # Gleam 프로젝트 설정 (glendix 의존성 포함)
docs/
  gleam_language_tour.md              # Gleam 언어 레퍼런스
  glendix_guide.md                    # glendix 사용 가이드
\`\`\`

React/Mendix FFI 바인딩은 이 프로젝트에 포함되지 않으며, [glendix](https://hexdocs.pm/glendix/) Hex 패키지로 제공된다.

## Build Pipeline

\`\`\`
[src/*.gleam] + [glendix 패키지 (Hex)]
    ↓  gleam run -m glendix/build
[build/dev/javascript/${names.snakeCase}/*.mjs]
[build/dev/javascript/glendix/glendix/*.mjs]
    ↓  브릿지 JS (자동 생성)가 import
    ↓  Rollup (pluggable-widgets-tools build:web)
[dist/1.0.0/mendix.${names.lowerCase}.${names.pascalCase}.mpk]
\`\`\`

## Commands

\`\`\`bash
gleam run -m glendix/install   # 의존성 설치 + 바인딩 코드 생성 (외부 React 패키지는 사전에 수동 설치 필요)
gleam run -m glendix/build     # 위젯 프로덕션 빌드 (.mpk 생성)
gleam run -m glendix/dev       # 개발 서버 (HMR, port 3000)
gleam run -m glendix/start     # Mendix 테스트 프로젝트와 연동 개발
gleam run -m glendix/lint      # ESLint 실행
gleam run -m glendix/lint_fix  # ESLint 자동 수정
gleam run -m glendix/release   # 릴리즈 빌드
gleam run -m glendix/marketplace  # Mendix Marketplace 위젯 검색/다운로드
gleam build --target javascript  # Gleam → JS 컴파일만
gleam test                       # Gleam 테스트 실행
gleam format                     # Gleam 코드 포맷팅
\`\`\`

## glendix Guide

\`docs/glendix_guide.md\` 파일에 glendix 패키지의 사용법이 수록되어 있다. 주요 내용:
- 프로젝트 설정 및 첫 번째 위젯 만들기
- 핵심 개념: opaque 타입, undefined ↔ Option 변환, Attribute 리스트 API
- React 바인딩: 엘리먼트 생성, Attribute 리스트, HTML 태그 함수, Hooks, 이벤트 처리, 조건부/리스트 렌더링, 스타일, 외부 React 컴포넌트 바인딩, .mpk 위젯 바인딩
- Mendix 바인딩: Props 접근, ValueStatus, EditableValue, ActionValue, DynamicValue, ListValue, ListAttribute, Selection, Reference, Filter, JsDate, Big 등
- Marketplace 연동: Mendix Marketplace에서 위젯 검색/다운로드 (\`glendix/marketplace\`)
- 실전 패턴: 폼 입력 위젯, 데이터 테이블, 검색 가능 리스트, 컴포넌트 합성
- 트러블슈팅

## glendix Modules

React:
- \`glendix/react\` — 핵심 타입 + element/element_/void_element/component_el + fragment/text/none + 조건부 렌더링 + define_component/memo/Context
- \`glendix/react/attribute\` — Attribute 리스트 API (90+ HTML 속성 함수)
- \`glendix/react/hook\` — React Hooks (useState, useEffect, useMemo, useCallback, useRef 등)
- \`glendix/react/event\` — 15개 이벤트 타입 + 148+ 핸들러 Attribute + 67+ 접근자
- \`glendix/react/html\` — 75+ HTML 태그 편의 함수
- \`glendix/react/svg\` — 57 SVG 요소 편의 함수
- \`glendix/react/svg_attribute\` — 97+ SVG 전용 속성 함수
- \`glendix/binding\` — 외부 React 컴포넌트 바인딩
- \`glendix/widget\` — .mpk 위젯 컴포넌트 바인딩
- \`glendix/marketplace\` — Mendix Marketplace 위젯 검색/다운로드

Mendix:
- \`glendix/mendix\` — \`ValueStatus\`, \`ObjectItem\`, Props 접근자
- \`glendix/mendix/editable_value\` — 편집 가능한 값
- \`glendix/mendix/action\` — 액션 실행
- \`glendix/mendix/dynamic_value\` — 동적 읽기 전용 값
- \`glendix/mendix/list_value\` — 리스트 데이터 + 정렬/필터
- \`glendix/mendix/list_attribute\` — 리스트 아이템별 접근
- \`glendix/mendix/selection\` — 단일/다중 선택
- \`glendix/mendix/reference\` — 단일 연관 참조
- \`glendix/mendix/reference_set\` — 다중 연관 참조
- \`glendix/mendix/date\` — JS Date 래퍼
- \`glendix/mendix/big\` — Big.js 고정밀 십진수 래퍼
- \`glendix/mendix/file\` — 파일/이미지
- \`glendix/mendix/icon\` — 아이콘
- \`glendix/mendix/formatter\` — 값 포맷팅/파싱
- \`glendix/mendix/filter\` — 필터 조건 빌더

## Mendix Widget Conventions

- 위젯 ID: \`mendix.${names.lowerCase}.${names.pascalCase}\`
- JSX 파일을 작성하지 않는다. 모든 React 로직은 Gleam + glendix로 구현
- 위젯 프로젝트에 FFI 파일을 직접 작성하지 않는다 — React/Mendix FFI는 glendix가 제공

## Code Style

- Gleam 파일: \`gleam format\` 사용
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

## 핵심 원리

Gleam 함수 \`fn(JsProps) -> ReactElement\`는 React 함수형 컴포넌트와 동일한 시그니처다. glendix가 React 원시 함수와 Mendix 런타임 타입 접근자를 타입 안전하게 제공하므로, 위젯 프로젝트에서는 비즈니스 로직에만 집중하면 된다.

\`\`\`gleam
// src/${names.snakeCase}.gleam
import glendix/mendix
import glendix/react.{type JsProps, type ReactElement}
import glendix/react/attribute
import glendix/react/html

pub fn widget(props: JsProps) -> ReactElement {
  let sample_text = mendix.get_string_prop(props, "sampleText")
  html.div([attribute.class("widget-hello-world")], [
    react.text("Hello " <> sample_text),
  ])
}
\`\`\`

Mendix 복합 타입도 Gleam에서 타입 안전하게 사용할 수 있다:

\`\`\`gleam
import glendix/mendix
import glendix/mendix/editable_value
import glendix/mendix/action

pub fn widget(props: JsProps) -> ReactElement {
  // EditableValue 접근
  let name_attr: EditableValue = mendix.get_prop_required(props, "name")
  let display = editable_value.display_value(name_attr)

  // ActionValue 실행
  let on_save: Option(ActionValue) = mendix.get_prop(props, "onSave")
  action.execute_action(on_save)
  // ...
}
\`\`\`

## 시작하기

### 사전 요구사항

- [Gleam](https://gleam.run/getting-started/installing/) (최신 버전)
- [Node.js](https://nodejs.org/) (v18+)
- ${pm}

### 설치

\`\`\`bash
gleam run -m glendix/install
\`\`\`

### 개발

\`\`\`bash
gleam run -m glendix/dev
\`\`\`

### 빌드

\`\`\`bash
gleam run -m glendix/build
\`\`\`

빌드 결과물(\`.mpk\`)은 \`dist/\` 디렉토리에 생성됩니다.

### 기타 명령어

\`\`\`bash
gleam run -m glendix/start      # Mendix 테스트 프로젝트 연동
gleam run -m glendix/lint       # ESLint 실행
gleam run -m glendix/lint_fix   # ESLint 자동 수정
gleam run -m glendix/release    # 릴리즈 빌드
gleam run -m glendix/marketplace # Marketplace 위젯 검색/다운로드
gleam build --target javascript # Gleam → JS 컴파일만
gleam test                      # 테스트 실행
gleam format                    # 코드 포맷팅
\`\`\`

## 프로젝트 구조

\`\`\`
src/
  ${names.snakeCase}.gleam           # 메인 위젯 모듈
  editor_config.gleam              # Studio Pro 속성 패널
  editor_preview.gleam             # Studio Pro 디자인 뷰 미리보기
  components/
    hello_world.gleam            # Hello World 공유 컴포넌트
  ${names.pascalCase}.xml            # 위젯 속성 정의
widgets/                           # .mpk 위젯 파일 (glendix/widget로 바인딩)
bindings.json                      # 외부 React 컴포넌트 바인딩 설정
package.json                       # npm 의존성 (React, 외부 라이브러리 등)
\`\`\`

React/Mendix FFI 바인딩은 [glendix](https://hexdocs.pm/glendix/) Hex 패키지로 제공됩니다.

## 외부 React 컴포넌트 사용

npm 패키지로 제공되는 React 컴포넌트 라이브러리를 \`.mjs\` FFI 파일 작성 없이 순수 Gleam에서 사용할 수 있다.

### 1단계: npm 패키지 설치

\`\`\`bash
${pm === "npm" ? "npm install" : pm === "yarn" ? "yarn add" : pm === "pnpm" ? "pnpm add" : "bun add"} recharts
\`\`\`

### 2단계: \`bindings.json\` 작성

프로젝트 루트에 \`bindings.json\`을 생성하고, 사용할 컴포넌트를 등록한다:

\`\`\`json
{
  "recharts": {
    "components": ["PieChart", "Pie", "Cell", "Tooltip", "ResponsiveContainer"]
  }
}
\`\`\`

### 3단계: 바인딩 생성

\`\`\`bash
gleam run -m glendix/install
\`\`\`

\`binding_ffi.mjs\`가 자동 생성된다. 이후 \`gleam run -m glendix/build\` 등 빌드 시에도 자동 갱신된다.

### 4단계: Gleam에서 사용

\`\`\`gleam
import glendix/binding
import glendix/react.{type ReactElement}
import glendix/react/attribute.{type Attribute}

fn m() { binding.module("recharts") }

pub fn pie_chart(attrs: List(Attribute), children: List(ReactElement)) -> ReactElement {
  react.component_el(binding.resolve(m(), "PieChart"), attrs, children)
}

pub fn tooltip(attrs: List(Attribute)) -> ReactElement {
  react.void_component_el(binding.resolve(m(), "Tooltip"), attrs)
}
\`\`\`

\`html.div\`와 동일한 호출 패턴으로 외부 React 컴포넌트를 사용할 수 있다.

## Mendix Marketplace 위젯 다운로드

Mendix Marketplace에서 위젯(.mpk)을 인터랙티브하게 검색하고 다운로드할 수 있다. 다운로드 완료 후 바인딩 \`.gleam\` 파일이 자동 생성되어 바로 사용 가능하다.

### 사전 준비

\`.env\` 파일에 Mendix Personal Access Token을 설정한다:

\`\`\`
MENDIX_PAT=your_personal_access_token
\`\`\`

> PAT는 [Mendix Developer Settings](https://user-settings.mendix.com/link/developersettings)에서 **Personal Access Tokens** 섹션의 **New Token**을 클릭하여 발급. 필요한 scope: \`mx:marketplace-content:read\`

### 실행

\`\`\`bash
gleam run -m glendix/marketplace
\`\`\`

인터랙티브 TUI에서 위젯을 검색/선택하면 \`widgets/\` 디렉토리에 \`.mpk\`가 다운로드되고, \`src/widgets/\`에 바인딩 \`.gleam\` 파일이 자동 생성된다.

## .mpk 위젯 컴포넌트 사용

\`widgets/\` 디렉토리에 \`.mpk\` 파일(Mendix 위젯 빌드 결과물)을 배치하면, 다른 위젯 안에서 기존 Mendix 위젯을 React 컴포넌트로 렌더링할 수 있다.

### 1단계: \`.mpk\` 파일 배치

\`\`\`
프로젝트 루트/
├── widgets/
│   ├── Switch.mpk
│   └── Badge.mpk
├── src/
└── gleam.toml
\`\`\`

### 2단계: 바인딩 생성

\`\`\`bash
gleam run -m glendix/install
\`\`\`

실행 시 다음이 자동 처리된다:
- \`.mpk\`에서 \`.mjs\`/\`.css\`를 추출하고 \`widget_ffi.mjs\`가 생성된다
- \`.mpk\` XML의 \`<property>\` 정의를 파싱하여 \`src/widgets/\`에 바인딩 \`.gleam\` 파일이 자동 생성된다 (이미 존재하면 건너뜀)

### 3단계: 자동 생성된 \`src/widgets/*.gleam\` 파일 확인

\`\`\`gleam
// src/widgets/switch.gleam (자동 생성)
import glendix/mendix
import glendix/react.{type JsProps, type ReactElement}
import glendix/react/attribute
import glendix/widget

/// Switch 위젯 렌더링 - props에서 속성을 읽어 위젯에 전달
pub fn render(props: JsProps) -> ReactElement {
  let boolean_attribute = mendix.get_prop_required(props, "booleanAttribute")
  let action = mendix.get_prop_required(props, "action")

  let comp = widget.component("Switch")
  react.component_el(
    comp,
    [
      attribute.attribute("booleanAttribute", boolean_attribute),
      attribute.attribute("action", action),
    ],
    [],
  )
}
\`\`\`

required/optional 속성이 자동 구분되며, 필요에 따라 생성된 파일을 자유롭게 수정할 수 있다.

### 4단계: 위젯에서 사용

\`\`\`gleam
import widgets/switch

// 컴포넌트 내부에서
switch.render(props)
\`\`\`

위젯 이름은 \`.mpk\` 내부 XML의 \`<name>\` 값을, property key는 \`.mpk\` XML의 원본 key를 그대로 사용한다.

## 기술 스택

- **Gleam** → JavaScript 컴파일
- **[glendix](https://hexdocs.pm/glendix/)** — React + Mendix API Gleam 바인딩
- **Mendix Pluggable Widget** (React 19)
- **${pm}** — 패키지 매니저

## 라이센스

Apache-2.0
`;

  await writeFile(join(targetDir, "README.md"), content, "utf-8");
}
