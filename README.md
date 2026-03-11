# MendixWidgetGleam

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
gleam.toml                            # glendix >= 1.2.0 의존성 포함
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
import glendix/react/html
import glendix/react/prop

pub fn widget(props: JsProps) -> ReactElement {
  let sample_text = mendix.get_string_prop(props, "sampleText")
  html.div(prop.new() |> prop.class("widget-hello-world"), [
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
| `gleam build --target javascript` | Gleam → JS 컴파일만 |
| `gleam test` | Gleam 테스트 실행 |
| `gleam format` | Gleam 코드 포맷팅 |

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
