/**
 * README.md template — 3 language versions
 */

export function generateReadmeContent(lang, names, pm, pmConfig, license) {
  const installCmd =
    pm === "npm"
      ? "npm install"
      : pm === "yarn"
        ? "yarn add"
        : pm === "pnpm"
          ? "pnpm add"
          : "bun add";

  switch (lang) {
    case "ko":
      return generateKo(names, pm, installCmd, license);
    case "ja":
      return generateJa(names, pm, installCmd, license);
    default:
      return generateEn(names, pm, installCmd, license);
  }
}

// ---------------------------------------------------------------------------
// English
// ---------------------------------------------------------------------------

function generateEn(names, pm, installCmd, license) {
  return `# ${names.pascalCase}

A Mendix Pluggable Widget written in Gleam.

## Core Principles

The Gleam function \`fn(JsProps) -> Element\` has the same signature as a React functional component. React bindings come from the \`redraw\`/\`redraw_dom\` packages, while glendix handles Mendix API access and JS interop, so widget projects only need to focus on business logic.

\`\`\`gleam
// src/${names.snakeCase}.gleam
import glendix/mendix.{type JsProps}
import redraw.{type Element}
import redraw/dom/attribute
import redraw/dom/html

pub fn widget(props: JsProps) -> Element {
  let sample_text = mendix.get_string_prop(props, "sampleText")
  html.div([attribute.class("widget-hello-world")], [
    html.text("Hello " <> sample_text),
  ])
}
\`\`\`

Mendix complex types can also be used type-safely from Gleam:

\`\`\`gleam
import glendix/mendix.{type JsProps}
import glendix/mendix/editable_value
import glendix/mendix/action
import redraw.{type Element}

pub fn widget(props: JsProps) -> Element {
  // Access EditableValue
  let name_attr: EditableValue = mendix.get_prop_required(props, "name")
  let display = editable_value.display_value(name_attr)

  // Execute ActionValue
  let on_save: Option(ActionValue) = mendix.get_prop(props, "onSave")
  action.execute_action(on_save)
  // ...
}
\`\`\`

## Getting Started

### Prerequisites

- [Gleam](https://gleam.run/getting-started/installing/) (latest version)
- [Node.js](https://nodejs.org/) (v18+)
- ${pm}

### Installation

\`\`\`bash
gleam run -m glendix/install
\`\`\`

### Development

\`\`\`bash
gleam run -m glendix/dev
\`\`\`

### Build

\`\`\`bash
gleam run -m glendix/build
\`\`\`

Build artifacts (\`.mpk\`) are generated in the \`dist/\` directory.

### Other Commands

\`\`\`bash
gleam run -m glendix/start      # Link with Mendix test project
gleam run -m glendix/lint       # Run ESLint
gleam run -m glendix/lint_fix   # ESLint auto-fix
gleam run -m glendix/release    # Release build
gleam run -m glendix/marketplace # Search/download Marketplace widgets
gleam run -m glendix/define     # Widget property definition TUI editor
gleam build --target javascript # Gleam → JS compilation only
gleam test                      # Run tests
gleam format                    # Format code
\`\`\`

## Project Structure

\`\`\`
src/
  ${names.snakeCase}.gleam           # Main widget module
  editor_config.gleam              # Studio Pro property panel
  editor_preview.gleam             # Studio Pro design view preview
  components/
    hello_world.gleam            # Shared Hello World component
  ${names.pascalCase}.xml            # Widget property definitions
widgets/                           # .mpk widget files (bindings via glendix/widget)
bindings.json                      # External React component binding configuration
package.json                       # npm dependencies (React, external libraries, etc.)
\`\`\`

React bindings come from [redraw](https://hexdocs.pm/redraw/)/[redraw_dom](https://hexdocs.pm/redraw_dom/), while Mendix API and JS Interop bindings are provided by [glendix](https://hexdocs.pm/glendix/).

## Using External React Components

React component libraries distributed as npm packages can be used from pure Gleam without writing any \`.mjs\` FFI files.

### Step 1: Install the npm package

\`\`\`bash
${installCmd} recharts
\`\`\`

### Step 2: Write \`bindings.json\`

Create \`bindings.json\` at the project root and register the components:

\`\`\`json
{
  "recharts": {
    "components": ["PieChart", "Pie", "Cell", "Tooltip", "ResponsiveContainer"]
  }
}
\`\`\`

### Step 3: Generate bindings

\`\`\`bash
gleam run -m glendix/install
\`\`\`

\`binding_ffi.mjs\` is generated automatically. It is also regenerated on subsequent builds via \`gleam run -m glendix/build\`.

### Step 4: Use from Gleam

\`\`\`gleam
import glendix/binding
import glendix/interop
import redraw.{type Element}
import redraw/dom/attribute.{type Attribute}

fn m() { binding.module("recharts") }

pub fn pie_chart(attrs: List(Attribute), children: List(Element)) -> Element {
  interop.component_el(binding.resolve(m(), "PieChart"), attrs, children)
}

pub fn tooltip(attrs: List(Attribute)) -> Element {
  interop.void_component_el(binding.resolve(m(), "Tooltip"), attrs)
}
\`\`\`

External React components follow the same calling pattern as \`html.div\`.

## Mendix Marketplace Widget Download

Interactively search and download widgets (.mpk) from the Mendix Marketplace. After download, binding \`.gleam\` files are generated automatically and ready to use.

### Preparation

Set your Mendix Personal Access Token in a \`.env\` file:

\`\`\`
MENDIX_PAT=your_personal_access_token
\`\`\`

> Generate a PAT from [Mendix Developer Settings](https://user-settings.mendix.com/link/developersettings) — click **New Token** under **Personal Access Tokens**. Required scope: \`mx:marketplace-content:read\`

### Run

\`\`\`bash
gleam run -m glendix/marketplace
\`\`\`

Search and select widgets in the interactive TUI. The \`.mpk\` is downloaded to the \`widgets/\` directory, and binding \`.gleam\` files are auto-generated in \`src/widgets/\`.

## Using .mpk Widget Components

Place \`.mpk\` files (Mendix widget build artifacts) in the \`widgets/\` directory to render existing Mendix widgets as React components within your own widget.

### Step 1: Place the \`.mpk\` files

\`\`\`
project root/
├── widgets/
│   ├── Switch.mpk
│   └── Badge.mpk
├── src/
└── gleam.toml
\`\`\`

### Step 2: Generate bindings

\`\`\`bash
gleam run -m glendix/install
\`\`\`

This automatically:
- Extracts \`.mjs\`/\`.css\` from \`.mpk\` and generates \`widget_ffi.mjs\`
- Parses \`<property>\` definitions from \`.mpk\` XML and generates binding \`.gleam\` files in \`src/widgets/\` (existing files are skipped)

### Step 3: Review auto-generated \`src/widgets/*.gleam\` files

\`\`\`gleam
// src/widgets/switch.gleam (auto-generated)
import glendix/mendix.{type JsProps}
import glendix/interop
import redraw.{type Element}
import redraw/dom/attribute
import glendix/widget

/// Render Switch widget - reads properties from props and passes them to the widget
pub fn render(props: JsProps) -> Element {
  let boolean_attribute = mendix.get_prop_required(props, "booleanAttribute")
  let action = mendix.get_prop_required(props, "action")

  let comp = widget.component("Switch")
  interop.component_el(
    comp,
    [
      attribute.attribute("booleanAttribute", boolean_attribute),
      attribute.attribute("action", action),
    ],
    [],
  )
}
\`\`\`

Required/optional properties are distinguished automatically. You can freely modify the generated files as needed.

### Step 4: Use in your widget

\`\`\`gleam
import widgets/switch

// Inside a component
switch.render(props)
\`\`\`

Widget names use the \`<name>\` value from the \`.mpk\`'s internal XML, and property keys use the original keys from the \`.mpk\` XML.

## Tech Stack

- **Gleam** → JavaScript compilation
- **[glendix](https://hexdocs.pm/glendix/)** — Mendix API + JS Interop Gleam bindings
- **[redraw](https://hexdocs.pm/redraw/)** / **[redraw_dom](https://hexdocs.pm/redraw_dom/)** — React Gleam bindings
- **Mendix Pluggable Widget** (React 19)
- **${pm}** — Package manager

## License

${license}
`;
}

// ---------------------------------------------------------------------------
// Korean
// ---------------------------------------------------------------------------

function generateKo(names, pm, installCmd, license) {
  return `# ${names.pascalCase}

Gleam 언어로 작성된 Mendix Pluggable Widget.

## 핵심 원리

Gleam 함수 \`fn(JsProps) -> Element\`는 React 함수형 컴포넌트와 동일한 시그니처다. React 바인딩은 \`redraw\`/\`redraw_dom\` 패키지가, Mendix API 접근과 JS interop은 glendix가 제공하므로, 위젯 프로젝트에서는 비즈니스 로직에만 집중하면 된다.

\`\`\`gleam
// src/${names.snakeCase}.gleam
import glendix/mendix.{type JsProps}
import redraw.{type Element}
import redraw/dom/attribute
import redraw/dom/html

pub fn widget(props: JsProps) -> Element {
  let sample_text = mendix.get_string_prop(props, "sampleText")
  html.div([attribute.class("widget-hello-world")], [
    html.text("Hello " <> sample_text),
  ])
}
\`\`\`

Mendix 복합 타입도 Gleam에서 타입 안전하게 사용할 수 있다:

\`\`\`gleam
import glendix/mendix.{type JsProps}
import glendix/mendix/editable_value
import glendix/mendix/action
import redraw.{type Element}

pub fn widget(props: JsProps) -> Element {
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
gleam run -m glendix/define     # 위젯 프로퍼티 정의 TUI 에디터
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

React 바인딩은 [redraw](https://hexdocs.pm/redraw/)/[redraw_dom](https://hexdocs.pm/redraw_dom/)이, Mendix API 및 JS Interop 바인딩은 [glendix](https://hexdocs.pm/glendix/)가 제공합니다.

## 외부 React 컴포넌트 사용

npm 패키지로 제공되는 React 컴포넌트 라이브러리를 \`.mjs\` FFI 파일 작성 없이 순수 Gleam에서 사용할 수 있다.

### 1단계: npm 패키지 설치

\`\`\`bash
${installCmd} recharts
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
import glendix/interop
import redraw.{type Element}
import redraw/dom/attribute.{type Attribute}

fn m() { binding.module("recharts") }

pub fn pie_chart(attrs: List(Attribute), children: List(Element)) -> Element {
  interop.component_el(binding.resolve(m(), "PieChart"), attrs, children)
}

pub fn tooltip(attrs: List(Attribute)) -> Element {
  interop.void_component_el(binding.resolve(m(), "Tooltip"), attrs)
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
import glendix/mendix.{type JsProps}
import glendix/interop
import redraw.{type Element}
import redraw/dom/attribute
import glendix/widget

/// Switch 위젯 렌더링 - props에서 속성을 읽어 위젯에 전달
pub fn render(props: JsProps) -> Element {
  let boolean_attribute = mendix.get_prop_required(props, "booleanAttribute")
  let action = mendix.get_prop_required(props, "action")

  let comp = widget.component("Switch")
  interop.component_el(
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
- **[glendix](https://hexdocs.pm/glendix/)** — Mendix API + JS Interop Gleam 바인딩
- **[redraw](https://hexdocs.pm/redraw/)** / **[redraw_dom](https://hexdocs.pm/redraw_dom/)** — React Gleam 바인딩
- **Mendix Pluggable Widget** (React 19)
- **${pm}** — 패키지 매니저

## 라이센스

${license}
`;
}

// ---------------------------------------------------------------------------
// Japanese
// ---------------------------------------------------------------------------

function generateJa(names, pm, installCmd, license) {
  return `# ${names.pascalCase}

Gleam言語で作成されたMendix Pluggable Widget。

## 基本原理

Gleam関数 \`fn(JsProps) -> Element\` はReact関数コンポーネントと同一のシグネチャを持つ。Reactバインディングは\`redraw\`/\`redraw_dom\`パッケージが、Mendix APIアクセスとJS interopはglendixが提供するため、ウィジェットプロジェクトではビジネスロジックにのみ集中すればよい。

\`\`\`gleam
// src/${names.snakeCase}.gleam
import glendix/mendix.{type JsProps}
import redraw.{type Element}
import redraw/dom/attribute
import redraw/dom/html

pub fn widget(props: JsProps) -> Element {
  let sample_text = mendix.get_string_prop(props, "sampleText")
  html.div([attribute.class("widget-hello-world")], [
    html.text("Hello " <> sample_text),
  ])
}
\`\`\`

Mendixの複合型もGleamから型安全に使用できる：

\`\`\`gleam
import glendix/mendix.{type JsProps}
import glendix/mendix/editable_value
import glendix/mendix/action
import redraw.{type Element}

pub fn widget(props: JsProps) -> Element {
  // EditableValueへのアクセス
  let name_attr: EditableValue = mendix.get_prop_required(props, "name")
  let display = editable_value.display_value(name_attr)

  // ActionValueの実行
  let on_save: Option(ActionValue) = mendix.get_prop(props, "onSave")
  action.execute_action(on_save)
  // ...
}
\`\`\`

## はじめに

### 前提条件

- [Gleam](https://gleam.run/getting-started/installing/)（最新バージョン）
- [Node.js](https://nodejs.org/)（v18以上）
- ${pm}

### インストール

\`\`\`bash
gleam run -m glendix/install
\`\`\`

### 開発

\`\`\`bash
gleam run -m glendix/dev
\`\`\`

### ビルド

\`\`\`bash
gleam run -m glendix/build
\`\`\`

ビルド成果物（\`.mpk\`）は\`dist/\`ディレクトリに生成される。

### その他のコマンド

\`\`\`bash
gleam run -m glendix/start      # Mendixテストプロジェクト連携
gleam run -m glendix/lint       # ESLint実行
gleam run -m glendix/lint_fix   # ESLint自動修正
gleam run -m glendix/release    # リリースビルド
gleam run -m glendix/marketplace # Marketplaceウィジェット検索/ダウンロード
gleam run -m glendix/define     # ウィジェットプロパティ定義TUIエディター
gleam build --target javascript # Gleam → JSコンパイルのみ
gleam test                      # テスト実行
gleam format                    # コードフォーマット
\`\`\`

## プロジェクト構成

\`\`\`
src/
  ${names.snakeCase}.gleam           # メインウィジェットモジュール
  editor_config.gleam              # Studio Proプロパティパネル
  editor_preview.gleam             # Studio Proデザインビュープレビュー
  components/
    hello_world.gleam            # Hello World共有コンポーネント
  ${names.pascalCase}.xml            # ウィジェットプロパティ定義
widgets/                           # .mpkウィジェットファイル（glendix/widgetでバインディング）
bindings.json                      # 外部Reactコンポーネントバインディング設定
package.json                       # npm依存関係（React、外部ライブラリなど）
\`\`\`

Reactバインディングは[redraw](https://hexdocs.pm/redraw/)/[redraw_dom](https://hexdocs.pm/redraw_dom/)が、Mendix APIおよびJS Interopバインディングは[glendix](https://hexdocs.pm/glendix/)が提供する。

## 外部Reactコンポーネントの使用

npmパッケージとして提供されるReactコンポーネントライブラリを、\`.mjs\` FFIファイルを書くことなく純粋なGleamから使用できる。

### ステップ1：npmパッケージのインストール

\`\`\`bash
${installCmd} recharts
\`\`\`

### ステップ2：\`bindings.json\`の作成

プロジェクトルートに\`bindings.json\`を作成し、使用するコンポーネントを登録する：

\`\`\`json
{
  "recharts": {
    "components": ["PieChart", "Pie", "Cell", "Tooltip", "ResponsiveContainer"]
  }
}
\`\`\`

### ステップ3：バインディングの生成

\`\`\`bash
gleam run -m glendix/install
\`\`\`

\`binding_ffi.mjs\`が自動生成される。以降の\`gleam run -m glendix/build\`等のビルド時にも自動更新される。

### ステップ4：Gleamから使用

\`\`\`gleam
import glendix/binding
import glendix/interop
import redraw.{type Element}
import redraw/dom/attribute.{type Attribute}

fn m() { binding.module("recharts") }

pub fn pie_chart(attrs: List(Attribute), children: List(Element)) -> Element {
  interop.component_el(binding.resolve(m(), "PieChart"), attrs, children)
}

pub fn tooltip(attrs: List(Attribute)) -> Element {
  interop.void_component_el(binding.resolve(m(), "Tooltip"), attrs)
}
\`\`\`

\`html.div\`と同じ呼び出しパターンで外部Reactコンポーネントを使用できる。

## Mendix Marketplaceウィジェットのダウンロード

Mendix Marketplaceからウィジェット（.mpk）をインタラクティブに検索・ダウンロードできる。ダウンロード完了後、バインディング\`.gleam\`ファイルが自動生成され、すぐに使用可能になる。

### 事前準備

\`.env\`ファイルにMendix Personal Access Tokenを設定する：

\`\`\`
MENDIX_PAT=your_personal_access_token
\`\`\`

> PATは[Mendix Developer Settings](https://user-settings.mendix.com/link/developersettings)の**Personal Access Tokens**セクションで**New Token**をクリックして発行。必要なscope：\`mx:marketplace-content:read\`

### 実行

\`\`\`bash
gleam run -m glendix/marketplace
\`\`\`

インタラクティブTUIでウィジェットを検索・選択すると、\`widgets/\`ディレクトリに\`.mpk\`がダウンロードされ、\`src/widgets/\`にバインディング\`.gleam\`ファイルが自動生成される。

## .mpkウィジェットコンポーネントの使用

\`widgets/\`ディレクトリに\`.mpk\`ファイル（Mendixウィジェットビルド成果物）を配置すると、別のウィジェット内から既存のMendixウィジェットをReactコンポーネントとしてレンダリングできる。

### ステップ1：\`.mpk\`ファイルの配置

\`\`\`
プロジェクトルート/
├── widgets/
│   ├── Switch.mpk
│   └── Badge.mpk
├── src/
└── gleam.toml
\`\`\`

### ステップ2：バインディングの生成

\`\`\`bash
gleam run -m glendix/install
\`\`\`

実行時に以下が自動処理される：
- \`.mpk\`から\`.mjs\`/\`.css\`を抽出し、\`widget_ffi.mjs\`が生成される
- \`.mpk\` XMLの\`<property>\`定義をパースし、\`src/widgets/\`にバインディング\`.gleam\`ファイルが自動生成される（既存ファイルはスキップ）

### ステップ3：自動生成された\`src/widgets/*.gleam\`ファイルの確認

\`\`\`gleam
// src/widgets/switch.gleam（自動生成）
import glendix/mendix.{type JsProps}
import glendix/interop
import redraw.{type Element}
import redraw/dom/attribute
import glendix/widget

/// Switchウィジェットのレンダリング - propsからプロパティを読み取りウィジェットに渡す
pub fn render(props: JsProps) -> Element {
  let boolean_attribute = mendix.get_prop_required(props, "booleanAttribute")
  let action = mendix.get_prop_required(props, "action")

  let comp = widget.component("Switch")
  interop.component_el(
    comp,
    [
      attribute.attribute("booleanAttribute", boolean_attribute),
      attribute.attribute("action", action),
    ],
    [],
  )
}
\`\`\`

required/optionalプロパティは自動的に区別され、生成されたファイルは自由に編集できる。

### ステップ4：ウィジェットで使用

\`\`\`gleam
import widgets/switch

// コンポーネント内で
switch.render(props)
\`\`\`

ウィジェット名は\`.mpk\`内部XMLの\`<name>\`値を、プロパティキーは\`.mpk\` XMLの元のキーをそのまま使用する。

## 技術スタック

- **Gleam** → JavaScriptコンパイル
- **[glendix](https://hexdocs.pm/glendix/)** — Mendix API + JS Interop Gleamバインディング
- **[redraw](https://hexdocs.pm/redraw/)** / **[redraw_dom](https://hexdocs.pm/redraw_dom/)** — React Gleamバインディング
- **Mendix Pluggable Widget**（React 19）
- **${pm}** — パッケージマネージャー

## ライセンス

${license}
`;
}
