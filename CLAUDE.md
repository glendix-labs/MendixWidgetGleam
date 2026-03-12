# MendixWidgetGleam

Gleam 언어로 Mendix Pluggable Widget을 개발하는 프로젝트.

## Goal

**JSX를 사용하지 않고, 오직 Gleam으로만** 위젯을 작성한다. Gleam 코드를 JavaScript로 컴파일하고, 컴파일된 JS가 곧 Mendix Pluggable Widget의 진입점이 된다.

## Tech Stack

- **Gleam** → JavaScript 컴파일 (target: javascript)
- **[glendix](https://hexdocs.pm/glendix/)** — React + Mendix Pluggable Widget API의 Gleam FFI 바인딩 (Hex 패키지). React 원시 함수와 Mendix 런타임 타입 접근자를 타입 안전하게 제공
- **Mendix Pluggable Widget** (React 19)
- **Package Manager**: Gleam (기본 npm 의존성은 `gleam run -m glendix/install`로 설치, `bindings.json` 외부 React 패키지는 수동 설치 필요)
- **Build**: `@mendix/pluggable-widgets-tools` (Rollup 기반)
- **Package**: `.mpk` (ZIP 아카이브) → Mendix Studio Pro에 배포

## Architecture

```
src/
  mendix_widget_gleam.gleam           # 위젯 메인 모듈
  editor_config.gleam                 # Studio Pro 속성 패널 설정
  editor_preview.gleam                # Studio Pro 디자인 뷰 미리보기
  components/
    hello_world.gleam               # Hello World 공유 컴포넌트
  MendixWidget.xml                    # 위젯 속성 정의 (Mendix Studio Pro용)
  package.xml                         # Mendix 패키지 매니페스트
  ui/
    MendixWidget.css                  # 위젯 스타일시트
widgets/                                # .mpk 위젯 파일 (glendix/widget로 바인딩)
cli/                                  # CLI 스캐폴딩 도구 (create-mendix-widget-gleam)
  template/                           #   프로젝트 템플릿
gleam.toml                            # Gleam 프로젝트 설정
docs/
  gleam_language_tour.md              # Gleam 언어 레퍼런스 (문법 전체)
  glendix_guide.md                    # glendix 사용 가이드 (React/Mendix 바인딩 전체)
```

## glendix — React + Mendix 바인딩 패키지

React FFI와 Mendix API 바인딩은 별도 Hex 패키지 [glendix](https://hexdocs.pm/glendix/)로 분리되어 있다. 이 프로젝트는 glendix를 의존성으로 사용한다.

```toml
# gleam.toml
[dependencies]
glendix = ">= 2.0.3 and < 3.0.0"
```

glendix가 제공하는 모듈:

React:
- `glendix/react` — 핵심 타입(`ReactElement`, `JsProps`, `Component`, `Context`, `Ref`) + `element`/`element_`/`void_element`/`component_el`/`component_el_`/`void_component_el`/`fragment`/`text`/`none` + 조건부 렌더링(`when`, `when_some`) + `define_component`/`memo`/`StrictMode`/`Suspense`/`Profiler`/`portal`/`forwardRef`
- `glendix/react/attribute` — Attribute 리스트 API (`[attribute.class("x"), event.on_click(handler)]`) + 90+ HTML 속성 함수 + `attribute.none()` 조건부 속성
- `glendix/react/hook` — React Hooks (`useState`, `useEffect`, `useLayoutEffect`, `useInsertionEffect`, `useMemo`, `useCallback`, `useRef`, `useReducer`, `useContext`, `useId`, `useTransition`, `useDeferredValue`, `useOptimistic`, `useImperativeHandle`, `useLazyState`, `useSyncExternalStore`, `useDebugValue`)
- `glendix/react/event` — 15개 이벤트 타입 + 148+ 핸들러 Attribute (캡처 단계 포함) + 67+ 접근자
- `glendix/react/html` — 75+ HTML 태그 편의 함수 (순수 Gleam, FFI 없음)
- `glendix/react/svg` — 57 SVG 요소 편의 함수 (순수 Gleam, FFI 없음)
- `glendix/react/svg_attribute` — 97+ SVG 전용 속성 함수 (순수 Gleam, FFI 없음)
- `glendix/binding` — 외부 React 컴포넌트 바인딩 (`bindings.json` + `binding.module`/`binding.resolve`)
- `glendix/widget` — .mpk 위젯 컴포넌트 바인딩 (`widget.component`)

Mendix:
- `glendix/mendix` — `ValueStatus`, `ObjectItem`, JsProps 접근자
- `glendix/mendix/editable_value` — 편집 가능한 값
- `glendix/mendix/action` — 액션 실행
- `glendix/mendix/dynamic_value` — 동적 읽기 전용 값
- `glendix/mendix/list_value` — 리스트 데이터 + 정렬/필터
- `glendix/mendix/list_attribute` — 리스트 아이템별 접근
- `glendix/mendix/selection` — 단일/다중 선택
- `glendix/mendix/reference` — 단일 연관 참조 (ReferenceValue)
- `glendix/mendix/reference_set` — 다중 연관 참조 (ReferenceSetValue)
- `glendix/mendix/date` — JS Date 래퍼 (월 1-based)
- `glendix/mendix/big` — Big.js 고정밀 십진수 래퍼
- `glendix/mendix/file` — 파일/이미지
- `glendix/mendix/icon` — 아이콘
- `glendix/mendix/formatter` — 값 포맷팅/파싱
- `glendix/mendix/filter` — 필터 조건 빌더

빌드 스크립트:
- `glendix/cmd` — 셸 명령어 실행 + 패키지 매니저 자동 감지 (`exec`, `detect_runner`, `run_tool`)
- `glendix/build` — 프로덕션 빌드 (`gleam run -m glendix/build`)
- `glendix/dev` — 개발 서버 (`gleam run -m glendix/dev`)
- `glendix/start` — Mendix 연동 (`gleam run -m glendix/start`)
- `glendix/install` — 의존성 설치 (`gleam run -m glendix/install`)
- `glendix/release` — 릴리즈 빌드 (`gleam run -m glendix/release`)
- `glendix/lint` — ESLint 실행 (`gleam run -m glendix/lint`)
- `glendix/lint_fix` — ESLint 자동 수정 (`gleam run -m glendix/lint_fix`)

## Integration Strategy: Gleam + glendix → Mendix Widget

JSX 파일 없이 Gleam + glendix로 위젯을 구현한다. glendix가 React 원시 함수와 Mendix 런타임 타입 접근을 타입 안전하게 제공하므로, 위젯 프로젝트에서는 비즈니스 로직에만 집중한다.

핵심 원리:
- Gleam 함수 `fn(JsProps) -> ReactElement`는 React 함수형 컴포넌트와 동일한 시그니처
- glendix의 FFI 레이어(`react_ffi.mjs`, `mendix_ffi.mjs`)는 얇은 어댑터일 뿐, 위젯 로직과 UI 구조는 전부 Gleam 코드
- Mendix가 전달하는 props(순수 JS 객체)를 `mendix.get_prop`/`mendix.get_string_prop` 등으로 접근
- Mendix 복합 타입(`EditableValue`, `ActionValue`, `ListValue` 등)은 opaque type + FFI 접근자로 타입 안전하게 다룸
- JS `undefined` ↔ Gleam `Option` 변환은 FFI 경계에서 자동 처리
- HTML 속성은 Attribute 리스트 기반 선언적 API로 구성 (`[attribute.class("x"), event.on_click(handler)]`)
- Gleam List는 linked list이므로 FFI에서 `.toArray()` 호출 후 React.createElement에 spread
- Gleam 튜플 `#(a, b)` = JS `[a, b]` — useState 반환값과 직접 호환

핵심 제약사항:
- Mendix 위젯의 진입점은 MUST React 컴포넌트여야 한다 (`pluginWidget="true"`)
- Gleam 컴파일 출력은 ES 모듈 형식이므로 Rollup 번들링과 호환된다
- 위젯 ID 형식: `mendix.mendixwidget.MendixWidget`
- JSX 파일을 작성하지 않는다. 모든 React 로직은 Gleam + glendix로 구현한다
- Gleam 컴파일 출력이 Mendix 빌드 도구의 진입점으로 연결되도록 빌드 설정 커스터마이징이 필요하다

## Build Pipeline

```
[src/*.gleam] + [glendix 패키지 (Hex)]
    ↓  gleam run -m glendix/build (내부적으로 gleam build 자동 수행)
[build/dev/javascript/mendix_widget_gleam/*.mjs]  (gleam.toml name 기준)
[build/dev/javascript/glendix/glendix/*.mjs]       (glendix 컴파일 출력)
[build/dev/javascript/glendix/glendix/react_ffi.mjs]
[build/dev/javascript/glendix/glendix/mendix_ffi.mjs]
    ↓  브릿지 JS (자동 생성)가 import
    ↓  Rollup (pluggable-widgets-tools build:web)
[dist/1.0.0/mendix.mendixwidget.MendixWidget.mpk]
```

## Commands

모든 명령어는 `gleam`으로 통일. `gleam run -m`은 Gleam 컴파일을 자동 수행한 뒤 스크립트를 실행한다.

```bash
gleam run -m glendix/install   # 의존성 설치 (Gleam deps 자동 + PM 자동 감지, bindings.json 바인딩 코드 생성. 단, 외부 React 패키지는 사전에 수동 설치 필요)
gleam run -m glendix/build     # 위젯 프로덕션 빌드 (.mpk 생성)
gleam run -m glendix/dev       # 개발 서버 (HMR, port 3000)
gleam run -m glendix/start     # Mendix 테스트 프로젝트와 연동 개발
gleam run -m glendix/lint      # ESLint 실행
gleam run -m glendix/lint_fix  # ESLint 자동 수정
gleam run -m glendix/release   # 릴리즈 빌드
gleam build --target javascript  # Gleam → JS 컴파일만 (스크립트 없이)
gleam test                       # Gleam 테스트 실행
gleam format                     # Gleam 코드 포맷팅
```

## glendix Guide

`docs/glendix_guide.md` 파일에 glendix 패키지의 사용법이 수록되어 있다. 주요 내용:
- 프로젝트 설정 및 첫 번째 위젯 만들기
- 핵심 개념: opaque 타입, undefined ↔ Option 변환, Attribute 리스트 API
- React 바인딩: 엘리먼트 생성(`element`/`element_`/`void_element`/`component_el`), Attribute 리스트, HTML 태그 함수, Hooks(`useState`/`useEffect`/`useMemo`/`useCallback`/`useRef` 등), 이벤트 처리, 조건부/리스트 렌더링, 스타일, 외부 React 컴포넌트 바인딩(`bindings.json`), .mpk 위젯 바인딩(`widgets/`)
- Mendix 바인딩: Props 접근, ValueStatus, EditableValue, ActionValue, DynamicValue, ListValue(페이지네이션/정렬), ListAttribute, Selection, Reference, Filter 빌더, JsDate, Big, FileValue/WebIcon/ValueFormatter
- 실전 패턴: 폼 입력 위젯, 데이터 테이블, 검색 가능 리스트, 컴포넌트 합성
- 트러블슈팅: 빌드/런타임 에러, Hook 규칙

## Gleam Language Reference

`docs/gleam_language_tour.md` 파일에 Gleam 문법 전체가 수록되어 있다. 주요 특징:
- 정적 타입, 불변 데이터, 패턴 매칭
- `pub fn` 으로 외부 공개 함수 선언
- `import gleam/모듈` 로 표준 라이브러리 사용
- JavaScript 타겟 시 `@external(javascript, "모듈", "함수")` 로 JS 함수 호출 가능
- Result 타입(`Ok`, `Error`)으로 에러 처리
- `use` 키워드로 콜백 체이닝 간소화

## Mendix Widget Conventions

- `src/MendixWidget.xml`: 위젯 속성 정의. `<property>` 추가 시 빌드 도구가 자동으로 타입 생성
- `src/package.xml`: 패키지 매니페스트. `widgetFile` 경로와 컴파일 출력 경로 지정
- 위젯 컴포넌트는 `default export` 또는 `named export` 함수형 React 컴포넌트
- `needsEntityContext="true"` → 위젯이 Mendix 데이터 컨텍스트 필요
- `offlineCapable="true"` → 오프라인 지원
- editorConfig도 Gleam으로 작성. 브릿지 JS는 glendix가 빌드 시 자동 생성/삭제한다

## Mendix Documentation

Mendix 공식 문서 사이트(docs.mendix.com)는 접근 불가. 대신 GitHub raw 소스를 사용:
- Base: `https://github.com/mendix/docs/blob/development/content/en/docs`
- Pluggable Widgets API: `apidocs-mxsdk/apidocs/pluggable-widgets/`
- How-to: `howto/extensibility/`
- Widget 빌드 도구 소스: `https://github.com/mendix/widgets-tools`
- 공식 위젯 예제: `https://github.com/mendix/web-widgets`

## Important Notes

- Gleam 컴파일 출력 경로와 Rollup 번들링 입력 경로가 MUST 일치해야 한다
- `package.json`의 `packagePath: "mendix"`가 위젯 배포 경로를 결정한다
- Mendix 위젯 이름은 영문자(a-zA-Z)만 허용된다
- `.mpk` 파일은 `dist/` 디렉토리에 생성된다
- 테스트 프로젝트 경로: `./tests/testProject`
- Gleam→JS→Mendix Widget 파이프라인은 공식 지원되지 않는 조합이므로, 빌드 설정 커스터마이징이 필요할 수 있다
- **JSX/JS 파일을 직접 작성하지 않는다.** 모든 위젯 로직과 UI는 Gleam으로 작성하고 JS로 컴파일한다
- Mendix 빌드 도구가 요구하는 브릿지 JS 파일(진입점, editorConfig, editorPreview)은 glendix가 빌드 시 자동 생성/삭제한다. 수동 관리 불필요
- Redraw 등 외부 Gleam React 라이브러리는 사용하지 않는다. glendix가 Gleam FFI로 React API를 직접 바인딩한다
- React/Mendix FFI 바인딩은 glendix 패키지에서 제공한다. 위젯 프로젝트에 FFI 파일을 직접 작성하지 않는다

## CLI — create-mendix-widget-gleam

`cli/` 디렉토리에 프로젝트 스캐폴딩 CLI 도구가 있다. 새 위젯 프로젝트를 생성할 때 사용한다.
- 템플릿은 `cli/template/`에 위치
- 템플릿은 glendix Hex 패키지를 의존성으로 사용
- 플레이스홀더 치환: `{{PASCAL_CASE}}`, `{{SNAKE_CASE}}`, `__WidgetName__`, `__widget_name__`
- 빌드 스크립트는 glendix 패키지에 포함되어 있으므로 템플릿에서 제외됨

## Code Style

- Gleam 파일: `gleam format` 사용
- Gleam 컴파일 출력 JS: 수동 편집하지 않는다
- 한국어 주석 사용
