/**
 * widgets/README.md template — 3 language versions
 */

export function generateWidgetsReadmeContent(lang) {
  switch (lang) {
    case "ko":
      return generateKo();
    case "ja":
      return generateJa();
    default:
      return generateEn();
  }
}

function generateEn() {
  return `# widgets/

Mendix widget binding directory. Place \`.mpk\` files (Mendix widget build artifacts) in this directory to render existing Mendix widgets as React components from Gleam code.

## Usage

### 1. Place \`.mpk\` files

Copy built Mendix widget \`.mpk\` files into this directory:

\`\`\`
widgets/
├── Switch.mpk
├── Badge.mpk
└── README.md
\`\`\`

### 2. Generate bindings

\`\`\`bash
gleam run -m glendix/install
\`\`\`

This automatically:

- Extracts \`.mjs\` and \`.css\` from \`.mpk\` and generates \`widget_ffi.mjs\`
- Parses \`<property>\` definitions from \`.mpk\` XML and generates binding \`.gleam\` files in \`src/widgets/\` (existing files are skipped)

### 3. Review auto-generated bindings

For example, placing \`Switch.mpk\` generates \`src/widgets/switch.gleam\`:

\`\`\`gleam
// src/widgets/switch.gleam (auto-generated)
import mendraw/interop
import mendraw/mendix.{type JsProps}
import mendraw/widget
import redraw.{type Element}
import redraw/dom/attribute

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

- Required/optional properties are distinguished automatically
- If optional properties exist, \`optional_attr\` helper and \`gleam/option\` import are added automatically
- Gleam reserved words (e.g. \`type\`) are automatically suffixed with \`_\`
- Generated files can be freely modified as needed

### 4. Use from Gleam

\`\`\`gleam
import widgets/switch

// Inside a component
switch.render(props)
\`\`\`

## How it works

- \`mendraw/widget\` module's \`widget.component("Name")\` imports \`.mpk\` widgets as React components
- Props are passed via the generic \`attribute.attribute(key, value)\` function
- Widget names use the \`<name>\` value from the \`.mpk\`'s internal XML, and property keys use the original keys from the \`.mpk\` XML
- Unlike the \`binding\` module, 1 mpk = 1 component, so \`widget.component("Name")\` imports it in one call

## Notes

- After adding/removing \`.mpk\` files, you must run \`gleam run -m glendix/install\` again
- \`widget_ffi.mjs\` is auto-generated — do not edit it directly
- Do not write \`.mjs\` FFI files for \`.mpk\` widgets manually — use the \`widgets/\` directory + \`mendraw/widget\`
`;
}

function generateKo() {
  return `# widgets/

Mendix 위젯 바인딩 디렉토리. \`.mpk\` 파일(Mendix 위젯 빌드 결과물)을 이 디렉토리에 배치하면, Gleam 코드에서 기존 Mendix 위젯을 React 컴포넌트로 렌더링할 수 있다.

## 사용법

### 1. \`.mpk\` 파일 배치

빌드된 Mendix 위젯의 \`.mpk\` 파일을 이 디렉토리에 복사한다:

\`\`\`
widgets/
├── Switch.mpk
├── Badge.mpk
└── README.md
\`\`\`

### 2. 바인딩 생성

\`\`\`bash
gleam run -m glendix/install
\`\`\`

실행 시 다음이 자동 처리된다:

- \`.mpk\` 내부의 \`.mjs\`와 \`.css\`가 추출되고, \`widget_ffi.mjs\`가 생성된다
- \`.mpk\` XML의 \`<property>\` 정의를 파싱하여 \`src/widgets/\`에 바인딩 \`.gleam\` 파일이 자동 생성된다 (이미 존재하면 건너뜀)

### 3. 자동 생성된 바인딩 확인

예를 들어 \`Switch.mpk\`를 배치하면 \`src/widgets/switch.gleam\`이 생성된다:

\`\`\`gleam
// src/widgets/switch.gleam (자동 생성)
import mendraw/interop
import mendraw/mendix.{type JsProps}
import mendraw/widget
import redraw.{type Element}
import redraw/dom/attribute

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

- required/optional 속성이 자동 구분된다
- optional 속성이 있으면 \`optional_attr\` 헬퍼와 \`gleam/option\` import가 자동 추가된다
- Gleam 예약어(\`type\` 등)는 접미사 \`_\`로 자동 회피된다
- 생성된 파일은 필요에 따라 자유롭게 수정 가능하다

### 4. Gleam에서 사용

\`\`\`gleam
import widgets/switch

// 컴포넌트 내부에서
switch.render(props)
\`\`\`

## 동작 원리

- \`mendraw/widget\` 모듈의 \`widget.component("Name")\`으로 \`.mpk\` 위젯을 React 컴포넌트로 가져온다
- Props는 \`attribute.attribute(key, value)\` 범용 함수로 전달한다
- 위젯 이름은 \`.mpk\` 내부 XML의 \`<name>\` 값을, property key는 XML의 원본 key를 그대로 사용한다
- \`binding\` 모듈과 달리 1 mpk = 1 컴포넌트이므로 \`widget.component("Name")\` 한 번에 가져온다

## 주의사항

- \`.mpk\` 파일을 추가/제거한 후에는 반드시 \`gleam run -m glendix/install\`을 다시 실행해야 한다
- \`widget_ffi.mjs\`는 자동 생성 파일이므로 직접 수정하지 않는다
- \`.mpk\` 위젯용 \`.mjs\` FFI 파일을 직접 작성하지 않는다 — \`widgets/\` 디렉토리 + \`mendraw/widget\`을 사용한다
`;
}

function generateJa() {
  return `# widgets/

Mendixウィジェットバインディングディレクトリ。\`.mpk\`ファイル（Mendixウィジェットビルド成果物）をこのディレクトリに配置すると、Gleamコードから既存のMendixウィジェットをReactコンポーネントとしてレンダリングできる。

## 使い方

### 1. \`.mpk\`ファイルの配置

ビルド済みMendixウィジェットの\`.mpk\`ファイルをこのディレクトリにコピーする：

\`\`\`
widgets/
├── Switch.mpk
├── Badge.mpk
└── README.md
\`\`\`

### 2. バインディングの生成

\`\`\`bash
gleam run -m glendix/install
\`\`\`

実行時に以下が自動処理される：

- \`.mpk\`内部の\`.mjs\`と\`.css\`が抽出され、\`widget_ffi.mjs\`が生成される
- \`.mpk\` XMLの\`<property>\`定義をパースし、\`src/widgets/\`にバインディング\`.gleam\`ファイルが自動生成される（既存ファイルはスキップ）

### 3. 自動生成されたバインディングの確認

例えば\`Switch.mpk\`を配置すると\`src/widgets/switch.gleam\`が生成される：

\`\`\`gleam
// src/widgets/switch.gleam（自動生成）
import mendraw/interop
import mendraw/mendix.{type JsProps}
import mendraw/widget
import redraw.{type Element}
import redraw/dom/attribute

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

- required/optionalプロパティは自動的に区別される
- optionalプロパティがある場合、\`optional_attr\`ヘルパーと\`gleam/option\` importが自動追加される
- Gleam予約語（\`type\`等）はサフィックス\`_\`で自動回避される
- 生成されたファイルは必要に応じて自由に編集できる

### 4. Gleamから使用

\`\`\`gleam
import widgets/switch

// コンポーネント内で
switch.render(props)
\`\`\`

## 仕組み

- \`mendraw/widget\`モジュールの\`widget.component("Name")\`で\`.mpk\`ウィジェットをReactコンポーネントとしてインポートする
- Propsは\`attribute.attribute(key, value)\`汎用関数で渡す
- ウィジェット名は\`.mpk\`内部XMLの\`<name>\`値を、プロパティキーはXMLの元のキーをそのまま使用する
- \`binding\`モジュールと異なり1 mpk = 1コンポーネントなので、\`widget.component("Name")\`で一度にインポートする

## 注意事項

- \`.mpk\`ファイルを追加/削除した後は必ず\`gleam run -m glendix/install\`を再実行すること
- \`widget_ffi.mjs\`は自動生成ファイルなので直接編集しない
- \`.mpk\`ウィジェット用の\`.mjs\` FFIファイルを直接記述しない — \`widgets/\`ディレクトリ + \`mendraw/widget\`を使用する
`;
}
