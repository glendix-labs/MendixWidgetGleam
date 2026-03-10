
---

## 1. 시작하기

### 1.1 사전 요구사항

- **Gleam** (최신 버전) — [gleam.run](https://gleam.run)
- **Node.js** (v18 이상)
- **Mendix Studio Pro** (위젯 배포 시)
- Gleam의 JavaScript 타겟 빌드에 대한 기본 이해

### 1.2 프로젝트 설정

#### 1) Gleam 프로젝트 생성

```bash
gleam new my_widget --target javascript
cd my_widget
```

#### 2) glendix 의존성 추가

`gleam.toml`에 다음을 추가합니다:

```toml
[dependencies]
gleam_stdlib = ">= 0.44.0 and < 2.0.0"
glendix = { path = "../glendix" }
```

> Hex 패키지 배포 전까지는 로컬 경로로 참조합니다.

#### 3) Peer Dependencies 설치

위젯 프로젝트의 `package.json`에 다음이 필요합니다:

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "big.js": "^6.0.0"
  }
}
```

```bash
npm install
```

#### 4) 빌드 확인

```bash
gleam build
```

### 1.3 첫 번째 위젯 만들기

`src/my_widget.gleam` 파일을 생성합니다:

```gleam
import glendix/mendix
import glendix/react.{type JsProps, type ReactElement}
import glendix/react/html
import glendix/react/prop

pub fn widget(props: JsProps) -> ReactElement {
  let greeting = mendix.get_string_prop(props, "greetingText")

  html.div(prop.new() |> prop.class("my-widget"), [
    html.h1_([react.text(greeting)]),
    html.p_([react.text("glendix로 만든 첫 번째 위젯입니다!")]),
  ])
}
```

이것이 Mendix Pluggable Widget의 전부입니다 — `fn(JsProps) -> ReactElement`.

---

## 2. 핵심 개념

### 2.1 위젯 함수 시그니처

모든 Mendix Pluggable Widget은 하나의 함수입니다:

```gleam
pub fn widget(props: JsProps) -> ReactElement
```

- `JsProps`: Mendix가 위젯에 전달하는 프로퍼티 객체 (opaque 타입)
- `ReactElement`: React가 렌더링할 수 있는 요소

### 2.2 Opaque 타입

glendix의 핵심 설계 원칙은 **opaque 타입을 통한 타입 안전성**입니다.

```gleam
// 이 타입들은 내부 구현이 숨겨져 있어 잘못된 접근을 컴파일 타임에 차단합니다
ReactElement    // React 요소
JsProps         // Mendix 프로퍼티 객체
Props           // React props 객체
EditableValue   // Mendix 편집 가능한 값
ActionValue     // Mendix 액션
ListValue       // Mendix 리스트 데이터
// ... 등등
```

각 opaque 타입은 반드시 해당 모듈이 제공하는 접근자 함수를 통해서만 사용할 수 있습니다. 이를 통해 JS 런타임 에러를 Gleam 컴파일 타임 에러로 전환합니다.

### 2.3 undefined ↔ Option 자동 변환

FFI 경계에서 JavaScript의 `undefined`/`null`은 자동으로 변환됩니다:

| JavaScript | Gleam |
|---|---|
| `undefined` / `null` | `None` |
| 값 존재 | `Some(value)` |

```gleam
// Mendix props에서 값 가져오기
case mendix.get_prop(props, "myAttr") {
  Some(attr) -> // 값이 설정되어 있음
  None -> // 값이 없음 (undefined)
}
```

### 2.4 파이프라인 API

Props는 Gleam의 파이프 연산자(`|>`)를 활용한 빌더 패턴으로 구성합니다:

```gleam
let my_props =
  prop.new()
  |> prop.class("card card-primary")
  |> prop.string("id", "main-card")
  |> prop.bool("hidden", False)
  |> prop.on_click(fn(_event) { Nil })
```

이 패턴은 **가독성**과 **합성 가능성**을 모두 제공합니다.

---

## 3. React 바인딩

### 3.1 엘리먼트 생성

`glendix/react` 모듈은 React 엘리먼트를 생성하는 핵심 함수들을 제공합니다.

#### 기본 엘리먼트

```gleam
import glendix/react
import glendix/react/prop

// Props가 있는 엘리먼트
react.el("div", prop.new() |> prop.class("container"), [
  react.text("Hello"),
])

// Props 없이 간단하게
react.el_("div", [
  react.text("Hello"),
])

// Self-closing 엘리먼트 (input, img, br 등)
react.void("input", prop.new() |> prop.string("type", "text"))
```

#### 텍스트 노드

```gleam
react.text("안녕하세요")
react.text("Count: " <> int.to_string(count))
```

#### Fragment

```gleam
// 기본 Fragment
react.fragment([
  html.h1_([react.text("제목")]),
  html.p_([react.text("내용")]),
])

// 키가 있는 Fragment (리스트 렌더링에서 사용)
react.keyed_fragment("unique-key", [
  html.li_([react.text("아이템")]),
])
```

#### 아무것도 렌더링하지 않기

```gleam
react.none()  // React null 반환
```

#### 외부 React 컴포넌트 사용

```gleam
// 다른 React 컴포넌트를 합성할 때
react.component(my_component, prop.new() |> prop.string("title", "Hello"), [
  // children
])
```

### 3.2 Props 빌더

`glendix/react/prop` 모듈은 타입별 props 설정 함수를 제공합니다.

#### 기본 타입 설정

```gleam
import glendix/react/prop

let props =
  prop.new()
  |> prop.string("placeholder", "입력하세요")   // String
  |> prop.int("tabIndex", 0)                     // Int
  |> prop.float("opacity", 0.5)                  // Float
  |> prop.bool("disabled", True)                 // Bool
  |> prop.any("data", some_value)                // 임의 타입
```

#### 자주 쓰는 속성

```gleam
let props =
  prop.new()
  |> prop.class("btn btn-primary")        // className 설정
  |> prop.classes(["btn", "btn-large"])    // 여러 클래스 공백으로 결합
  |> prop.key("item-1")                   // React key (리스트 렌더링)
  |> prop.ref(my_ref)                     // React ref
```

#### 이벤트 핸들러

```gleam
let props =
  prop.new()
  |> prop.on_click(fn(event) { handle_click(event) })
  |> prop.on_change(fn(event) { handle_change(event) })
  |> prop.on_submit(fn(event) { handle_submit(event) })
  |> prop.on_key_down(fn(event) { handle_key(event) })
  |> prop.on_focus(fn(event) { handle_focus(event) })
  |> prop.on_blur(fn(event) { handle_blur(event) })

// 커스텀 이벤트
  |> prop.on("onMouseEnter", fn(event) { handle_mouse(event) })
```

### 3.3 HTML 태그 함수

`glendix/react/html` 모듈은 30개 이상의 HTML 태그를 위한 편의 함수를 제공합니다. 순수 Gleam으로 구현되어 FFI가 없습니다.

```gleam
import glendix/react/html
import glendix/react/prop

// Props가 있는 버전
html.div(prop.new() |> prop.class("container"), children)
html.button(prop.new() |> prop.on_click(handler), children)
html.input(prop.new() |> prop.string("type", "text"))  // void 엘리먼트

// Props 없는 버전 (언더스코어 접미사)
html.div_(children)
html.span_([react.text("텍스트")])
html.p_([react.text("문단")])
```

#### 사용 가능한 태그 목록

| 카테고리 | 태그 |
|---|---|
| **컨테이너** | `div`, `span`, `section`, `main`, `header`, `footer`, `nav`, `aside`, `article` |
| **텍스트** | `p`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6` |
| **리스트** | `ul`, `ol`, `li` |
| **폼** | `form`, `button`, `label`, `select`, `option`, `textarea` |
| **입력** | `input` (void 엘리먼트) |
| **테이블** | `table`, `thead`, `tbody`, `tr`, `td`, `th` |
| **링크/미디어** | `a`, `img` (void), `br` (void), `hr` (void) |

### 3.4 React Hooks

`glendix/react/hook` 모듈은 주요 React Hooks를 제공합니다.

> Gleam의 튜플 `#(a, b)`은 JavaScript 배열 `[a, b]`과 동일하므로 React Hooks의 반환값과 직접 호환됩니다.

#### useState — 상태 관리

```gleam
import glendix/react/hook

pub fn counter(_props) -> ReactElement {
  let #(count, set_count) = hook.use_state(0)
  let #(name, set_name) = hook.use_state("")

  html.div_([
    html.p_([react.text("Count: " <> int.to_string(count))]),
    html.button(
      prop.new() |> prop.on_click(fn(_) { set_count(count + 1) }),
      [react.text("+1")],
    ),
  ])
}
```

#### useEffect — 사이드 이펙트

```gleam
// 의존성 배열 지정
hook.use_effect(fn() {
  // count가 변경될 때마다 실행
  Nil
}, #(count))  // 의존성을 튜플로 전달

// 마운트 시 한 번만 실행
hook.use_effect_once(fn() {
  Nil
})

// 매 렌더링마다 실행
hook.use_effect_always(fn() {
  Nil
})
```

#### useEffect + 클린업

```gleam
// 클린업 함수가 있는 effect
hook.use_effect_once_cleanup(fn() {
  // 마운트 시 실행
  let timer_id = set_interval(update, 1000)

  // 클린업 함수 반환 (언마운트 시 실행)
  fn() { clear_interval(timer_id) }
})

hook.use_effect_cleanup(fn() {
  // effect 실행
  fn() { /* 클린업 */ }
}, #(dependency))

hook.use_effect_always_cleanup(fn() {
  fn() { /* 매 렌더 후 클린업 */ }
})
```

#### useMemo — 메모이제이션

```gleam
// 값이 비용이 클 때 메모이제이션
let expensive_result = hook.use_memo(fn() {
  compute_expensive_value(data)
}, #(data))
```

#### useCallback — 콜백 메모이제이션

```gleam
// 콜백 함수 메모이제이션 (자식 컴포넌트에 전달할 때 유용)
let handle_click = hook.use_callback(fn(event) {
  set_count(count + 1)
}, #(count))
```

#### useRef — 참조

```gleam
let input_ref = hook.use_ref(Nil)

// ref 값 읽기
let current = hook.get_ref(input_ref)

// ref 값 쓰기
hook.set_ref(input_ref, new_value)

// DOM 요소에 연결
html.input(prop.new() |> prop.ref(input_ref))
```

### 3.5 이벤트 처리

`glendix/react/event` 모듈은 이벤트 타입과 유틸리티 함수를 제공합니다.

#### 이벤트 타입

| 타입 | 용도 |
|---|---|
| `Event` | 기본 이벤트 |
| `MouseEvent` | 클릭, 마우스 이벤트 |
| `ChangeEvent` | input 변경 이벤트 |
| `KeyboardEvent` | 키보드 이벤트 |
| `FormEvent` | 폼 제출 이벤트 |
| `FocusEvent` | 포커스/블러 이벤트 |

#### 이벤트 접근자

```gleam
import glendix/react/event

// input 값 가져오기
prop.on_change(fn(e) {
  let value = event.target_value(e)
  set_name(value)
})

// 키보드 이벤트
prop.on_key_down(fn(e) {
  case event.key(e) {
    "Enter" -> submit()
    "Escape" -> cancel()
    _ -> Nil
  }
})

// 기본 동작 방지
prop.on_submit(fn(e) {
  event.prevent_default(e)
  handle_submit()
})

// 이벤트 전파 중지
prop.on_click(fn(e) {
  event.stop_propagation(e)
  handle_click()
})
```

### 3.6 조건부 렌더링

```gleam
import glendix/react

// Bool 기반 — 조건이 True일 때만 렌더링
react.when(is_logged_in, fn() {
  html.div_([react.text("환영합니다!")])
})

// Option 기반 — Some일 때만 렌더링
react.when_some(maybe_user, fn(user) {
  html.span_([react.text(user.name)])
})

// case 표현식으로 복잡한 조건 처리
case status {
  Loading -> html.div_([react.text("로딩 중...")])
  Available -> html.div_([react.text("완료")])
  Unavailable -> react.none()
}
```

### 3.7 리스트 렌더링

```gleam
import gleam/list

// 리스트를 map하여 엘리먼트 생성
let items = ["사과", "바나나", "체리"]

html.ul_(
  list.map(items, fn(item) {
    html.li(prop.new() |> prop.key(item), [
      react.text(item),
    ])
  }),
)

// 인덱스가 필요한 경우
list.index_map(items, fn(item, idx) {
  html.li(prop.new() |> prop.key(int.to_string(idx)), [
    react.text(item),
  ])
})
```

> 리스트 렌더링 시 항상 `prop.key()`를 설정하세요. React의 reconciliation에 필요합니다.

### 3.8 스타일 지정

```gleam
import glendix/react/prop

// 인라인 스타일 적용
let my_style =
  prop.new_style()
  |> prop.set("backgroundColor", "#f0f0f0")
  |> prop.set("padding", "16px")
  |> prop.set("borderRadius", "8px")

html.div(prop.new() |> prop.style(my_style), children)
```

> CSS 속성명은 JavaScript camelCase 표기법을 사용합니다 (예: `backgroundColor`, `fontSize`).

---

## 4. Mendix 바인딩

### 4.1 Props 접근

`glendix/mendix` 모듈로 Mendix가 위젯에 전달하는 props에 접근합니다.

```gleam
import glendix/mendix

// Option 반환 (undefined면 None)
case mendix.get_prop(props, "myAttribute") {
  Some(attr) -> use_attribute(attr)
  None -> react.none()
}

// 항상 존재하는 prop (undefined일 수 없는 경우)
let value = mendix.get_prop_required(props, "alwaysPresent")

// String prop (없으면 빈 문자열 반환)
let text = mendix.get_string_prop(props, "caption")

// prop 존재 여부 확인
let has_action = mendix.has_prop(props, "onClick")
```

#### ValueStatus 확인

Mendix의 모든 동적 값은 상태(status)를 가집니다:

```gleam
import glendix/mendix.{Available, Loading, Unavailable}

case mendix.get_status(some_value) {
  Available -> // 값 사용 가능
  Loading -> // 로딩 중
  Unavailable -> // 사용 불가
}
```

### 4.2 EditableValue — 편집 가능한 값

`glendix/mendix/editable_value`는 텍스트, 숫자, 날짜 등 편집 가능한 Mendix 속성을 다룹니다.

```gleam
import gleam/option.{None, Some}
import glendix/mendix
import glendix/mendix/editable_value as ev

pub fn text_input(props: JsProps) -> ReactElement {
  case mendix.get_prop(props, "textAttribute") {
    Some(attr) -> render_input(attr)
    None -> react.none()
  }
}

fn render_input(attr) -> ReactElement {
  // 값 읽기
  let current_value = ev.value(attr)           // Option(a)
  let display = ev.display_value(attr)         // String (포맷된 표시값)
  let is_editable = ev.is_editable(attr)       // Bool (Available && !read_only)

  // 유효성 검사 메시지 확인
  let validation_msg = ev.validation(attr)     // Option(String)

  html.div_([
    html.input(
      prop.new()
      |> prop.string("value", display)
      |> prop.bool("readOnly", !is_editable)
      |> prop.on_change(fn(e) {
        // 텍스트로 값 설정 (Mendix가 파싱)
        ev.set_text_value(attr, event.target_value(e))
      }),
    ),
    // 유효성 검사 에러 표시
    react.when_some(validation_msg, fn(msg) {
      html.span(prop.new() |> prop.class("text-danger"), [
        react.text(msg),
      ])
    }),
  ])
}
```

#### 값 설정 방법

```gleam
// Option으로 직접 설정 (타입이 맞아야 함)
ev.set_value(attr, Some(new_value))  // 값 설정
ev.set_value(attr, None)             // 값 비우기

// 텍스트로 설정 (Mendix가 자동 파싱 — 숫자, 날짜 등에 유용)
ev.set_text_value(attr, "2024-01-15")

// 커스텀 유효성 검사 함수 설정
ev.set_validator(attr, Some(fn(value) {
  case value {
    Some(v) if v == "" -> Some("값을 입력하세요")
    _ -> None  // 유효함
  }
}))
```

#### 가능한 값 목록 (Enum, Boolean 등)

```gleam
case ev.universe(attr) {
  Some(options) ->
    // options: List(a) — 선택 가능한 모든 값
    html.select_(
      list.map(options, fn(opt) {
        html.option_([react.text(string.inspect(opt))])
      }),
    )
  None -> react.none()
}
```

### 4.3 ActionValue — 액션 실행

`glendix/mendix/action`으로 Mendix 마이크로플로우/나노플로우를 실행합니다.

```gleam
import glendix/mendix
import glendix/mendix/action

pub fn action_button(props: JsProps) -> ReactElement {
  let on_click = mendix.get_prop(props, "onClick")  // Option(ActionValue)

  html.button(
    prop.new()
    |> prop.class("btn")
    |> prop.bool("disabled", case on_click {
      Some(a) -> !action.can_execute(a)
      None -> True
    })
    |> prop.on_click(fn(_) {
      // Option(ActionValue) 안전하게 실행
      action.execute_action(on_click)
    }),
    [react.text("실행")],
  )
}
```

#### 액션 실행 방법

```gleam
// 직접 실행 (can_execute 확인 없이)
action.execute(my_action)

// can_execute가 True일 때만 실행
action.execute_if_can(my_action)

// Option(ActionValue)에서 안전하게 실행
action.execute_action(maybe_action)  // None이면 아무것도 안 함

// 실행 상태 확인
let can = action.can_execute(my_action)      // Bool
let running = action.is_executing(my_action)  // Bool
```

### 4.4 DynamicValue — 읽기 전용 표현식

`glendix/mendix/dynamic_value`는 Mendix 표현식(Expression) 속성을 다룹니다.

```gleam
import glendix/mendix/dynamic_value as dv

pub fn display_expression(props: JsProps) -> ReactElement {
  case mendix.get_prop(props, "expression") {
    Some(expr) ->
      case dv.value(expr) {
        Some(text) -> html.span_([react.text(text)])
        None -> react.none()
      }
    None -> react.none()
  }
}

// 상태 확인
let status = dv.status(expr)
let ready = dv.is_available(expr)
```

### 4.5 ListValue — 리스트 데이터

`glendix/mendix/list_value`는 Mendix 데이터 소스 리스트를 다룹니다.

```gleam
import glendix/mendix
import glendix/mendix/list_value as lv

pub fn data_list(props: JsProps) -> ReactElement {
  case mendix.get_prop(props, "dataSource") {
    Some(list_val) -> render_list(list_val, props)
    None -> react.none()
  }
}

fn render_list(list_val, props) -> ReactElement {
  case lv.items(list_val) {
    Some(items) ->
      html.ul_(
        list.map(items, fn(item) {
          let id = mendix.object_id(item)
          html.li(prop.new() |> prop.key(id), [
            react.text("Item: " <> id),
          ])
        }),
      )
    None ->
      html.div_([react.text("로딩 중...")])
  }
}
```

#### 페이지네이션

```gleam
// 현재 페이지 정보
let offset = lv.offset(list_val)         // 현재 오프셋
let limit = lv.limit(list_val)           // 페이지 크기
let has_more = lv.has_more_items(list_val)  // Option(Bool)

// 페이지 이동
lv.set_offset(list_val, offset + limit)  // 다음 페이지
lv.set_limit(list_val, 20)              // 페이지 크기 변경

// 전체 개수 요청 (성능 고려)
lv.request_total_count(list_val, True)
let total = lv.total_count(list_val)    // Option(Int)
```

#### 정렬

```gleam
import glendix/mendix/list_value as lv

// 정렬 적용
lv.set_sort_order(list_val, [
  lv.sort("Name", lv.Asc),
  lv.sort("CreatedDate", lv.Desc),
])

// 현재 정렬 확인
let current_sort = lv.sort_order(list_val)
```

#### 데이터 갱신

```gleam
lv.reload(list_val)  // 데이터 다시 로드
```

### 4.6 ListAttribute — 리스트 아이템 접근

`glendix/mendix/list_attribute`는 리스트의 각 아이템에서 속성, 액션, 표현식, 위젯을 추출합니다.

```gleam
import glendix/mendix/list_attribute as la

pub fn render_table(props: JsProps) -> ReactElement {
  let list_val = mendix.get_prop_required(props, "dataSource")
  let name_attr = mendix.get_prop_required(props, "nameAttr")
  let edit_action = mendix.get_prop(props, "onEdit")

  case lv.items(list_val) {
    Some(items) ->
      html.table_(
        [html.tbody_(
          list.map(items, fn(item) {
            let id = mendix.object_id(item)

            // 아이템에서 속성값 추출
            let name_ev = la.get_attribute(name_attr, item)
            let display = ev.display_value(name_ev)

            // 아이템에서 액션 추출
            let action_opt = case edit_action {
              Some(act) -> la.get_action(act, item)
              None -> None
            }

            html.tr(prop.new() |> prop.key(id), [
              html.td_([react.text(display)]),
              html.td_([
                html.button(
                  prop.new()
                  |> prop.on_click(fn(_) {
                    action.execute_action(action_opt)
                  }),
                  [react.text("편집")],
                ),
              ]),
            ])
          }),
        )],
      )
    None -> html.div_([react.text("로딩 중...")])
  }
}
```

#### ListAttributeValue 메타데이터

```gleam
// 속성 정보 확인
let id = la.attr_id(name_attr)               // String - 속성 ID
let sortable = la.attr_sortable(name_attr)    // Bool
let filterable = la.attr_filterable(name_attr) // Bool
let type_name = la.attr_type(name_attr)       // "String", "Integer" 등
let formatter = la.attr_formatter(name_attr)  // ValueFormatter
```

#### 위젯 렌더링

```gleam
// 리스트 아이템별 위젯 (Mendix Studio에서 구성)
let content_widget = mendix.get_prop_required(props, "content")

list.map(items, fn(item) {
  let widget_element = la.get_widget(content_widget, item)
  html.div(prop.new() |> prop.key(mendix.object_id(item)), [
    widget_element,  // ReactElement로 직접 사용
  ])
})
```

### 4.7 Selection — 선택

`glendix/mendix/selection`으로 단일/다중 선택을 관리합니다.

#### 단일 선택

```gleam
import glendix/mendix/selection

// 현재 선택된 항목
let selected = selection.selection(single_sel)  // Option(ObjectItem)

// 선택 설정/해제
selection.set_selection(single_sel, Some(item))  // 선택
selection.set_selection(single_sel, None)         // 선택 해제
```

#### 다중 선택

```gleam
// 선택된 항목들
let selected_items = selection.selections(multi_sel)  // List(ObjectItem)

// 선택 설정
selection.set_selections(multi_sel, [item1, item2])
```

### 4.8 Reference — 연관 관계

`glendix/mendix/reference`로 Mendix 연관 관계(Association)를 다룹니다.

```gleam
import glendix/mendix/reference as ref

// 단일 참조 (1:1, N:1)
let referenced = ref.value(my_ref)         // Option(a)
let is_readonly = ref.read_only(my_ref)    // Bool
let error = ref.validation(my_ref)         // Option(String)

ref.set_value(my_ref, Some(new_item))      // 참조 설정
ref.set_value(my_ref, None)                // 참조 해제

// 다중 참조 (M:N)
let items = ref.multi_value(my_ref_set)    // Option(List(a))
ref.set_multi_value(my_ref_set, Some([item1, item2]))
```

### 4.9 Filter — 필터 조건 빌더

`glendix/mendix/filter`로 ListValue에 적용할 필터 조건을 프로그래밍 방식으로 구성합니다.

```gleam
import glendix/mendix/filter
import glendix/mendix/list_value as lv

// 단순 비교
let name_filter =
  filter.contains(
    filter.attribute("Name"),
    filter.literal("검색어"),
  )

// 복합 조건 (AND)
let complex_filter =
  filter.and_([
    filter.equals(
      filter.attribute("Status"),
      filter.literal("Active"),
    ),
    filter.greater_than(
      filter.attribute("Amount"),
      filter.literal(100),
    ),
  ])

// 필터 적용
lv.set_filter(list_val, Some(complex_filter))

// 필터 해제
lv.set_filter(list_val, None)
```

#### 사용 가능한 비교 연산자

| 함수 | 설명 |
|---|---|
| `equals(a, b)` | 같음 |
| `not_equal(a, b)` | 다름 |
| `greater_than(a, b)` | 초과 |
| `greater_than_or_equal(a, b)` | 이상 |
| `less_than(a, b)` | 미만 |
| `less_than_or_equal(a, b)` | 이하 |
| `contains(a, b)` | 포함 (문자열) |
| `starts_with(a, b)` | 시작 (문자열) |
| `ends_with(a, b)` | 끝 (문자열) |

#### 날짜 비교

```gleam
filter.day_equals(filter.attribute("Birthday"), filter.literal(date))
filter.day_greater_than(filter.attribute("CreatedDate"), filter.literal(start_date))
```

#### 논리 조합

```gleam
filter.and_([condition1, condition2])   // AND
filter.or_([condition1, condition2])    // OR
filter.not_(condition)                  // NOT
```

#### 표현식 타입

```gleam
filter.attribute("AttrName")    // 속성 참조
filter.association("AssocName") // 연관 관계 참조
filter.literal(value)           // 상수 값
filter.empty()                  // 빈 값 (null 비교용)
```

### 4.10 날짜와 숫자

#### JsDate — 날짜 처리

`glendix/mendix/date`는 JavaScript Date를 Gleam에서 안전하게 다룹니다.

> 핵심: Gleam에서 월(month)은 **1-based** (1~12), JavaScript에서는 0-based (0~11). glendix가 자동 변환합니다.

```gleam
import glendix/mendix/date

// 생성
let now = date.now()
let parsed = date.from_iso("2024-03-15T10:30:00Z")
let custom = date.create(2024, 3, 15, 10, 30, 0, 0)  // 월: 1-12!
let from_ts = date.from_timestamp(1710500000000)

// 읽기
let year = date.year(now)        // 예: 2024
let month = date.month(now)      // 1~12 (자동 변환!)
let day = date.day(now)          // 1~31
let hours = date.hours(now)      // 0~23
let dow = date.day_of_week(now)  // 0=일요일

// 변환
let iso = date.to_iso(now)                  // "2024-03-15T10:30:00.000Z"
let ts = date.to_timestamp(now)             // Unix 밀리초
let str = date.to_string(now)               // 사람이 읽을 수 있는 형식
let input_val = date.to_input_value(now)    // "2024-03-15" (input[type="date"]용)

// input[type="date"]에서 파싱
let maybe_date = date.from_input_value("2024-03-15")  // Option(JsDate)
```

#### Big — 고정밀 십진수

`glendix/mendix/big`는 Big.js를 래핑하여 Mendix의 Decimal 타입을 정밀하게 처리합니다.

```gleam
import glendix/mendix/big
import gleam/order

// 생성
let a = big.from_string("123.456")
let b = big.from_int(100)
let c = big.from_float(99.99)

// 연산
let sum = big.add(a, b)            // 223.456
let diff = big.subtract(a, b)     // 23.456
let prod = big.multiply(a, b)     // 12345.6
let quot = big.divide(a, b)       // 1.23456
let abs = big.absolute(diff)      // 양수화
let neg = big.negate(a)           // -123.456

// 비교
let cmp = big.compare(a, b)       // order.Gt
let eq = big.equal(a, b)          // False

// 변환
let str = big.to_string(sum)      // "223.456"
let f = big.to_float(sum)         // 223.456
let i = big.to_int(sum)           // 223 (소수점 버림)
let fixed = big.to_fixed(sum, 2)  // "223.46"
```

### 4.11 파일, 아이콘, 포맷터

#### FileValue / WebImage

```gleam
import glendix/mendix/file

// FileValue
let uri = file.uri(file_val)       // String - 파일 URI
let name = file.name(file_val)     // Option(String) - 파일명

// WebImage (FileValue + alt 텍스트)
let src = file.image_uri(img)      // String
let alt = file.alt_text(img)       // Option(String)

html.img(
  prop.new()
  |> prop.string("src", src)
  |> prop.string("alt", option.unwrap(alt, "")),
)
```

#### WebIcon

```gleam
import glendix/mendix/icon

case icon.icon_type(my_icon) {
  icon.Glyph ->
    html.span(prop.new() |> prop.class(icon.icon_class(my_icon)), [])
  icon.Image ->
    html.img(prop.new() |> prop.string("src", icon.icon_url(my_icon)))
  icon.IconFont ->
    html.span(prop.new() |> prop.class(icon.icon_class(my_icon)), [])
}
```

#### ValueFormatter

```gleam
import glendix/mendix/formatter

// 값을 문자열로 포맷
let display = formatter.format(fmt, Some(value))  // String
let empty = formatter.format(fmt, None)            // ""

// 텍스트를 값으로 파싱
case formatter.parse(fmt, "123.45") {
  Ok(Some(value)) -> // 파싱 성공
  Ok(None) -> // 빈 값
  Error(Nil) -> // 파싱 실패
}
```

---

## 5. 실전 패턴

### 5.1 폼 입력 위젯

```gleam
import gleam/option.{None, Some}
import glendix/mendix
import glendix/mendix/action
import glendix/mendix/editable_value as ev
import glendix/react.{type JsProps, type ReactElement}
import glendix/react/event
import glendix/react/hook
import glendix/react/html
import glendix/react/prop

pub fn text_input_widget(props: JsProps) -> ReactElement {
  let attr = mendix.get_prop(props, "textAttribute")
  let on_enter = mendix.get_prop(props, "onEnterAction")
  let placeholder = mendix.get_string_prop(props, "placeholder")

  case attr {
    Some(text_attr) -> {
      let display = ev.display_value(text_attr)
      let editable = ev.is_editable(text_attr)
      let validation = ev.validation(text_attr)

      html.div(prop.new() |> prop.class("form-group"), [
        html.input(
          prop.new()
          |> prop.class("form-control")
          |> prop.string("value", display)
          |> prop.string("placeholder", placeholder)
          |> prop.bool("readOnly", !editable)
          |> prop.on_change(fn(e) {
            ev.set_text_value(text_attr, event.target_value(e))
          })
          |> prop.on_key_down(fn(e) {
            case event.key(e) {
              "Enter" -> action.execute_action(on_enter)
              _ -> Nil
            }
          }),
        ),
        // 유효성 검사 메시지
        react.when_some(validation, fn(msg) {
          html.div(prop.new() |> prop.class("alert alert-danger"), [
            react.text(msg),
          ])
        }),
      ])
    }
    None -> react.none()
  }
}
```

### 5.2 데이터 테이블 위젯

```gleam
import gleam/int
import gleam/list
import gleam/option.{None, Some}
import glendix/mendix
import glendix/mendix/editable_value as ev
import glendix/mendix/list_attribute as la
import glendix/mendix/list_value as lv
import glendix/react.{type JsProps, type ReactElement}
import glendix/react/html
import glendix/react/prop

pub fn data_table(props: JsProps) -> ReactElement {
  let ds = mendix.get_prop_required(props, "dataSource")
  let col_name = mendix.get_prop_required(props, "nameColumn")
  let col_status = mendix.get_prop_required(props, "statusColumn")

  html.div(prop.new() |> prop.class("table-responsive"), [
    html.table(prop.new() |> prop.class("table table-striped"), [
      // 헤더
      html.thead_([
        html.tr_([
          html.th_([react.text("이름")]),
          html.th_([react.text("상태")]),
        ]),
      ]),
      // 바디
      html.tbody_(
        case lv.items(ds) {
          Some(items) ->
            list.map(items, fn(item) {
              let id = mendix.object_id(item)
              let name = ev.display_value(la.get_attribute(col_name, item))
              let status = ev.display_value(la.get_attribute(col_status, item))

              html.tr(prop.new() |> prop.key(id), [
                html.td_([react.text(name)]),
                html.td_([react.text(status)]),
              ])
            })
          None -> [
            html.tr_([
              html.td(
                prop.new() |> prop.string("colSpan", "2"),
                [react.text("로딩 중...")],
              ),
            ]),
          ]
        },
      ),
    ]),
    // 페이지네이션
    render_pagination(ds),
  ])
}

fn render_pagination(ds) -> ReactElement {
  let offset = lv.offset(ds)
  let limit = lv.limit(ds)
  let has_more = lv.has_more_items(ds)

  html.div(prop.new() |> prop.class("pagination"), [
    html.button(
      prop.new()
      |> prop.bool("disabled", offset == 0)
      |> prop.on_click(fn(_) {
        lv.set_offset(ds, int.max(0, offset - limit))
      }),
      [react.text("이전")],
    ),
    html.button(
      prop.new()
      |> prop.bool("disabled", has_more == Some(False))
      |> prop.on_click(fn(_) {
        lv.set_offset(ds, offset + limit)
      }),
      [react.text("다음")],
    ),
  ])
}
```

### 5.3 검색 가능한 리스트

```gleam
import gleam/option.{None, Some}
import glendix/mendix
import glendix/mendix/filter
import glendix/mendix/list_value as lv
import glendix/react.{type JsProps, type ReactElement}
import glendix/react/event
import glendix/react/hook
import glendix/react/html
import glendix/react/prop

pub fn searchable_list(props: JsProps) -> ReactElement {
  let ds = mendix.get_prop_required(props, "dataSource")
  let search_attr = mendix.get_string_prop(props, "searchAttribute")
  let #(query, set_query) = hook.use_state("")

  // 검색어 변경 시 필터 적용
  hook.use_effect(fn() {
    case query {
      "" -> lv.set_filter(ds, None)
      q ->
        lv.set_filter(ds, Some(
          filter.contains(
            filter.attribute(search_attr),
            filter.literal(q),
          ),
        ))
    }
    Nil
  }, #(query))

  html.div_([
    // 검색 입력
    html.input(
      prop.new()
      |> prop.class("form-control")
      |> prop.string("type", "search")
      |> prop.string("placeholder", "검색...")
      |> prop.string("value", query)
      |> prop.on_change(fn(e) { set_query(event.target_value(e)) }),
    ),
    // 결과 리스트 렌더링
    render_results(ds),
  ])
}
```

### 5.4 컴포넌트 합성

Gleam 함수를 컴포넌트처럼 활용하여 UI를 분리합니다:

```gleam
import glendix/react.{type ReactElement}
import glendix/react/html
import glendix/react/prop

// 재사용 가능한 카드 컴포넌트
fn card(title: String, children: List(ReactElement)) -> ReactElement {
  html.div(prop.new() |> prop.class("card"), [
    html.div(prop.new() |> prop.class("card-header"), [
      html.h3_([react.text(title)]),
    ]),
    html.div(prop.new() |> prop.class("card-body"), children),
  ])
}

// 재사용 가능한 빈 상태 컴포넌트
fn empty_state(message: String) -> ReactElement {
  html.div(prop.new() |> prop.class("empty-state"), [
    html.p_([react.text(message)]),
  ])
}

// 조합하여 사용
pub fn dashboard(props) -> ReactElement {
  html.div(prop.new() |> prop.class("dashboard"), [
    card("사용자 목록", [
      // 리스트 내용...
    ]),
    card("최근 활동", [
      empty_state("아직 활동이 없습니다."),
    ]),
  ])
}
```

---

## 6. 트러블슈팅

### 빌드 에러

| 문제 | 원인 | 해결 |
|---|---|---|
| `gleam build` 실패: glendix를 찾을 수 없음 | `gleam.toml`의 경로가 잘못됨 | `path = "../glendix"` 경로 확인 |
| `react is not defined` | peer dependency 미설치 | `npm install react@^19.0.0` |
| `Big is not a constructor` | big.js 미설치 | `npm install big.js@^6.0.0` |

### 런타임 에러

| 문제 | 원인 | 해결 |
|---|---|---|
| `Cannot read property of undefined` | 존재하지 않는 prop 접근 | `get_prop` (Option) 대신 `get_prop_required` 사용 시 prop 이름 확인 |
| `set_value` 호출 시 에러 | read_only 상태에서 값 설정 | `ev.is_editable(attr)` 확인 후 설정 |
| Hook 순서 에러 | 조건부로 Hook 호출 | Hook은 항상 동일한 순서로 호출해야 함 (React Rules of Hooks) |

### 일반적인 실수

**1. Hook을 조건부로 호출하지 마세요:**

```gleam
// 잘못된 예
pub fn widget(props) {
  case mendix.get_prop(props, "attr") {
    Some(attr) -> {
      let #(count, set_count) = hook.use_state(0)  // 조건 안에서 Hook!
      // ...
    }
    None -> react.none()
  }
}

// 올바른 예
pub fn widget(props) {
  let #(count, set_count) = hook.use_state(0)  // 항상 최상위에서 호출

  case mendix.get_prop(props, "attr") {
    Some(attr) -> // count 사용...
    None -> react.none()
  }
}
```

**2. 리스트 렌더링에서 key를 빠뜨리지 마세요:**

```gleam
// key가 있어야 React가 효율적으로 업데이트합니다
list.map(items, fn(item) {
  html.div(prop.new() |> prop.key(mendix.object_id(item)), [
    // ...
  ])
})
```

**3. 월(month) 변환을 직접 하지 마세요:**

```gleam
// glendix/mendix/date가 자동으로 1-based ↔ 0-based 변환합니다
let month = date.month(my_date)  // 1~12 (Gleam 기준, 변환 불필요)
```

---

