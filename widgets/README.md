# widgets/

Mendix 위젯 바인딩 디렉토리. `.mpk` 파일(Mendix 위젯 빌드 결과물)을 이 디렉토리에 배치하면, Gleam 코드에서 기존 Mendix 위젯을 React 컴포넌트로 렌더링할 수 있다.

## 사용법

### 1. `.mpk` 파일 배치

빌드된 Mendix 위젯의 `.mpk` 파일을 이 디렉토리에 복사한다:

```
widgets/
├── Switch.mpk
├── Badge.mpk
└── README.md
```

### 2. 바인딩 생성

```bash
gleam run -m glendix/install
```

실행 시 다음이 자동 처리된다:

- `.mpk` 내부의 `.mjs`와 `.css`가 추출되고, `widget_ffi.mjs`가 생성된다
- `.mpk` XML의 `<property>` 정의를 파싱하여 `src/widgets/`에 바인딩 `.gleam` 파일이 자동 생성된다 (이미 존재하면 건너뜀)

### 3. 자동 생성된 바인딩 확인

예를 들어 `Switch.mpk`를 배치하면 `src/widgets/switch.gleam`이 생성된다:

```gleam
// src/widgets/switch.gleam (자동 생성)
import mendraw/mendix.{type JsProps}
import mendraw/interop
import redraw.{type Element}
import redraw/dom/attribute
import mendraw/widget

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
```

- required/optional 속성이 자동 구분된다
- optional 속성이 있으면 `optional_attr` 헬퍼와 `gleam/option` import가 자동 추가된다
- Gleam 예약어(`type` 등)는 접미사 `_`로 자동 회피된다
- 생성된 파일은 필요에 따라 자유롭게 수정 가능하다

### 4. Gleam에서 사용

```gleam
import widgets/switch

// 위젯 컴포넌트 내부에서
switch.render(props)
```

## 동작 원리

- `mendraw/widget` 모듈의 `widget.component("Name")`으로 `.mpk` 위젯을 React 컴포넌트로 가져온다
- Props는 `attribute.attribute(key, value)` 범용 함수로 전달한다
- 위젯 이름은 `.mpk` 내부 XML의 `<name>` 값을, property key는 XML의 원본 key를 그대로 사용한다
- `binding` 모듈과 달리 1 mpk = 1 컴포넌트이므로 `widget.component("Name")` 한 번에 가져온다

## 주의사항

- `.mpk` 파일을 추가/제거한 후에는 반드시 `gleam run -m glendix/install`을 다시 실행해야 한다
- `widget_ffi.mjs`는 자동 생성 파일이므로 직접 수정하지 않는다
- `.mpk` 위젯용 `.mjs` FFI 파일을 직접 작성하지 않는다 — `widgets/` 디렉토리 + `mendraw/widget`을 사용한다
