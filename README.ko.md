# MendixWidgetGleam

**[English](README.md)** | **[한국어](README.ko.md)** | **[日本語](README.ja.md)**

**Gleam 언어로 Mendix Pluggable Widget을 개발하는 프로젝트.**

JSX를 사용하지 않고, Gleam 코드만으로 React 컴포넌트를 작성하여 Mendix Studio Pro에서 동작하는 위젯을 만든다. React와 Mendix API 바인딩은 [glendix](https://hexdocs.pm/glendix/) 패키지가 제공한다.

## 왜 Gleam인가?

- **정적 타입 안전성** — Gleam의 강력한 타입 시스템으로 런타임 에러를 컴파일 타임에 방지
- **불변 데이터** — 예측 가능한 상태 관리
- **JavaScript 타겟 지원** — `gleam build --target javascript`로 ES 모듈 출력
- **glendix 패키지** — React + Mendix API의 타입 안전한 Gleam 바인딩. `EditableValue`, `ActionValue`, `ListValue` 등 모든 Mendix Pluggable Widget API를 지원

## 아키텍처

```
src/
  mendix_widget_gleam.gleam           # 위젯 메인 모듈
  editor_config.gleam                 # Studio Pro 속성 패널 설정
  editor_preview.gleam                # Studio Pro 디자인 뷰 미리보기
  components/
    hello_world.gleam               # Hello World 공유 컴포넌트
  MendixWidget.xml                    # 위젯 속성 정의
  package.xml                         # Mendix 패키지 매니페스트
widgets/                                # .mpk 위젯 파일 (glendix/widget로 바인딩)
bindings.json                           # 외부 React 컴포넌트 바인딩 설정
package.json                            # npm 의존성 (React, 외부 라이브러리 등)
gleam.toml                            # glendix >= 2.0.13 의존성 포함
```

React/Mendix FFI 바인딩은 이 프로젝트에 포함되지 않으며, [glendix](https://hexdocs.pm/glendix/) Hex 패키지로 제공된다.

### 빌드 파이프라인

```
위젯 코드 (.gleam) + glendix 패키지 (Hex)
    ↓  gleam run -m glendix/build (Gleam 컴파일 자동 수행)
ES 모듈 (.mjs) — build/dev/javascript/...
    ↓  브릿지 JS (자동 생성)가 import
    ↓  Rollup (pluggable-widgets-tools)
.mpk 위젯 패키지 — dist/
```

### 핵심 원리

Gleam 함수 `fn(JsProps) -> ReactElement`는 React 함수형 컴포넌트와 동일한 시그니처다. glendix가 React 원시 함수와 Mendix 런타임 타입 접근자를 타입 안전하게 제공하므로, 위젯 프로젝트에서는 비즈니스 로직에만 집중하면 된다.

```gleam
// src/mendix_widget_gleam.gleam
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
```

Mendix 복합 타입도 Gleam에서 타입 안전하게 사용할 수 있다:

```gleam
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
```

## 시작하기

### 사전 요구사항

- [Gleam](https://gleam.run/getting-started/installing/) (v1.0+)
- [Node.js](https://nodejs.org/) (v16+)
- [Mendix Studio Pro](https://marketplace.mendix.com/link/studiopro/) (위젯 테스트용)

### 설치

```bash
gleam run -m glendix/install   # Gleam 의존성 자동 다운로드 + npm 의존성 설치 + 바인딩 코드 생성 (외부 React 패키지는 사전에 수동 설치 필요)
```

### 빌드

```bash
gleam run -m glendix/build     # Gleam 컴파일 + 위젯 빌드 (.mpk 생성)
```

빌드 결과물은 `dist/` 디렉토리에 `.mpk` 파일로 생성된다.

### 개발

```bash
gleam run -m glendix/dev       # Gleam 컴파일 + 개발 서버 (HMR, port 3000)
gleam run -m glendix/start     # Mendix 테스트 프로젝트와 연동 개발
```

## 명령어 모음

모든 명령어는 `gleam`으로 통일. `gleam run -m`은 Gleam 컴파일을 자동 수행한 뒤 스크립트를 실행한다.

| 명령어 | 설명 |
|--------|------|
| `gleam run -m glendix/install` | 의존성 설치 (Gleam + npm) + 바인딩 코드 생성 |
| `gleam run -m glendix/build` | 프로덕션 빌드 (.mpk 생성) |
| `gleam run -m glendix/dev` | 개발 서버 (HMR, port 3000) |
| `gleam run -m glendix/start` | Mendix 테스트 프로젝트 연동 |
| `gleam run -m glendix/lint` | ESLint 실행 |
| `gleam run -m glendix/lint_fix` | ESLint 자동 수정 |
| `gleam run -m glendix/release` | 릴리즈 빌드 |
| `gleam run -m glendix/marketplace` | Mendix Marketplace 위젯 검색/다운로드 |
| `gleam build --target javascript` | Gleam → JS 컴파일만 |
| `gleam test` | Gleam 테스트 실행 |
| `gleam format` | Gleam 코드 포맷팅 |

## 외부 React 컴포넌트 사용

npm 패키지로 제공되는 React 컴포넌트 라이브러리를 `.mjs` FFI 파일 작성 없이 순수 Gleam에서 사용할 수 있다.

### 1단계: npm 패키지 설치

```bash
npm install recharts
```

### 2단계: `bindings.json` 작성

프로젝트 루트에 `bindings.json`을 생성하고, 사용할 컴포넌트를 등록한다:

```json
{
  "recharts": {
    "components": ["PieChart", "Pie", "Cell", "Tooltip", "ResponsiveContainer"]
  }
}
```

### 3단계: 바인딩 생성

```bash
gleam run -m glendix/install
```

`binding_ffi.mjs`가 자동 생성된다. 이후 `gleam run -m glendix/build` 등 빌드 시에도 자동 갱신된다.

### 4단계: Gleam에서 사용

```gleam
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
```

`html.div`와 동일한 호출 패턴으로 외부 React 컴포넌트를 사용할 수 있다.

## Mendix Marketplace 위젯 다운로드

Mendix Marketplace에서 위젯(.mpk)을 인터랙티브하게 검색하고 다운로드할 수 있다. 다운로드 완료 후 바인딩 `.gleam` 파일이 자동 생성되어 바로 사용 가능하다.

### 사전 준비

`.env` 파일에 Mendix Personal Access Token을 설정한다:

```
MENDIX_PAT=your_personal_access_token
```

> PAT는 [Mendix Developer Settings](https://user-settings.mendix.com/link/developersettings)에서 **Personal Access Tokens** 섹션의 **New Token**을 클릭하여 발급. 필요한 scope: `mx:marketplace-content:read`

### 실행

```bash
gleam run -m glendix/marketplace
```

인터랙티브 TUI에서 위젯을 검색/선택하면 `widgets/` 디렉토리에 `.mpk`가 다운로드되고, `src/widgets/`에 바인딩 `.gleam` 파일이 자동 생성된다.

## .mpk 위젯 컴포넌트 사용

`widgets/` 디렉토리에 `.mpk` 파일(Mendix 위젯 빌드 결과물)을 배치하면, 다른 위젯 안에서 기존 Mendix 위젯을 React 컴포넌트로 렌더링할 수 있다.

### 1단계: `.mpk` 파일 배치

```
프로젝트 루트/
├── widgets/
│   ├── Switch.mpk
│   └── Badge.mpk
├── src/
└── gleam.toml
```

### 2단계: 바인딩 생성

```bash
gleam run -m glendix/install
```

실행 시 다음이 자동 처리된다:
- `.mpk`에서 `.mjs`/`.css`를 추출하고 `widget_ffi.mjs`가 생성된다
- `.mpk` XML의 `<property>` 정의를 파싱하여 `src/widgets/`에 바인딩 `.gleam` 파일이 자동 생성된다 (이미 존재하면 건너뜀)

### 3단계: 자동 생성된 `src/widgets/*.gleam` 파일 확인

```gleam
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
```

required/optional 속성이 자동 구분되며, 필요에 따라 생성된 파일을 자유롭게 수정할 수 있다.

### 4단계: 위젯에서 사용

```gleam
import widgets/switch

// 컴포넌트 내부에서
switch.render(props)
```

위젯 이름은 `.mpk` 내부 XML의 `<name>` 값을, property key는 `.mpk` XML의 원본 key를 그대로 사용한다.

## 기술 스택

- **Gleam** — 위젯 로직, UI (JavaScript 타겟 컴파일)
- **[glendix](https://hexdocs.pm/glendix/)** — React + Mendix API Gleam 바인딩 (Hex 패키지)
- **React 19** — Mendix Pluggable Widget 런타임
- **Rollup** — `@mendix/pluggable-widgets-tools` 기반 번들링

## 제약사항

- Gleam → JS → Mendix Widget 파이프라인은 공식 지원되지 않는 조합이므로 빌드 설정 커스터마이징이 필요할 수 있다
- JSX 파일을 사용하지 않는다 — 모든 React 로직은 Gleam + glendix로 구현
- Redraw 등 외부 Gleam React 라이브러리는 사용하지 않는다
- 위젯 프로젝트에 FFI 파일을 직접 작성하지 않는다 — React/Mendix FFI는 glendix가 제공

## 라이선스

Apache License 2.0 — [LICENSE](./LICENSE) 참조
