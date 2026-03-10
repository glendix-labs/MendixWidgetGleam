# create-mendix-widget-gleam

Gleam 언어로 Mendix Pluggable Widget 프로젝트를 스케폴딩하는 CLI 도구.

JSX 없이, **Gleam + [glendix](https://hexdocs.pm/glendix/)**로 React 컴포넌트를 작성하여 Mendix Studio Pro에서 동작하는 위젯을 만든다.

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
    widget/                    # Gleam 위젯 코드
      my_widget.gleam          #   메인 위젯 모듈
      editor_config.gleam      #   Studio Pro 속성 패널
    scripts/                   #   빌드/개발 스크립트
  gleam.toml                   # Gleam 프로젝트 설정 (glendix >= 1.0.0 의존성 포함)
  CLAUDE.md                    # AI 어시스턴트용 프로젝트 컨텍스트
```

React/Mendix FFI 바인딩은 프로젝트에 포함되지 않으며, [glendix](https://hexdocs.pm/glendix/) Hex 패키지로 제공된다.

## 생성 후 시작하기

```bash
cd my-widget
gleam run -m scripts/install   # 의존성 설치
gleam run -m scripts/dev       # 개발 서버 시작
gleam run -m scripts/build     # 프로덕션 빌드 (.mpk 생성)
```

## glendix — React + Mendix 바인딩

생성된 프로젝트는 [glendix](https://hexdocs.pm/glendix/) Hex 패키지를 의존성으로 사용한다. glendix가 React 원시 함수와 Mendix Pluggable Widget API 전체에 대한 타입 안전한 Gleam 바인딩을 제공한다:

- **React** — `react`, `react/prop`, `react/hook`, `react/event`, `react/html`
- **Mendix** — `mendix`, `mendix/editable_value`, `mendix/action`, `mendix/list_value`, `mendix/selection`, `mendix/reference`, `mendix/date`, `mendix/big`, `mendix/filter` 등

## 라이선스

Apache-2.0
