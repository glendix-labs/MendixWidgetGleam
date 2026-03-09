# MendixWidgetGleam

**Gleam 언어로 Mendix Pluggable Widget을 개발하는 프로젝트.**

JSX를 사용하지 않고, Gleam 코드만으로 React 컴포넌트를 작성하여 Mendix Studio Pro에서 동작하는 위젯을 만든다. Gleam을 JavaScript로 컴파일하고, Gleam FFI로 React API를 직접 바인딩하는 방식이다.

## 왜 Gleam인가?

- **정적 타입 안전성** — Gleam의 강력한 타입 시스템으로 런타임 에러를 컴파일 타임에 방지
- **불변 데이터** — 예측 가능한 상태 관리
- **JavaScript 타겟 지원** — `gleam build --target javascript`로 ES 모듈 출력
- **범용 FFI 계층** — `react_ffi.mjs`에 React 원시 함수, `mendix_ffi.mjs`에 Mendix 런타임 타입 접근자를 분리하고, Gleam 모듈 계층에서 타입 안전한 API 제공
- **Mendix API 완전 바인딩** — `EditableValue`, `ActionValue`, `ListValue` 등 모든 Mendix Pluggable Widget API를 Gleam opaque type + FFI 접근자로 지원. 별도의 FFI 수정 없이 바로 사용 가능

## 아키텍처

```
src/
  widget/                             # Gleam 소스 코드
    mendix_widget_gleam.gleam         #   위젯 메인 모듈 (컴포넌트 로직)
    react_ffi.mjs                     #   React FFI 어댑터 (React 원시 함수)
    mendix_ffi.mjs                    #   Mendix FFI 어댑터 (Mendix 런타임 타입 접근)
    react.gleam                       #   핵심 타입 + createElement + fragment/text/none
    react/
      prop.gleam                      #   Props 빌더 (파이프라인 API)
      hook.gleam                      #   React Hooks (useState, useEffect 등)
      event.gleam                     #   이벤트 타입 + 값 추출
      html.gleam                      #   HTML 태그 편의 함수 (순수 Gleam)
    mendix.gleam                      #   Mendix 핵심 타입 + Props 접근자
    mendix/
      editable_value.gleam            #   EditableValue (편집 가능한 값)
      action.gleam                    #   ActionValue (액션 실행)
      dynamic_value.gleam             #   DynamicValue (동적 값)
      list_value.gleam                #   ListValue + FilterCondition + SortInstruction
      list_attribute.gleam            #   ListAttributeValue 등 리스트 연결 타입
      selection.gleam                 #   단일/다중 선택
      reference.gleam                 #   ReferenceValue, ReferenceSetValue
      date.gleam                      #   JsDate (JS Date 래퍼)
      big.gleam                       #   Big (Big.js 고정밀 십진수 래퍼)
      file.gleam                      #   FileValue, WebImage
      icon.gleam                      #   WebIcon (Glyph, Image, IconFont)
      formatter.gleam                 #   ValueFormatter (format, parse)
      filter.gleam                    #   Filter 조건 빌더
    editor_config.gleam               #   Studio Pro 속성 패널 설정
  scripts/                            # 빌드/개발 스크립트 (gleam run -m으로 실행)
    cmd.gleam + cmd_ffi.mjs           #   셸 명령어 실행 유틸리티
    install.gleam                     #   npm 의존성 설치
    build.gleam                       #   프로덕션 빌드
    dev.gleam / start.gleam           #   개발 서버 / Mendix 연동
    release.gleam                     #   릴리즈 빌드
    lint.gleam / lint_fix.gleam       #   ESLint
  MendixWidgetGleam.js                # 브릿지 (Gleam 출력 → Mendix 진입점)
  MendixWidgetGleam.editorConfig.js   # 브릿지 (editorConfig)
  MendixWidgetGleam.xml               # 위젯 속성 정의
  package.xml                         # Mendix 패키지 매니페스트
```

### 빌드 파이프라인

```
Gleam 소스 (.gleam) + FFI 어댑터 (react_ffi.mjs, mendix_ffi.mjs)
    ↓  gleam run -m scripts/build (Gleam 컴파일 자동 수행)
ES 모듈 (.mjs) — build/dev/javascript/...
    ↓  브릿지 JS가 import
    ↓  Rollup (pluggable-widgets-tools)
.mpk 위젯 패키지 — dist/
```

### 핵심 원리

Gleam 함수 `fn(JsProps) -> ReactElement`는 React 함수형 컴포넌트와 동일한 시그니처다. `react_ffi.mjs`는 React 원시 함수를, `mendix_ffi.mjs`는 Mendix 런타임 타입 접근자를 노출하는 얇은 래퍼이고, Gleam 모듈 계층이 타입 안전한 API를 제공한다.

```gleam
// src/widget/mendix_widget_gleam.gleam
import widget/mendix
import widget/react.{type JsProps, type ReactElement}
import widget/react/html
import widget/react/prop

pub fn widget(props: JsProps) -> ReactElement {
  let sample_text = mendix.get_string_prop(props, "sampleText")
  html.div(prop.new() |> prop.class("widget-hello-world"), [
    react.text("Hello " <> sample_text),
  ])
}
```

Mendix 복합 타입도 Gleam에서 타입 안전하게 사용할 수 있다:

```gleam
import widget/mendix
import widget/mendix/editable_value
import widget/mendix/action

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
gleam run -m scripts/install   # Gleam 의존성 자동 다운로드 + npm 의존성 설치
```

### 빌드

```bash
gleam run -m scripts/build     # Gleam 컴파일 + 위젯 빌드 (.mpk 생성)
```

빌드 결과물은 `dist/` 디렉토리에 `.mpk` 파일로 생성된다.

### 개발

```bash
gleam run -m scripts/dev       # Gleam 컴파일 + 개발 서버 (HMR, port 3000)
gleam run -m scripts/start     # Mendix 테스트 프로젝트와 연동 개발
```

## 명령어 모음

모든 명령어는 `gleam`으로 통일. `gleam run -m`은 Gleam 컴파일을 자동 수행한 뒤 스크립트를 실행한다.

| 명령어 | 설명 |
|--------|------|
| `gleam run -m scripts/install` | 의존성 설치 (Gleam + npm) |
| `gleam run -m scripts/build` | 프로덕션 빌드 (.mpk 생성) |
| `gleam run -m scripts/dev` | 개발 서버 (HMR, port 3000) |
| `gleam run -m scripts/start` | Mendix 테스트 프로젝트 연동 |
| `gleam run -m scripts/lint` | ESLint 실행 |
| `gleam run -m scripts/lint_fix` | ESLint 자동 수정 |
| `gleam run -m scripts/release` | 릴리즈 빌드 |
| `gleam build --target javascript` | Gleam → JS 컴파일만 |
| `gleam test` | Gleam 테스트 실행 |
| `gleam format` | Gleam 코드 포맷팅 |

## 기술 스택

- **Gleam** — 위젯 로직, UI, 빌드 스크립트 (JavaScript 타겟 컴파일)
- **Gleam FFI** — React/Mendix API 바인딩 (`@external` + `react_ffi.mjs` + `mendix_ffi.mjs`)
- **React 19** — Mendix Pluggable Widget 런타임
- **Rollup** — `@mendix/pluggable-widgets-tools` 기반 번들링

## 제약사항

- Gleam → JS → Mendix Widget 파이프라인은 공식 지원되지 않는 조합이므로 빌드 설정 커스터마이징이 필요할 수 있다
- JSX 파일을 사용하지 않는다 — 모든 React 로직은 Gleam + FFI로 구현
- Redraw 등 외부 Gleam React 라이브러리는 사용하지 않는다
- FFI 파일에는 API 노출만 작성하고, 비즈니스 로직은 반드시 Gleam으로 작성

## 라이선스

Apache License 2.0 — [LICENSE](./LICENSE) 참조
