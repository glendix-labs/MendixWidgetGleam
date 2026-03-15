# MendixWidgetGleam

Gleam으로 Mendix Pluggable Widget을 개발하는 프로젝트. JSX 없이 Gleam + [glendix](https://hexdocs.pm/glendix/) 바인딩만으로 위젯을 구현한다.

## Commands

```bash
gleam run -m glendix/install      # 의존성 설치 (Gleam deps + npm + bindings.json 코드 생성)
gleam run -m glendix/build        # 프로덕션 빌드 (.mpk 생성)
gleam run -m glendix/dev          # 개발 서버 (HMR, port 3000)
gleam run -m glendix/start        # Mendix 테스트 프로젝트 연동
gleam run -m glendix/release      # 릴리즈 빌드
gleam run -m glendix/lint         # ESLint 실행
gleam run -m glendix/lint_fix     # ESLint 자동 수정
gleam run -m glendix/marketplace  # Marketplace 위젯 검색/다운로드
gleam test                        # 테스트 실행
gleam format                      # 코드 포맷팅
```

bindings.json에 외부 React 패키지를 추가한 경우, `glendix/install` 전에 해당 npm 패키지를 수동 설치해야 한다.

## Hard Rules

IMPORTANT: 이 규칙을 어기면 빌드가 깨지거나 아키텍처가 훼손된다.

- **JSX/JS 파일을 직접 작성하지 않는다.** 모든 위젯 로직과 UI는 Gleam으로 작성한다
- **FFI 파일(.mjs)을 위젯 프로젝트에 작성하지 않는다.** React/Mendix FFI는 glendix 패키지가 제공한다
- **브릿지 JS 파일(src/*.js)을 수동 관리하지 않는다.** glendix가 빌드 시 자동 생성/삭제한다
- **Redraw 등 외부 Gleam React 라이브러리를 사용하지 않는다.** React 바인딩은 glendix만 사용한다
- Gleam 컴파일 출력 경로(`build/dev/javascript/{gleam.toml name}/`)와 Rollup 입력 경로가 반드시 일치해야 한다
- Mendix 위젯 이름은 영문자(a-zA-Z)만 허용된다

## Code Style

- `gleam format`으로 포맷팅
- 한국어 주석 사용
- 컴파일 출력 JS(`build/`)를 수동 편집하지 않는다

## Architecture

위젯 진입점 시그니처: `pub fn widget(props: JsProps) -> ReactElement` — React 함수형 컴포넌트와 동일.

- `src/mendix_widget_gleam.gleam` — 위젯 메인 (Mendix 런타임에서 호출)
- `src/editor_config.gleam` — Studio Pro 속성 패널 설정
- `src/editor_preview.gleam` — Studio Pro 디자인 뷰 미리보기
- `src/components/` — 공유 컴포넌트
- `src/MendixWidget.xml` — 위젯 속성 정의. `<property>` 추가 시 빌드 도구가 타입 자동 생성
- `src/package.xml` — Mendix 패키지 매니페스트
- `bindings.json` — 외부 React 컴포넌트 바인딩 설정
- `widgets/` — .mpk 위젯 파일 바인딩 (`glendix/widget`으로 사용)
- `cli/` — 스캐폴딩 CLI (`create-mendix-widget-gleam`). 템플릿 플레이스홀더: `{{PASCAL_CASE}}`, `{{SNAKE_CASE}}`, `__WidgetName__`, `__widget_name__`

## Build Pipeline

```
src/*.gleam → gleam build → build/dev/javascript/**/*.mjs → 브릿지 JS(자동 생성) → Rollup → dist/**/*.mpk
```

## Mendix Widget Conventions

- 위젯 ID: `mendix.mendixwidget.MendixWidget`
- `package.json`의 `packagePath: "mendix"`가 배포 경로를 결정
- `needsEntityContext="true"` → Mendix 데이터 컨텍스트 필요
- `offlineCapable="true"` → 오프라인 지원
- `.mpk` 출력: `dist/` 디렉토리
- 테스트 프로젝트: `./tests/testProject`

## Key Concepts

- Mendix props(`JsProps`)는 `mendix.get_prop`/`mendix.get_string_prop` 등으로 접근
- Mendix 복합 타입(`EditableValue`, `ActionValue`, `ListValue`)은 opaque type + FFI 접근자
- JS `undefined` ↔ Gleam `Option` 변환은 FFI 경계에서 자동 처리
- HTML 속성은 Attribute 리스트 API: `[attribute.class("x"), event.on_click(handler)]`
- Gleam 튜플 `#(a, b)` = JS `[a, b]` — `useState` 반환값과 직접 호환

## Reference Docs

glendix API와 Gleam 문법 상세는 아래 문서 참조:

- docs/glendix_guide.md — React/Mendix 바인딩 전체 가이드 (엘리먼트, Hooks, 이벤트, Mendix 타입, 실전 패턴, 트러블슈팅)
- docs/gleam_language_tour.md — Gleam 문법 레퍼런스 (타입, 패턴 매칭, FFI, use 키워드 등)

## Mendix Documentation Sources

docs.mendix.com은 접근 불가. GitHub raw 소스를 사용:

- Pluggable Widgets API: `https://github.com/mendix/docs/blob/development/content/en/docs/apidocs-mxsdk/apidocs/pluggable-widgets/`
- 빌드 도구 소스: `https://github.com/mendix/widgets-tools`
- 공식 위젯 예제: `https://github.com/mendix/web-widgets`
