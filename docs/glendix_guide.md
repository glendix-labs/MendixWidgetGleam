# glendix v4.0.5 — Agent Reference Guide

> 이 문서는 AI 에이전트(LLM)가 glendix 코드를 작성할 때 참조하는 가이드입니다. 각 섹션은 독립적으로 읽을 수 있습니다.

---

## 1. 아키텍처 개요

glendix는 Gleam으로 Mendix Pluggable Widget을 작성하는 FFI 라이브러리입니다.

**v3.0 설계 원칙: 위임**

| 관심사 | 담당 패키지 | glendix 역할 |
|--------|------------|-------------|
| React 바인딩 (엘리먼트, 훅, 이벤트, HTML/SVG) | `redraw`, `redraw_dom` | 사용하지 않음 — 직접 import |
| TEA 패턴 (Model-Update-View) | `lustre` | `glendix/lustre` 브릿지 제공 |
| Mendix API (JsProps, EditableValue, ListValue 등) | `mendraw` | 핵심 담당 |
| 외부 JS 컴포넌트 (widget, binding) → React | `mendraw/interop` | 브릿지 제공 |
| Mendix 위젯 (.mpk, Classic, 마켓플레이스) | `mendraw` | 핵심 담당 |
| 빌드/설치 | `glendix` | 핵심 담당 |

**의존성 구조:**

```
사용자 코드
├── redraw          ← React 훅, 컴포넌트, fragment 등
├── redraw_dom      ← HTML/SVG 태그, 속성, 이벤트
├── lustre          ← TEA update/view (선택)
├── mendraw
│   ├── mendix      ← Mendix API 타입 + props 접근
│   ├── interop     ← 외부 JS 컴포넌트 → redraw.Element
│   ├── widget      ← .mpk 위젯 컴포넌트 (gleam.toml 자동 다운로드)
│   ├── classic     ← Classic (Dojo) 위젯
│   └── marketplace ← Mendix Marketplace 검색/다운로드
└── glendix
    ├── lustre      ← Lustre Element → redraw.Element 브릿지
    ├── binding     ← 외부 React 컴포넌트 (gleam.toml [tools.glendix.bindings])
    └── js/*        ← JS interop escape hatch
```

---

## 2. 프로젝트 설정

사용자 프로젝트의 `gleam.toml`에 glendix를 추가합니다:

```toml
[dependencies]
glendix = ">= 4.0.5 and < 5.0.0"
mendraw = ">= 1.2.1 and < 2.0.0"
```

Peer dependency (위젯 프로젝트 `package.json`):

```json
{
  "dependencies": { "big.js": "^6.0.0" },  // decimal 속성 사용 시
  "overrides": { "react": "19.0.0", "react-dom": "19.0.0", "@types/react": "19.0.0", "@types/react-dom": "19.0.0" },
  "resolutions": { "react": "19.0.0", "react-dom": "19.0.0", "@types/react": "19.0.0", "@types/react-dom": "19.0.0" }
}
```

> - `react`/`react-dom`은 `dependencies`에 넣지 않는다. `pluggable-widgets-tools`가 자동 제공하며, 직접 선언하면 번들 충돌이 발생한다.
> - `overrides`/`resolutions`에서 반드시 **캐럿(`^`) 없이 정확한 버전**을 지정한다. `^19.0.0`은 react와 react-dom이 서로 다른 19.x.x로 해석되어 런타임 버전 불일치 에러를 일으킨다.

```bash
gleam run -m glendix/install   # 의존성 설치 + TOML 위젯 다운로드 + 바인딩 생성
gleam build                    # 컴파일 확인
```

---

## 3. 위젯 함수 시그니처

모든 Mendix Pluggable Widget은 이 시그니처를 따릅니다:

```gleam
import mendraw/mendix.{type JsProps}
import redraw.{type Element}

pub fn widget(props: JsProps) -> Element
```

- `JsProps` — Mendix가 전달하는 props 객체 (opaque). `mendraw/mendix` 모듈의 접근자로만 읽는다.
- `Element` — redraw의 React 엘리먼트 타입. `redraw/dom/html`, `redraw.fragment()` 등으로 생성한다.

---

## 4. 렌더링 경로 선택

glendix는 두 가지 렌더링 경로를 지원합니다. 둘 다 `redraw.Element`를 반환하므로 자유롭게 합성 가능합니다.

| 기준 | redraw (직접 React) | lustre (TEA 브릿지) |
|------|---------------------|---------------------|
| 상태 관리 | `redraw.use_state`, `redraw.use_reducer` | `update` 함수 (순수) |
| 뷰 작성 | `redraw/dom/html`, `redraw/dom/events` | `lustre/element/html`, `lustre/event` |
| 사이드 이펙트 | `redraw.use_effect` | `lustre/effect.Effect` |
| 진입점 | 위젯 함수 자체 | `glendix/lustre.use_tea()` 또는 `use_simple()` |
| 적합한 경우 | 단순 UI, Mendix 값 표시/수정 | 복잡한 상태 머신, TEA 선호 |
| 외부 라이브러리 | redraw 생태계 | lustre 생태계 (lustre_ui 등) |
| 합성 | lustre를 삽입: `gl.use_tea()` | redraw를 삽입: `gl.embed()` |

---

## 5. redraw 렌더링 경로 — 레퍼런스

### 5.1 필수 import 패턴

```gleam
import mendraw/mendix.{type JsProps}   // Mendix props 타입
import redraw.{type Element}           // 반환 타입
import redraw/dom/html                 // HTML 태그 함수
import redraw/dom/attribute            // HTML 속성
import redraw/dom/events               // 이벤트 핸들러
```

### 5.2 HTML 엘리먼트 생성

```gleam
// 속성 + 자식
html.div([attribute.class("container")], [
  html.h1([attribute.class("title")], [html.text("제목")]),
  html.p([], [html.text("내용")]),
])

// void 엘리먼트 (자식 없음)
html.input([attribute.type_("text"), attribute.value(val)])
html.img([attribute.src("image.png"), attribute.alt("설명")])
html.br([])
```

### 5.3 텍스트, 빈 렌더링, Fragment

```gleam
html.text("안녕하세요")              // 텍스트 노드
html.text("Count: " <> int.to_string(count))

html.none()                          // 아무것도 렌더링하지 않음 (React null)

redraw.fragment([child1, child2])    // Fragment
```

### 5.4 조건부 렌더링

v3.0에서는 Gleam `case` 표현식을 직접 사용합니다:

```gleam
// Bool 기반
case is_visible {
  True -> html.div([], [html.text("보임")])
  False -> html.none()
}

// Option 기반
case maybe_user {
  Some(user) -> html.span([], [html.text(user.name)])
  None -> html.none()
}

// 복잡한 조건
case mendix.get_status(value) {
  Available -> html.div([], [html.text("완료")])
  Loading -> html.div([], [html.text("로딩 중...")])
  Unavailable -> html.none()
}
```

### 5.5 리스트 렌더링

```gleam
import gleam/list

html.ul([], list.map(items, fn(item) {
  html.li([attribute.key(mendix.object_id(item))], [
    html.text(ev.display_value(la.get_attribute(name_attr, item))),
  ])
}))
```

> 리스트 렌더링 시 `attribute.key()`를 항상 설정해야 합니다. React reconciliation에 필요합니다.

### 5.6 속성

```gleam
import redraw/dom/attribute

// 기본
attribute.class("btn btn-primary")    // className
attribute.id("main")
attribute.style([#("color", "red"), #("padding", "8px")])

// 폼
attribute.type_("text")
attribute.value("입력값")
attribute.placeholder("입력하세요")
attribute.disabled(True)
attribute.checked(True)
attribute.readonly(True)

// 범용 escape hatch
attribute.attribute("data-custom", "value")

// ref
attribute.ref(my_ref)
```

### 5.7 이벤트 핸들러

```gleam
import redraw/dom/events

events.on_click(fn(e) { handle_click(e) })
events.on_change(fn(e) { set_name(/* ... */) })
events.on_input(fn(e) { Nil })
events.on_submit(fn(e) { Nil })
events.on_key_down(fn(e) { Nil })
events.on_focus(fn(e) { Nil })
events.on_blur(fn(e) { Nil })

// 캡처 단계
events.on_click_capture(fn(e) { Nil })
```

### 5.8 Hooks

모든 훅은 `redraw` 메인 모듈에 있습니다:

```gleam
import redraw

// 상태
let #(count, set_count) = redraw.use_state(0)
let #(count, update_count) = redraw.use_state_(0)  // 업데이터 함수 변형
let #(data, set_data) = redraw.use_lazy_state(fn() { expensive() })

// 이펙트
redraw.use_effect(fn() { Nil }, deps)               // 의존성 지정
redraw.use_effect_(fn() { fn() { cleanup() } }, deps)  // 클린업 포함

// Ref
import redraw/ref
let my_ref = redraw.use_ref()          // Ref(Option(a))
let my_ref = redraw.use_ref_(initial)  // Ref(a) — 초기값 지정
ref.current(my_ref)                    // 현재 값 읽기
ref.assign(my_ref, new_value)          // 값 쓰기

// 메모이제이션
let result = redraw.use_memo(fn() { expensive(data) }, data)
let handler = redraw.use_callback(fn(e) { handle(e) }, deps)

// 리듀서
let #(state, dispatch) = redraw.use_reducer(reducer_fn, initial_state)

// Context
let value = redraw.use_context(my_context)

// 기타
let id = redraw.use_id()
let #(is_pending, start) = redraw.use_transition()
let deferred = redraw.use_deferred_value(value)
```

### 5.9 컴포넌트 정의

```gleam
import redraw

// 이름 있는 컴포넌트 (DevTools에 표시)
let my_comp = redraw.component_("MyComponent", fn(props) {
  html.div([], [html.text("Hello")])
})

// React.memo (구조 동등성 기반 리렌더 방지)
let memoized = redraw.memoize_(my_comp)
```

### 5.10 Context API

```gleam
import redraw

let theme_ctx = redraw.create_context_("light")

// Provider
redraw.provider(theme_ctx, "dark", [child_elements])

// Consumer (Hook)
let theme = redraw.use_context(theme_ctx)
```

### 5.11 SVG

```gleam
import redraw/dom/svg
import redraw/dom/attribute

svg.svg([attribute.attribute("viewBox", "0 0 100 100")], [
  svg.circle([
    attribute.attribute("cx", "50"),
    attribute.attribute("cy", "50"),
    attribute.attribute("r", "40"),
    attribute.attribute("fill", "blue"),
  ], []),
])
```

---

## 6. lustre 렌더링 경로 — 레퍼런스

### 6.1 TEA 패턴 (use_tea)

`update`와 `view`는 표준 lustre 코드와 100% 동일합니다. 진입점만 `glendix/lustre.use_tea()`를 사용합니다.

```gleam
import gleam/int
import glendix/lustre as gl
import mendraw/mendix.{type JsProps}
import lustre/effect
import lustre/element/html
import lustre/event
import redraw.{type Element}

// --- Model ---
type Model {
  Model(count: Int)
}

// --- Msg ---
type Msg {
  Increment
  Decrement
}

// --- Update (순수 lustre 코드) ---
fn update(model: Model, msg: Msg) -> #(Model, effect.Effect(Msg)) {
  case msg {
    Increment -> #(Model(model.count + 1), effect.none())
    Decrement -> #(Model(model.count - 1), effect.none())
  }
}

// --- View (순수 lustre 코드) ---
fn view(model: Model) {
  html.div([], [
    html.button([event.on_click(Decrement)], [html.text("-")]),
    html.text(int.to_string(model.count)),
    html.button([event.on_click(Increment)], [html.text("+")]),
  ])
}

// --- 위젯 진입점 ---
pub fn widget(_props: JsProps) -> Element {
  gl.use_tea(#(Model(0), effect.none()), update, view)
}
```

### 6.2 Simple TEA (use_simple) — Effect 없음

```gleam
import glendix/lustre as gl

pub fn widget(_props: JsProps) -> Element {
  gl.use_simple(Model(0), update_simple, view)
}

fn update_simple(model: Model, msg: Msg) -> Model {
  case msg {
    Increment -> Model(model.count + 1)
    Decrement -> Model(model.count - 1)
  }
}
```

### 6.3 Lustre Element를 수동으로 변환 (render)

lustre 뷰를 React 트리 안에 삽입할 때 사용합니다:

```gleam
import glendix/lustre as gl

let react_element = gl.render(lustre_element, dispatch_fn)
```

### 6.4 redraw Element를 lustre 트리에 삽입 (embed)

lustre view 안에서 redraw 컴포넌트를 사용할 때 호출합니다:

```gleam
import glendix/lustre as gl
import lustre/element/html as lustre_html
import redraw/dom/attribute
import redraw/dom/html

fn view(model: Model) {
  lustre_html.div([], [
    lustre_html.text("lustre 영역"),
    // redraw 엘리먼트를 lustre 트리에 삽입
    gl.embed(
      html.div([attribute.class("from-redraw")], [
        html.text("redraw로 만든 엘리먼트"),
      ]),
    ),
  ])
}
```

`gl.embed()`은 `redraw.Element` → `lustre/element.Element(msg)` 변환입니다. 변환 시 React 엘리먼트가 그대로 통과되며, lustre의 dispatch에는 참여하지 않습니다.

---

## 7. 외부 컴포넌트 통합

### 7.1 모듈 선택 가이드

| 컴포넌트 출처 | 사용 모듈 | 예시 |
|--------------|----------|------|
| npm 패키지 (React 컴포넌트) | `glendix/binding` + `mendraw/interop` | recharts, @mui |
| `.mpk` Classic (Dojo) 위젯 (gleam.toml) | `mendraw/classic` | CameraWidget |

### 7.2 외부 React 컴포넌트 (binding + interop)

**설정:** `gleam.toml`에 바인딩 추가 → `npm install 패키지명` → `gleam run -m glendix/install`

```toml
[tools.glendix.bindings]
recharts = ["PieChart", "Pie", "Cell", "Tooltip"]
```

**Gleam 래퍼 작성:**

```gleam
import glendix/binding
import mendraw/interop
import redraw.{type Element}
import redraw/dom/attribute.{type Attribute}

fn m() { binding.module("recharts") }

pub fn pie_chart(attrs: List(Attribute), children: List(Element)) -> Element {
  interop.component_el(binding.resolve(m(), "PieChart"), attrs, children)
}

pub fn tooltip(attrs: List(Attribute)) -> Element {
  interop.void_component_el(binding.resolve(m(), "Tooltip"), attrs)
}
```

**interop 함수 시그니처:**

| 함수 | 용도 |
|------|------|
| `interop.component_el(comp, attrs, children)` | 속성 + 자식 |
| `interop.component_el_(comp, children)` | 자식만 |
| `interop.void_component_el(comp, attrs)` | self-closing (자식 없음) |


> Mendix에서 받은 prop (JsProps에서 꺼낸 값)은 이미 올바른 형식이므로 `attribute.attribute(key, value)`로 그대로 전달합니다.

### 7.4 Classic (Dojo) 위젯

```gleam
import gleam/dynamic
import mendraw/classic

classic.render("CameraWidget.widget.CameraWidget", [
  #("mfToExecute", classic.to_dynamic(mf_value)),
  #("preferRearCamera", classic.to_dynamic(True)),
])
```

반환 타입: `redraw.Element`

---

## 8. Mendix API 레퍼런스

### 8.1 Props 접근 (`mendraw/mendix`)

`JsProps`는 opaque 타입입니다. 접근자 함수로만 읽습니다.

```gleam
import mendraw/mendix

// Option 반환 (undefined → None)
mendix.get_prop(props, "myAttr")           // Option(a)

// 항상 존재하는 prop
mendix.get_prop_required(props, "name")    // a

// 문자열 (없으면 "")
mendix.get_string_prop(props, "caption")   // String

// 존재 여부
mendix.has_prop(props, "onClick")          // Bool
```

### 8.2 ValueStatus 확인

Mendix의 모든 동적 값은 상태를 가집니다:

```gleam
import mendraw/mendix.{Available, Loading, Unavailable}

case mendix.get_status(some_value) {
  Available -> // 값 사용 가능
  Loading -> // 로딩 중
  Unavailable -> // 사용 불가
}
```

### 8.3 EditableValue (`mendraw/mendix/editable_value`)

텍스트, 숫자, 날짜 등 편집 가능한 Mendix 속성:

```gleam
import mendraw/mendix/editable_value as ev

// 읽기
ev.value(attr)           // Option(a)
ev.display_value(attr)   // String (포맷된 표시값)
ev.is_editable(attr)     // Bool
ev.validation(attr)      // Option(String) — 유효성 검사 메시지

// 쓰기
ev.set_value(attr, Some(new_value))
ev.set_value(attr, None)                     // 값 비우기
ev.set_text_value(attr, "2024-01-15")        // 텍스트로 설정 (Mendix 파싱)

// 유효성 검사 함수 설정
ev.set_validator(attr, Some(fn(value) {
  case value {
    Some(v) if v == "" -> Some("값을 입력하세요")
    _ -> None
  }
}))

// 선택 가능한 값 목록 (Enum, Boolean 등)
ev.universe(attr)        // Option(List(a))
```

### 8.4 ActionValue (`mendraw/mendix/action`)

Mendix 마이크로플로우/나노플로우 실행:

```gleam
import mendraw/mendix/action

action.execute(my_action)              // 직접 실행
action.execute_if_can(my_action)       // can_execute가 True일 때만
action.execute_action(maybe_action)    // Option(ActionValue)에서 안전 실행

action.can_execute(my_action)          // Bool
action.is_executing(my_action)         // Bool
```

### 8.5 DynamicValue (`mendraw/mendix/dynamic_value`)

읽기 전용 표현식 속성:

```gleam
import mendraw/mendix/dynamic_value as dv

dv.value(expr)         // Option(a)
dv.status(expr)        // String
dv.is_available(expr)  // Bool
```

### 8.6 ListValue (`mendraw/mendix/list_value`)

Mendix 데이터 소스 리스트:

```gleam
import mendraw/mendix/list_value as lv

// 아이템 접근
lv.items(list_val)                    // Option(List(ObjectItem))

// 페이지네이션
lv.offset(list_val)                   // Int
lv.limit(list_val)                    // Int
lv.has_more_items(list_val)           // Option(Bool)
lv.set_offset(list_val, new_offset)
lv.set_limit(list_val, 20)
lv.request_total_count(list_val, True)
lv.total_count(list_val)              // Option(Int)

// 정렬
lv.set_sort_order(list_val, [
  lv.sort("Name", lv.Asc),
  lv.sort("CreatedDate", lv.Desc),
])

// 필터링
lv.set_filter(list_val, Some(filter_condition))
lv.set_filter(list_val, None)         // 필터 해제

// 갱신
lv.reload(list_val)
```

### 8.7 ListAttribute (`mendraw/mendix/list_attribute`)

리스트의 각 아이템에서 속성/액션/위젯 추출:

```gleam
import mendraw/mendix/list_attribute as la

la.get_attribute(attr, item)    // EditableValue 반환
la.get_action(action, item)     // Option(ActionValue)
la.get_expression(expr, item)   // DynamicValue
la.get_widget(widget, item)     // Element (직접 렌더링)

// 메타데이터
la.attr_id(attr)                // String
la.attr_sortable(attr)          // Bool
la.attr_filterable(attr)        // Bool
la.attr_type(attr)              // "String", "Integer" 등
la.attr_formatter(attr)         // ValueFormatter
```

### 8.8 Selection (`mendraw/mendix/selection`)

```gleam
import mendraw/mendix/selection

// 단일 선택
selection.selection(single_sel)              // Option(ObjectItem)
selection.set_selection(single_sel, Some(item))
selection.set_selection(single_sel, None)

// 다중 선택
selection.selections(multi_sel)              // List(ObjectItem)
selection.set_selections(multi_sel, [item1, item2])
```

### 8.9 Reference / ReferenceSet

```gleam
import mendraw/mendix/reference as ref
import mendraw/mendix/reference_set as ref_set

// 단일 참조
ref.value(my_ref)                  // Option(a)
ref.read_only(my_ref)              // Bool
ref.validation(my_ref)             // Option(String)
ref.set_value(my_ref, Some(item))

// 다중 참조
ref_set.value(my_ref_set)          // Option(List(a))
ref_set.set_value(my_ref_set, Some([item1, item2]))
```

### 8.10 Filter (`mendraw/mendix/filter`)

```gleam
import mendraw/mendix/filter

// 비교 연산
filter.equals(filter.attribute("Status"), filter.literal("Active"))
filter.contains(filter.attribute("Name"), filter.literal("검색어"))
filter.greater_than(filter.attribute("Amount"), filter.literal(100))
// 그 외: not_equal, greater_than_or_equal, less_than, less_than_or_equal, starts_with, ends_with

// 날짜 비교
filter.day_equals(filter.attribute("Birthday"), filter.literal(date))

// 논리 조합
filter.and_([condition1, condition2])
filter.or_([condition1, condition2])
filter.not_(condition)

// 표현식
filter.attribute("AttrName")    // 속성 참조
filter.association("AssocName") // 연관 관계
filter.literal(value)           // 상수 값
filter.empty()                  // null 비교용
```

### 8.11 날짜 (`mendraw/mendix/date`)

> Gleam month는 1-based (1~12), JS는 0-based. glendix가 자동 변환합니다.

```gleam
import mendraw/mendix/date

date.now()
date.from_iso("2024-03-15T10:30:00Z")
date.create(2024, 3, 15, 10, 30, 0, 0)   // month: 1-12

date.year(d)       // Int
date.month(d)      // 1~12
date.day(d)        // 1~31
date.hours(d)      // 0~23

date.to_iso(d)            // "2024-03-15T10:30:00.000Z"
date.to_timestamp(d)      // Unix 밀리초
date.to_input_value(d)    // "2024-03-15" (input[type="date"]용)
date.from_input_value(s)  // Option(JsDate)
```

### 8.12 Decimal (`mendraw/mendix/decimal`)

Mendix Decimal 속성의 경계 변환 전용. Big.js 객체 ↔ Gleam 값 변환만 담당합니다.
산술/비교 연산이 필요하면 위젯 프로젝트에서 [dee](https://hexdocs.pm/dee/) 패키지를 추가하세요.

```gleam
import mendraw/mendix/decimal

// 생성 (Gleam → Mendix Big.js)
decimal.from_string("123.456")
decimal.from_int(100)
decimal.from_float(3.14)        // 정밀도 손실 주의

// 변환 (Mendix Big.js → Gleam)
decimal.to_string(d)            // "123.456"
decimal.to_float(d)             // 123.456 (정밀도 손실 가능)
decimal.to_int(d)               // 123 (소수점 이하 버림)
decimal.to_fixed(d, 2)          // "123.46"
```

**dee와 함께 사용하는 패턴:**

```gleam
import dee
import mendraw/mendix/decimal

// Mendix → dee (연산) → Mendix
let value = decimal.to_string(mendix_decimal)   // Big.js → String
let result = dee.from_string(value)             // String → dee
  |> result.map(fn(d) { dee.add(d, dee.from_int(1)) })
  |> result.map(dee.to_string)                  // dee → String
  |> result.unwrap("0")
decimal.from_string(result)                     // String → Big.js
```

### 8.12.1 조건부 CSS 클래스 (`cx`)

`mendraw/mendix` 모듈의 `cx` 함수로 CSS 클래스를 조건부 조합합니다:

```gleam
import mendraw/mendix

mendix.cx([
  #("widget-container", True),
  #("active", is_active),
  #("disabled", !is_editable),
])
// → "widget-container active" (is_active=True, is_editable=True일 때)
```

### 8.13 File, Icon, Formatter

```gleam
// FileValue / WebImage
import mendraw/mendix/file
file.uri(file_val)        // String
file.name(file_val)       // Option(String)
file.image_uri(img)       // String
file.alt_text(img)        // Option(String)

// WebIcon
import mendraw/mendix/icon
icon.icon_type(i)         // Glyph | Image | IconFont
icon.icon_class(i)        // String
icon.icon_url(i)          // String

// ValueFormatter
import mendraw/mendix/formatter
formatter.format(fmt, Some(value))  // String
formatter.parse(fmt, "123.45")      // Result(Option(a), Nil)
```

---

## 9. Editor Configuration (`glendix/editor_config`)

Studio Pro의 editorConfig 로직을 Gleam으로 작성합니다.

> **Jint 제약**: Studio Pro는 Jint(.NET JS 엔진)으로 실행합니다. **Gleam List 사용 금지** — `["a", "b"]` 같은 리스트 리터럴은 Jint에서 크래시. 여러 키는 **콤마 구분 String**을 사용합니다.

```gleam
import glendix/editor_config.{type Properties}
import mendraw/mendix
import mendraw/mendix.{type JsProps}

const bar_keys = "barWidth,barColor"
const line_keys = "lineStyle,lineCurve"

pub fn get_properties(
  values: JsProps,
  default_properties: Properties,
  platform: String,
) -> Properties {
  let chart_type = mendix.get_string_prop(values, "chartType")

  let props = case chart_type {
    "line" -> editor_config.hide_properties(default_properties, bar_keys)
    "bar" -> editor_config.hide_properties(default_properties, line_keys)
    _ -> default_properties
  }

  case platform {
    "web" -> editor_config.transform_groups_into_tabs(props)
    _ -> props
  }
}
```

**함수 목록:**

| 함수 | 설명 |
|------|------|
| `hide_property(props, key)` | 단일 속성 숨기기 |
| `hide_properties(props, keys)` | 여러 속성 숨기기 (콤마 구분) |
| `hide_nested_property(props, key, index, nested_key)` | 중첩 속성 숨기기 |
| `hide_nested_properties(props, key, index, nested_keys)` | 여러 중첩 속성 (콤마 구분) |
| `transform_groups_into_tabs(props)` | 그룹 → 탭 변환 |
| `move_property(props, from_idx, to_idx)` | 속성 순서 변경 |

---

## 10. JS Interop Escape Hatch (`glendix/js/*`)

외부 JS 라이브러리(SpreadJS, Chart.js 등)와 직접 상호작용할 때 사용합니다. 모든 값은 `Dynamic` 타입. 가능하면 `glendix/binding`을 먼저 고려하세요.

```gleam
// 배열 변환
import glendix/js/array
array.from_list([1, 2, 3])   // Gleam List → JS Array (Dynamic)
array.to_list(js_arr)        // JS Array → Gleam List

// 객체
import glendix/js/object
object.object([#("width", dynamic.int(800))])
object.get(obj, "key")
object.set(obj, "key", dynamic.string(val))
object.call_method(obj, "method", [arg1, arg2])

// JSON
import glendix/js/json
json.stringify(data)                  // String
json.parse("{\"k\":\"v\"}")           // Result(Dynamic, String)

// Promise
import glendix/js/promise
import gleam/javascript/promise.{type Promise}
promise.resolve(42)
promise.then_(p, fn(v) { promise.resolve(transform(v)) })
promise.all([p1, p2])
promise.race([p1, p2])

// DOM
import glendix/js/dom
dom.focus(element)
dom.blur(element)
dom.scroll_into_view(element)
dom.query_selector(container, ".target")  // Option(Dynamic)

// Timer
import glendix/js/timer
let id = timer.set_timeout(fn() { Nil }, 1000)
timer.clear_timeout(id)
let id = timer.set_interval(fn() { Nil }, 500)
timer.clear_interval(id)
```

---

## 11. 빌드 & 도구

| 명령어 | 설명 |
|--------|------|
| `gleam build` | 컴파일 |
| `gleam run -m glendix/install` | 의존성 + mendraw 위젯 다운로드 + 바인딩 + 위젯 .gleam 생성 |
| `gleam run -m glendix/dev` | 개발 서버 (HMR) |
| `gleam run -m glendix/build` | 프로덕션 빌드 (.mpk) |
| `gleam run -m glendix/start` | Mendix 테스트 프로젝트 연동 |
| `gleam run -m glendix/release` | 릴리즈 빌드 |
| `gleam run -m glendix/lint` | ESLint 검사 |
| `gleam run -m glendix/lint_fix` | ESLint 자동 수정 |
| `gleam run -m mendraw/marketplace` | Marketplace 위젯 다운로드 (인터랙티브, gleam.toml 자동 기록) |
| `gleam run -m glendix/define` | 위젯 프로퍼티 정의 TUI 에디터 |

**PM 감지:** `gleam.toml`의 `[tools.glendix] pm = "pnpm"` 오버라이드 우선. 없으면 lock 파일 기반: `pnpm-lock.yaml` → pnpm / `bun.lockb`·`bun.lock` → bun / 기본값 → npm

---

## 12. 멀티 위젯 컴포넌트

하나의 `.mpk` 파일에 여러 위젯 컴포넌트를 묶어서 개발할 수 있습니다 (예: Charts.mpk).

### 12.1 설정

`package.json`에 `widgets` 맵을 추가합니다:

```json
{
  "widgetName": "AreaChart",
  "widgets": {
    "AreaChart": "area_chart",
    "BarChart": "bar_chart",
    "PieChart": "pie_chart"
  }
}
```

- `widgetName`: 기본 위젯 이름 (`pluggable-widgets-tools` 진입점)
- `widgets`: 컴포넌트명(PascalCase) → Gleam 함수명(snake_case) 맵
- `widgets` 미지정 시 기존 단일 위젯 동작 유지 (하위 호환)

### 12.2 Gleam 코드

메인 모듈에서 모든 위젯 함수를 export합니다:

```gleam
import mendraw/mendix.{type JsProps}
import redraw.{type Element}

pub fn area_chart(props: JsProps) -> Element { ... }
pub fn bar_chart(props: JsProps) -> Element { ... }
pub fn pie_chart(props: JsProps) -> Element { ... }
```

### 12.3 CSS 전략

위젯별 CSS 파일이 있으면 우선 사용, 없으면 공유 CSS 폴백:

1. `src/ui/{ComponentName}.css` 존재 → 해당 파일 import
2. 미존재 + `src/ui/{widgetName}.css` 존재 → 공유 CSS import
3. 둘 다 미존재 → CSS import 생략

### 12.4 Editor Config / Preview

위젯별 파일 → 공유 파일 폴백:

1. `src/{snake_fn}_editor_config.gleam` 존재 → 위젯별 editor config
2. 미존재 + `src/editor_config.gleam` 존재 → 공유 editor config
3. Preview도 동일 패턴 (`{snake_fn}_editor_preview.gleam`)

### 12.5 빌드

`gleam run -m glendix/build` 실행 시 자동으로:

- 각 위젯별 브릿지 파일 (`src/{ComponentName}.js`) 생성
- 기본 위젯은 `pluggable-widgets-tools`가 처리
- 추가 위젯은 rollup config에서 엔트리 자동 추가
- 각 위젯의 XML에서 `id`를 읽어 출력 경로 결정

---

## 13. 실전 패턴

### 12.1 폼 입력 위젯

```gleam
import gleam/option.{None, Some}
import mendraw/mendix
import mendraw/mendix.{type JsProps}
import mendraw/mendix/action
import mendraw/mendix/editable_value as ev
import redraw.{type Element}
import redraw/dom/attribute
import redraw/dom/events
import redraw/dom/html

pub fn text_input_widget(props: JsProps) -> Element {
  let attr = mendix.get_prop(props, "textAttribute")
  let on_enter = mendix.get_prop(props, "onEnterAction")
  let placeholder = mendix.get_string_prop(props, "placeholder")

  case attr {
    Some(text_attr) -> {
      let display = ev.display_value(text_attr)
      let editable = ev.is_editable(text_attr)
      let validation = ev.validation(text_attr)

      html.div([attribute.class("form-group")], [
        html.input([
          attribute.class("form-control"),
          attribute.value(display),
          attribute.placeholder(placeholder),
          attribute.readonly(!editable),
          events.on_change(fn(_e) {
            ev.set_text_value(text_attr, display)
          }),
          events.on_key_down(fn(_e) {
            action.execute_action(on_enter)
          }),
        ]),
        case validation {
          Some(msg) ->
            html.div([attribute.class("alert alert-danger")], [
              html.text(msg),
            ])
          None -> html.none()
        },
      ])
    }
    None -> html.none()
  }
}
```

### 12.2 데이터 테이블 위젯

```gleam
import gleam/list
import gleam/option.{None, Some}
import mendraw/mendix
import mendraw/mendix.{type JsProps}
import mendraw/mendix/editable_value as ev
import mendraw/mendix/list_attribute as la
import mendraw/mendix/list_value as lv
import redraw.{type Element}
import redraw/dom/attribute
import redraw/dom/html

pub fn data_table(props: JsProps) -> Element {
  let ds = mendix.get_prop_required(props, "dataSource")
  let col_name = mendix.get_prop_required(props, "nameColumn")

  html.table([attribute.class("table")], [
    html.tbody([], case lv.items(ds) {
      Some(items) ->
        list.map(items, fn(item) {
          let id = mendix.object_id(item)
          let name = ev.display_value(la.get_attribute(col_name, item))
          html.tr([attribute.key(id)], [
            html.td([], [html.text(name)]),
          ])
        })
      None -> [html.tr([], [html.td([], [html.text("로딩 중...")])])]
    }),
  ])
}
```

### 12.3 검색 가능한 리스트

```gleam
import gleam/option.{None, Some}
import mendraw/mendix
import mendraw/mendix.{type JsProps}
import mendraw/mendix/filter
import mendraw/mendix/list_value as lv
import redraw.{type Element}
import redraw/dom/attribute
import redraw/dom/events
import redraw/dom/html

pub fn searchable_list(props: JsProps) -> Element {
  let ds = mendix.get_prop_required(props, "dataSource")
  let search_attr = mendix.get_string_prop(props, "searchAttribute")
  let #(query, set_query) = redraw.use_state("")

  redraw.use_effect(fn() {
    case query {
      "" -> lv.set_filter(ds, None)
      q -> lv.set_filter(ds, Some(
        filter.contains(filter.attribute(search_attr), filter.literal(q)),
      ))
    }
    Nil
  }, query)

  html.div([], [
    html.input([
      attribute.type_("search"),
      attribute.placeholder("검색..."),
      attribute.value(query),
      events.on_change(fn(_e) { set_query(query) }),
    ]),
    // ... 결과 렌더링
  ])
}
```

---

## 14. 절대 하지 말 것

| 실수 | 올바른 방법 |
|------|------------|
| `import glendix/react` | **삭제됨.** `import redraw` 사용 |
| `react`/`react-dom`을 `dependencies`에 추가 | `pluggable-widgets-tools`가 제공. 직접 넣으면 버전 충돌 |
| 조건 안에서 Hook 호출 | Hook은 항상 함수 최상위에서 호출 |
| `html.text("")`로 빈 렌더링 | `html.none()` 사용 |
| `binding.resolve(m(), "pie_chart")` | JS 원본 이름 유지: `"PieChart"` |
| 외부 React 컴포넌트용 `.mjs` 직접 작성 | `gleam.toml [tools.glendix.bindings]` + `glendix/binding` 사용 |
| `date.month()`에 0-based 값 전달 | glendix가 1↔0 자동 변환 |
| Editor config에서 Gleam List 사용 | 콤마 구분 String 사용 (Jint 호환) |
| FFI `.mjs`에 비즈니스 로직 | `.gleam`에 작성. `.mjs`는 JS 런타임 접근만 |

---

## 15. 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| `react is not defined` | peer dependency 미설치 | `gleam run -m glendix/install` |
| `Cannot read property of undefined` | 없는 prop 접근 | `get_prop` (Option) 사용, prop 이름 확인 |
| Hook 순서 에러 | 조건부 Hook 호출 | 항상 동일 순서로 호출 (React Rules) |
| 바인딩 미생성 | `binding_ffi.mjs` 스텁 상태 | `gleam run -m glendix/install` |
| `could not be resolved` | npm 패키지 미설치 | `npm install <패키지명>` |
| `.env` PAT 오류 | marketplace 인증 실패 | [Developer Settings](https://user-settings.mendix.com/link/developersettings)에서 PAT 재발급 |

---
