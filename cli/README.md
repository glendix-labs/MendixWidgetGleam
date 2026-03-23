# create-mendix-widget-gleam

Gleam 언어로 Mendix Pluggable Widget 프로젝트를 스케폴딩하는 CLI 도구.

JSX 없이, **Gleam + [glendix](https://hexdocs.pm/glendix/)/[mendraw](https://hexdocs.pm/mendraw/)**로 React 컴포넌트를 작성하여 Mendix Studio Pro에서 동작하는 위젯을 만든다.

## 사용법

```bash
npx create-mendix-widget-gleam my-widget
```

대화형 프롬프트를 통해 프로젝트명과 패키지 매니저를 선택하면, 즉시 개발 가능한 위젯 프로젝트가 생성된다.

## 사전 요구사항

- [Gleam](https://gleam.run/getting-started/installing/) (최신 버전)
- [Node.js](https://nodejs.org/) (v18+)

## 생성되는 프로젝트 구조

```
my-widget/
  src/
    my_widget.gleam            # 메인 위젯 모듈
    editor_config.gleam        # Studio Pro 속성 패널
    editor_preview.gleam       # Studio Pro 디자인 뷰 미리보기
    components/
      hello_world.gleam      # Hello World 공유 컴포넌트
  widgets/                       # .mpk 위젯 파일 (mendraw/widget로 바인딩)
  package.json                   # npm 의존성 (React, 외부 라이브러리 등)
  gleam.toml                   # Gleam 프로젝트 설정 (glendix >= 4.0.2 + mendraw >= 1.1.10 의존성 포함)
  CLAUDE.md                    # AI 어시스턴트용 프로젝트 컨텍스트
```

React/Mendix FFI 및 JS Interop 바인딩은 프로젝트에 포함되지 않으며, [glendix](https://hexdocs.pm/glendix/) 및 [mendraw](https://hexdocs.pm/mendraw/) Hex 패키지로 제공된다.

## 생성 후 시작하기

```bash
cd my-widget
gleam run -m glendix/install   # 의존성 설치
gleam run -m glendix/dev       # 개발 서버 시작
gleam run -m glendix/build     # 프로덕션 빌드 (.mpk 생성)
gleam run -m mendraw/marketplace  # Marketplace 위젯 검색/다운로드
gleam run -m glendix/define      # 위젯 프로퍼티 정의 TUI 에디터
```

## glendix — React + Mendix 바인딩

생성된 프로젝트는 [glendix](https://hexdocs.pm/glendix/) Hex 패키지를 의존성으로 사용한다. glendix가 React 원시 함수와 Mendix Pluggable Widget API 전체에 대한 타입 안전한 Gleam 바인딩을 제공한다:

- **React** — `redraw`, `redraw/dom/attribute`, `redraw/hooks`, `redraw/dom/events`, `redraw/dom/html`, `redraw/dom/svg`; bindings via `glendix/binding`
- **Mendix** (mendraw) — `mendraw/mendix`, `mendraw/mendix/editable_value`, `mendraw/mendix/action`, `mendraw/mendix/list_value`, `mendraw/mendix/selection`, `mendraw/mendix/reference`, `mendraw/mendix/reference_set`, `mendraw/mendix/date`, `mendraw/mendix/decimal`, `mendraw/mendix/filter`, `mendraw/widget` 등
- **JS Interop** (glendix) — `glendix/js/array`, `glendix/js/object`, `glendix/js/json`, `glendix/js/promise`, `glendix/js/dom`, `glendix/js/timer`

## 라이선스

Apache-2.0
