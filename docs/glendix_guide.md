
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
gleam run -m glendix/install
```

> `glendix/install`은 패키지 매니저를 자동 감지하여 의존성을 설치하고, `bindings.json`이 있으면 외부 React 컴포넌트 바인딩을, `widgets/` 디렉토리에 `.mpk` 파일이 있으면 위젯 바인딩도 자동 생성합니다.

#### 4) 빌드 확인

```bash
gleam build
```

### 1.3 첫 번째 위젯 만들기

`src/my_widget.gleam` 파일을 생성합니다:

```gleam
import glendix/mendix
import glendix/react.{type JsProps, type ReactElement}
import glendix/react/attribute
import glendix/react/html

pub fn widget(props: JsProps) -> ReactElement {
  let greeting = mendix.get_string_prop(props, "greetingText")

  html.div([attribute.class("my-widget")], [
    html.h1([attribute.class("title")], [react.text(greeting)]),
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
Attribute       // HTML/React 속성
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

### 2.4 Attribute 리스트 API

HTML 속성은 `[attribute.xxx(), event.xxx()]` 선언적 리스트 패턴으로 구성합니다:

```gleam
import glendix/react/attribute
import glendix/react/event

html.button(
  [
    attribute.class("btn btn-primary"),
    attribute.type_("submit"),
    attribute.disabled(False),
    event.on_click(fn(_event) { Nil }),
  ],
  [react.text("Submit")],
)
```

조건부 속성은 `attribute.none()`으로 처리합니다:

```gleam
html.input([
  attribute.class("input"),
  case is_error {
    True -> attribute.class("input-error")
    False -> attribute.none()
  },
])
```

여러 `attribute.class()` 호출 시 자동으로 공백 구분 병합됩니다.

---

## 3. React 바인딩

### 3.1 엘리먼트 생성

`glendix/react` 모듈은 React 엘리먼트를 생성하는 핵심 함수들을 제공합니다.

#### 기본 엘리먼트

```gleam
import glendix/react
import glendix/react/attribute

// Attribute 리스트가 있는 엘리먼트
react.element("div", [attribute.class("container")], [
  react.text("Hello"),
])

// 속성 없이 간단하게
react.element_("div", [
  react.text("Hello"),
])

// Self-closing 엘리먼트 (input, img, br 등)
react.void_element("input", [attribute.type_("text")])
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
  html.h1([attribute.class("title")], [react.text("제목")]),
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

`glendix/binding` 모듈로 외부 React 라이브러리를 **`.mjs` 없이** 사용합니다.

**1단계: `bindings.json` 작성** (프로젝트 루트)

```json
{
  "recharts": {
    "components": ["PieChart", "Pie", "Cell", "LineChart", "Line",
                   "XAxis", "YAxis", "CartesianGrid", "Tooltip", "Legend",
                   "ResponsiveContainer"]
  }
}
```

**2단계: 패키지 설치** — `bindings.json`에 등록한 패키지는 위젯 프로젝트의 `node_modules`에 설치되어 있어야 합니다. 생성된 `binding_ffi.mjs`가 해당 패키지를 직접 import하므로, Rollup이 번들링할 때 resolve할 수 있어야 합니다.

```bash
# 사용 중인 패키지 매니저에 맞게 설치
npm install recharts
# 또는
pnpm add recharts
# 또는
yarn add recharts
# 또는
bun add recharts
```

**3단계: `gleam run -m glendix/install`** 실행 (바인딩 자동 생성)

**4단계: 순수 Gleam 래퍼 모듈 작성** (편의용, 선택사항)

html.gleam과 동일한 호출 패턴으로 작성하면 일관된 API를 제공할 수 있습니다:

```gleam
// src/chart/recharts.gleam — 순수 Gleam, FFI 없음!
import glendix/binding
import glendix/react.{type ReactElement}
import glendix/react/attribute.{type Attribute}

fn m() { binding.module("recharts") }

// attrs + children 컴포넌트 (html.div 패턴)
pub fn pie_chart(attrs: List(Attribute), children: List(ReactElement)) -> ReactElement {
  react.component_el(binding.resolve(m(), "PieChart"), attrs, children)
}

pub fn pie(attrs: List(Attribute), children: List(ReactElement)) -> ReactElement {
  react.component_el(binding.resolve(m(), "Pie"), attrs, children)
}

pub fn responsive_container(attrs: List(Attribute), children: List(ReactElement)) -> ReactElement {
  react.component_el(binding.resolve(m(), "ResponsiveContainer"), attrs, children)
}

// children 없는 컴포넌트 (html.input 패턴)
pub fn cell(attrs: List(Attribute)) -> ReactElement {
  react.void_component_el(binding.resolve(m(), "Cell"), attrs)
}

pub fn tooltip(attrs: List(Attribute)) -> ReactElement {
  react.void_component_el(binding.resolve(m(), "Tooltip"), attrs)
}

pub fn legend(attrs: List(Attribute)) -> ReactElement {
  react.void_component_el(binding.resolve(m(), "Legend"), attrs)
}
```

**5단계: 위젯에서 사용**

html.gleam과 동일한 호출 구조입니다:

```gleam
import chart/recharts
import glendix/react
import glendix/react/attribute

pub fn my_pie_chart(data) -> react.ReactElement {
  recharts.responsive_container(
    [attribute.attribute("width", 400), attribute.attribute("height", 300)],
    [
      recharts.pie_chart([], [
        recharts.pie(
          [attribute.attribute("data", data), attribute.attribute("dataKey", "value")],
          [],
        ),
        recharts.tooltip([]),
        recharts.legend([]),
      ]),
    ],
  )
}
```

래퍼 모듈 없이 직접 사용하는 것도 가능합니다:

```gleam
import glendix/binding

let rc = binding.module("recharts")
react.component_el(binding.resolve(rc, "PieChart"), attrs, children)
react.void_component_el(binding.resolve(rc, "Tooltip"), attrs)
```

#### .mpk 위젯 컴포넌트 사용

`glendix/widget` 모듈로 `widgets/` 디렉토리의 `.mpk` 파일(Mendix 위젯 빌드 결과물)을 React 컴포넌트로 사용합니다. 다른 위젯 안에서 기존 Mendix 위젯을 렌더링할 때 유용합니다.

**1단계: `.mpk` 파일 배치**

프로젝트 루트에 `widgets/` 디렉토리를 만들고 `.mpk` 파일을 복사합니다:

```
my_widget/
├── widgets/
│   ├── Switch.mpk
│   └── Badge.mpk
├── src/
├── gleam.toml
└── ...
```

**2단계: `gleam run -m glendix/install`** 실행 (위젯 바인딩 자동 생성)

install 시 두 가지가 자동 수행됩니다:
- `.mpk` 내부의 `.mjs`와 `.css`가 추출되고, `widget_ffi.mjs`가 생성됩니다
- `.mpk` XML의 `<property>` 정의가 부모 위젯 XML(`src/{WidgetName}.xml`)에 `<propertyGroup caption="{위젯명}">` 으로 자동 주입됩니다 (동일 caption이 이미 있으면 건너뜀)

예를 들어 `Switch.mpk`를 설치하면, 부모 위젯 XML에 다음이 자동 추가됩니다:

```xml
<propertyGroup caption="Switch">
    <property key="booleanAttribute" type="attribute">
        <caption>Boolean attribute</caption>
        <description>Attribute to toggle</description>
        <attributeTypes>
            <attributeType name="Boolean" />
        </attributeTypes>
    </property>
    <property key="action" type="action" required="false">
        <caption>On change</caption>
        <description>Action to be performed when the switch is toggled</description>
    </property>
</propertyGroup>
```

**3단계: Gleam 코드에서 사용**

```gleam
import glendix/mendix
import glendix/widget
import glendix/react
import glendix/react/attribute

// props에서 자동 주입된 속성을 읽어 위젯에 전달
let boolean_attr = mendix.get_prop_required(props, "booleanAttribute")
let action = mendix.get_prop_required(props, "action")

// widgets/Switch.mpk의 Switch 컴포넌트 사용
let switch_comp = widget.component("Switch")
react.component_el(switch_comp, [
  attribute.attribute("booleanAttribute", boolean_attr),
  attribute.attribute("action", action),
], [])
```

위젯의 Props는 기존 `attribute.attribute(key, value)` 범용 함수로 전달합니다. 위젯 이름은 `.mpk` 내부 XML의 `<name>` 태그 값(PascalCase)을, property key는 `.mpk` XML의 원본 key를 그대로 사용합니다.

> `binding` 모듈과 달리 `widget` 모듈은 1 mpk = 1 컴포넌트이므로 `module` + `resolve` 2단계 없이 `component("Name")` 한 번에 가져옵니다.

### 3.2 HTML 속성

`glendix/react/attribute` 모듈은 90+ HTML 속성 함수를 제공합니다.

#### 범용 속성

```gleam
import glendix/react/attribute

// escape hatch — 임의의 속성 설정
attribute.attribute("data-custom", "value")

// aria-* 속성
attribute.aria("label", "닫기 버튼")

// data-* 속성
attribute.data("testid", "my-element")
```

#### 자주 쓰는 속성

```gleam
attribute.class("btn btn-primary")    // className (자동 병합)
attribute.classes(["btn", "large"])   // 여러 클래스 공백 결합
attribute.id("main-card")
attribute.key("item-1")              // React key
attribute.ref(my_ref)                // React ref
attribute.ref_(fn(el) { Nil })       // callback ref
```

#### 폼 속성

```gleam
attribute.type_("text")
attribute.value("입력값")
attribute.placeholder("입력하세요")
attribute.name("username")
attribute.disabled(True)
attribute.checked(True)
attribute.readonly(True)
attribute.required(True)
attribute.max_length(100)
attribute.min_length(3)
attribute.pattern("[0-9]+")
attribute.autocomplete("email")
attribute.autofocus(True)
```

#### 인라인 스타일

```gleam
// CSS 속성명 자동 camelCase 변환
attribute.style([
  #("background-color", "#f0f0f0"),
  #("padding", "16px"),
  #("border-radius", "8px"),
])
```

#### 미디어/리소스 속성

```gleam
attribute.src("image.png")
attribute.alt("설명")
attribute.loading("lazy")             // 지연 로딩
attribute.fetch_priority("high")      // 로딩 우선순위
attribute.cross_origin("anonymous")
attribute.srcset("img-2x.png 2x")
attribute.sizes("(max-width: 600px) 100vw")
```

#### 모바일/국제화 속성 (Round 3)

```gleam
attribute.input_mode("numeric")       // 가상 키보드
attribute.enter_key_hint("search")    // Enter 키 동작
attribute.auto_capitalize("words")    // 대문자 변환
attribute.capture_("environment")     // 카메라 선택
```

#### Popover API (Round 3)

```gleam
html.button(
  [
    attribute.popover_target("my-popover"),
    attribute.popover_target_action("toggle"),
  ],
  [react.text("열기")],
)

html.div(
  [attribute.id("my-popover"), attribute.popover("auto")],
  [react.text("팝오버 내용")],
)
```

### 3.3 이벤트 핸들러

`glendix/react/event` 모듈은 15개 이벤트 타입과 148+ 핸들러를 제공합니다.

#### 이벤트 타입

| 타입 | 용도 |
|---|---|
| `Event` | 기본/미디어/UI 이벤트 |
| `MouseEvent` | 클릭, 마우스 이벤트 |
| `ChangeEvent` | input 변경 이벤트 |
| `KeyboardEvent` | 키보드 이벤트 |
| `FormEvent` | 폼 제출 이벤트 |
| `FocusEvent` | 포커스/블러 이벤트 |
| `InputEvent` | 입력/beforeinput 이벤트 |
| `PointerEvent` | 포인터 이벤트 |
| `DragEvent` | 드래그 앤 드롭 이벤트 |
| `ClipboardEvent` | 복사/잘라내기/붙여넣기 |
| `TouchEvent` | 터치 이벤트 |
| `WheelEvent` | 휠 스크롤 이벤트 |
| `AnimationEvent` | CSS 애니메이션 이벤트 |
| `TransitionEvent` | CSS 트랜지션 이벤트 |
| `CompositionEvent` | CJK/IME 입력 이벤트 |

#### 핸들러 사용

```gleam
import glendix/react/event

// 마우스 이벤트
event.on_click(fn(e) { handle_click(e) })
event.on_double_click(fn(e) { Nil })
event.on_context_menu(fn(e) { Nil })
event.on_mouse_enter(fn(e) { Nil })

// 키보드 이벤트
event.on_key_down(fn(e) {
  case event.key(e) {
    "Enter" -> submit()
    "Escape" -> cancel()
    _ -> Nil
  }
})

// 폼/입력 이벤트
event.on_change(fn(e) { set_name(event.target_value(e)) })
event.on_input(fn(e) { Nil })
event.on_submit(fn(e) {
  event.prevent_default(e)
  handle_submit()
})

// 포커스 이벤트
event.on_focus(fn(e) { Nil })
event.on_blur(fn(e) { Nil })

// 로드/에러 이벤트 (Round 3)
event.on_load(fn(e) { Nil })       // img/iframe/script 로드 완료
event.on_error(fn(e) { Nil })      // 리소스 로드 실패

// 입력 전 이벤트 (Round 3)
event.on_before_input(fn(e) { Nil })  // 입력 값 변경 전 필터링

// 미디어 이벤트
event.on_play(fn(e) { Nil })
event.on_pause(fn(e) { Nil })
event.on_time_update(fn(e) { Nil })
event.on_load_start(fn(e) { Nil })    // 미디어 로드 시작 (Round 3)

// 드래그 이벤트
event.on_drag_start(fn(e) { Nil })
event.on_drop(fn(e) { Nil })

// 컴포지션 이벤트 (한국어 입력 필수)
event.on_composition_start(fn(e) { Nil })
event.on_composition_end(fn(e) { Nil })

// 캡처 단계 (모든 핸들러에 _capture 접미사)
event.on_click_capture(fn(e) { Nil })
event.on_key_down_capture(fn(e) { Nil })

// 범용 이벤트 핸들러 (escape hatch)
event.on("onCustomEvent", fn(e) { Nil })
```

#### 이벤트 접근자

```gleam
// 공통
event.target(e)              // 이벤트 대상 요소 (Dynamic)
event.current_target(e)      // 핸들러가 등록된 요소 (Dynamic)
event.target_value(e)        // input/textarea 값 (String)
event.prevent_default(e)     // 기본 동작 방지
event.stop_propagation(e)    // 전파 중지
event.bubbles(e)             // 버블링 여부 (Bool)
event.cancelable(e)          // 취소 가능 여부 (Bool)
event.is_trusted(e)          // 사용자 발생 여부 (Bool)
event.time_stamp(e)          // 타임스탬프 (Float)
event.native_event(e)        // 네이티브 브라우저 이벤트 (Dynamic)
event.is_default_prevented(e)
event.is_propagation_stopped(e)

// 이벤트 유틸리티 (Round 3)
event.persist(e)             // 이벤트 풀링 방지 (React 17+ 호환)
event.is_persistent(e)       // 영속적 여부 (Bool)

// 마우스
event.client_x(e)            // Float
event.client_y(e)            // Float
event.page_x(e)
event.page_y(e)
event.offset_x(e)
event.offset_y(e)
event.screen_x(e)
event.screen_y(e)
event.movement_x(e)
event.movement_y(e)
event.button(e)              // Int (0=좌, 1=중, 2=우)
event.buttons(e)
event.mouse_ctrl_key(e)
event.mouse_shift_key(e)
event.mouse_alt_key(e)
event.mouse_meta_key(e)
event.get_modifier_state(e, "Control")

// 키보드
event.key(e)                 // "Enter", "Escape" 등
event.code(e)                // "KeyA", "Space" 등
event.ctrl_key(e)
event.shift_key(e)
event.alt_key(e)
event.meta_key(e)
event.repeat(e)

// 휠
event.delta_x(e)
event.delta_y(e)
event.delta_z(e)
event.delta_mode(e)

// 터치
event.touches(e)             // Dynamic
event.changed_touches(e)
event.target_touches(e)

// 포인터
event.pointer_id(e)
event.pointer_type(e)        // "mouse", "pen", "touch"
event.pressure(e)
event.tilt_x(e)
event.tilt_y(e)
event.pointer_width(e)
event.pointer_height(e)
event.is_primary(e)

// 애니메이션
event.animation_name(e)
event.animation_elapsed_time(e)
event.animation_pseudo_element(e)

// 트랜지션
event.property_name(e)
event.transition_elapsed_time(e)
event.transition_pseudo_element(e)

// 드래그
event.data_transfer(e)       // Dynamic

// 포커스
event.focus_related_target(e) // Dynamic

// 컴포지션
event.composition_data(e)    // String

// 입력
event.input_data(e)          // String

// 클립보드
event.clipboard_data(e)      // Dynamic
```

### 3.4 HTML 태그 함수

`glendix/react/html` 모듈은 75+ HTML 태그를 위한 편의 함수를 제공합니다. 순수 Gleam으로 구현되어 FFI가 없습니다.

```gleam
import glendix/react/html
import glendix/react/attribute

// Attribute 리스트가 있는 버전
html.div([attribute.class("container")], children)
html.button([attribute.type_("submit"), event.on_click(handler)], children)
html.input([attribute.type_("text"), attribute.value(val)])  // void 엘리먼트

// Attribute 없는 버전 (언더스코어 접미사)
html.div_(children)
html.span_([react.text("텍스트")])
html.p_([react.text("문단")])
```

#### 사용 가능한 태그 목록

| 카테고리 | 태그 |
|---|---|
| **컨테이너** | `div`, `span`, `section`, `main`, `header`, `footer`, `nav`, `aside`, `article` |
| **텍스트** | `p`, `h1`~`h6`, `strong`, `em`, `small`, `pre`, `code`, `kbd`, `samp`, `var_` |
| **리스트** | `ul`, `ol`, `li`, `dl`, `dt`, `dd` |
| **폼** | `form`, `button`, `label`, `select`, `option`, `textarea`, `fieldset`, `legend`, `datalist`, `optgroup`, `output` |
| **입력** | `input` (void) |
| **테이블** | `table`, `thead`, `tbody`, `tfoot`, `tr`, `td`, `th`, `colgroup`, `col` (void), `caption` |
| **링크/미디어** | `a`, `img` (void), `br` (void), `hr` (void), `video`, `audio`, `source` (void), `track` (void), `picture`, `canvas`, `iframe` (void) |
| **시맨틱** | `details`, `summary`, `dialog`, `figure`, `figcaption`, `blockquote`, `cite`, `abbr`, `mark`, `del`, `ins`, `sub`, `sup`, `time`, `address`, `meter`, `progress` (void), `search`, `hgroup` |
| **루비 주석** | `ruby`, `rt`, `rp` |
| **양방향 텍스트** | `bdi`, `bdo` |
| **기타** | `data_`, `map_`, `wbr` (void), `embed` (void), `area` (void) |

### 3.5 SVG 요소

`glendix/react/svg` 모듈은 57개 SVG 요소를 제공합니다. 순수 Gleam, FFI 없음.

```gleam
import glendix/react/svg
import glendix/react/svg_attribute as sa

svg.svg([sa.view_box("0 0 100 100"), sa.xmlns("http://www.w3.org/2000/svg")], [
  svg.circle([sa.cx("50"), sa.cy("50"), sa.r("40"), sa.fill("blue")], []),
  svg.text([sa.x("50"), sa.y("55"), sa.text_anchor("middle"), sa.fill("white")], [
    react.text("Hello"),
  ]),
])
```

#### SVG 요소 목록

| 카테고리 | 요소 |
|---|---|
| **컨테이너** | `svg`, `g`, `defs`, `symbol`, `use_`, `marker` |
| **도형** | `circle`, `ellipse`, `line`, `path`, `polygon`, `polyline`, `rect` |
| **텍스트** | `text`, `tspan`, `text_path` |
| **그래디언트/패턴** | `linear_gradient`, `radial_gradient`, `stop` (void), `pattern` |
| **필터** | `filter`, `fe_color_matrix`, `fe_composite`, `fe_flood` (void), `fe_gaussian_blur` (void), `fe_merge`, `fe_merge_node` (void), `fe_offset` (void), `fe_blend` (void), `fe_drop_shadow` (void) |
| **필터 프리미티브** | `fe_convolve_matrix`, `fe_diffuse_lighting`, `fe_displacement_map` (void), `fe_distant_light` (void), `fe_image` (void), `fe_morphology` (void), `fe_point_light` (void), `fe_specular_lighting`, `fe_spot_light` (void), `fe_tile`, `fe_turbulence` (void), `fe_func_r/g/b/a` (void), `fe_component_transfer` |
| **클리핑/마스킹** | `clip_path`, `mask` |
| **애니메이션** | `animate` (void), `animate_transform` (void), `set` (void), `mpath` (void) |
| **기타** | `foreign_object`, `image` (void), `title`, `desc`, `switch_` |

### 3.6 SVG 속성

`glendix/react/svg_attribute` 모듈은 97+ SVG 전용 속성을 제공합니다. 순수 Gleam, FFI 없음.

```gleam
import glendix/react/svg_attribute as sa

sa.view_box("0 0 100 100")
sa.fill("red")
sa.stroke("black")
sa.stroke_width("2")
sa.transform("rotate(45)")
sa.d("M10 10 L90 90")         // path 데이터
```

#### SVG 속성 목록

| 카테고리 | 속성 |
|---|---|
| **공통** | `view_box`, `xmlns`, `fill`, `stroke`, `stroke_width`, `stroke_linecap`, `stroke_linejoin`, `stroke_dasharray`, `stroke_dashoffset`, `stroke_opacity`, `fill_opacity`, `fill_rule`, `clip_rule`, `opacity`, `transform` |
| **좌표** | `x`, `y`, `x1`, `y1`, `x2`, `y2`, `cx`, `cy`, `r`, `rx`, `ry`, `dx`, `dy` |
| **도형** | `d`, `points`, `path_length` |
| **그래디언트** | `offset`, `stop_color`, `stop_opacity`, `gradient_units`, `gradient_transform`, `spread_method`, `fx`, `fy` |
| **텍스트** | `text_anchor`, `dominant_baseline`, `font_size`, `font_family`, `font_weight`, `letter_spacing`, `text_decoration`, `alignment_baseline`, `baseline_shift`, `writing_mode`, `text_rendering` |
| **참조** | `href`, `xlink_href` |
| **필터** | `filter_attr`, `in_`, `in2`, `result`, `std_deviation`, `flood_color`, `flood_opacity`, `values`, `mode`, `operator_`, `k1`~`k4`, `scale`, `x_channel_selector`, `y_channel_selector` |
| **마커** | `marker_start`, `marker_mid`, `marker_end`, `marker_height`, `marker_width`, `ref_x`, `ref_y`, `orient` |
| **패턴** | `pattern_units`, `pattern_transform`, `pattern_content_units` |
| **클리핑/마스킹** | `clip_path_attr`, `mask_attr`, `clip_path_units`, `mask_units`, `mask_content_units` |
| **렌더링** | `image_rendering`, `shape_rendering`, `color_interpolation`, `color_interpolation_filters` |
| **기타** | `preserve_aspect_ratio`, `overflow`, `cursor`, `visibility`, `pointer_events`, `color`, `display`, `enable_background`, `lighting_color` |

### 3.7 React Hooks

`glendix/react/hook` 모듈은 37개 React Hooks를 제공합니다.

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
      [event.on_click(fn(_) { set_count(count + 1) })],
      [react.text("+1")],
    ),
  ])
}

// 업데이터 함수 변형 (stale closure 방지)
let #(count, update_count) = hook.use_state_(0)
update_count(fn(prev) { prev + 1 })

// 지연 초기화 (비싼 초기값 계산 방지)
let #(data, set_data) = hook.use_lazy_state(fn() {
  compute_expensive_initial_value()
})
```

#### useEffect — 사이드 이펙트

```gleam
// 의존성 배열 지정
hook.use_effect(fn() {
  // count가 변경될 때마다 실행
  Nil
}, [count])

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
}, [dependency])

hook.use_effect_always_cleanup(fn() {
  fn() { /* 매 렌더 후 클린업 */ }
})
```

#### useLayoutEffect — 동기 레이아웃 이펙트

```gleam
// DOM 변경 후 브라우저 페인트 전 동기 실행
hook.use_layout_effect(fn() {
  // DOM 측정 로직
  Nil
}, [some_dep])

// cleanup 변형도 동일 패턴
hook.use_layout_effect_once_cleanup(fn() {
  fn() { Nil }
})
```

#### useInsertionEffect — CSS-in-JS용

```gleam
// DOM 변경 전 실행 (CSS-in-JS 라이브러리용)
hook.use_insertion_effect(fn() {
  // 스타일 삽입
  Nil
}, [theme])
```

#### useMemo — 메모이제이션

```gleam
// 값이 비용이 클 때 메모이제이션
let expensive_result = hook.use_memo(fn() {
  compute_expensive_value(data)
}, [data])
```

#### useCallback — 콜백 메모이제이션

```gleam
// 콜백 함수 메모이제이션 (자식 컴포넌트에 전달할 때 유용)
let handle_click = hook.use_callback(fn(event) {
  set_count(count + 1)
}, [count])
```

#### useRef — 참조

```gleam
let input_ref = hook.use_ref(Nil)

// ref 값 읽기
let current = hook.get_ref(input_ref)

// ref 값 쓰기
hook.set_ref(input_ref, new_value)

// DOM 요소에 연결
html.input([attribute.ref(input_ref)])
```

#### useReducer — 리듀서 기반 상태

```gleam
let #(state, dispatch) = hook.use_reducer(
  fn(state, action) {
    case action {
      Increment -> State(..state, count: state.count + 1)
      Decrement -> State(..state, count: state.count - 1)
    }
  },
  initial_state,
)

dispatch(Increment)
```

#### useContext — Context 값 읽기

```gleam
let theme = hook.use_context(theme_context)
```

#### useId — 고유 ID 생성

```gleam
let id = hook.use_id()  // SSR-safe 고유 ID
```

#### useTransition — 비긴급 업데이트

```gleam
let #(is_pending, start_transition) = hook.use_transition()

start_transition(fn() {
  // 비긴급 상태 업데이트
  set_search_results(filter(data, query))
})
```

#### useDeferredValue — 값 지연

```gleam
let deferred_query = hook.use_deferred_value(query)
```

#### useOptimistic — 낙관적 UI (React 19)

```gleam
// 간단한 형태
let #(optimistic_items, add_optimistic) = hook.use_optimistic(items)
add_optimistic(new_item)

// 리듀서 변형 — 업데이트 함수로 병합 로직 지정 (Round 3)
let #(optimistic_items, add_optimistic) = hook.use_optimistic_(
  items,
  fn(current, new_item) { list.append(current, [new_item]) },
)
add_optimistic(new_item)
```

#### useImperativeHandle — ref 커스터마이징

```gleam
hook.use_imperative_handle(ref, fn() {
  // 부모에게 노출할 인터페이스
  my_interface
}, [dep])
```

#### useSyncExternalStore — 외부 스토어

```gleam
let value = hook.use_sync_external_store(subscribe, get_snapshot)
```

#### useDebugValue — DevTools 디버그

```gleam
hook.use_debug_value(state)
hook.use_debug_value_(state, fn(s) { "State: " <> string.inspect(s) })
```

### 3.8 조건부 렌더링

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

### 3.9 리스트 렌더링

```gleam
import gleam/list

// 리스트를 map하여 엘리먼트 생성
let items = ["사과", "바나나", "체리"]

html.ul_(
  list.map(items, fn(item) {
    html.li([attribute.key(item)], [
      react.text(item),
    ])
  }),
)

// 인덱스가 필요한 경우
list.index_map(items, fn(item, idx) {
  html.li([attribute.key(int.to_string(idx))], [
    react.text(item),
  ])
})
```

> 리스트 렌더링 시 항상 `attribute.key()`를 설정하세요. React의 reconciliation에 필요합니다.

### 3.10 인라인 스타일

```gleam
import glendix/react/attribute

// 튜플 리스트로 스타일 지정 (CSS 속성명은 자동 camelCase 변환)
html.div(
  [attribute.style([
    #("background-color", "#f0f0f0"),
    #("padding", "16px"),
    #("border-radius", "8px"),
  ])],
  children,
)
```

### 3.11 고급 컴포넌트

#### 컴포넌트 정의

```gleam
// 이름 있는 컴포넌트 (DevTools에 표시)
let my_component = react.define_component("MyComponent", fn(props) {
  html.div_([react.text("Hello")])
})

// React.memo (props 동일 시 리렌더 방지)
let memoized = react.memo(my_component)

// 커스텀 비교 함수
let memoized = react.memo_(my_component, fn(prev, next) {
  // True면 리렌더 건너뜀
  prev == next
})
```

#### StrictMode

```gleam
react.strict_mode([
  // 개발 모드 이중 렌더링 감지
  my_widget(props),
])
```

#### Suspense

```gleam
react.suspense(
  html.div_([react.text("로딩 중...")]),  // fallback
  [lazy_component],                       // children
)
```

#### Portal

```gleam
// 위젯 DOM 외부에 렌더링 (모달, 팝업)
react.portal(modal_element, document_body)
```

#### forwardRef

```gleam
let fancy_input = react.forward_ref(fn(props, ref) {
  html.input([attribute.ref(ref), attribute.class("fancy")])
})
```

#### startTransition / flushSync

```gleam
// 훅 없이 비긴급 업데이트 표시
react.start_transition(fn() {
  set_data(new_data)
})

// 동기 DOM 업데이트 강제 (상태 변경 후 DOM 측정 시 필요) (Round 3)
react.flush_sync(fn() {
  set_count(count + 1)
})
// 이 시점에 DOM이 이미 업데이트되어 있음
```

#### Profiler

```gleam
react.profiler("MyWidget", fn(id, phase, actual, base, start, commit) {
  // 렌더링 성능 측정
  Nil
}, [my_widget(props)])
```

#### Context API

```gleam
// Context 생성
let theme_ctx = react.create_context("light")

// Provider로 값 공급
react.provider(theme_ctx, "dark", [
  child_component,
])

// 소비 (hook)
let theme = hook.use_context(theme_ctx)
```

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
    html.input([
      attribute.value(display),
      attribute.readonly(!is_editable),
      event.on_change(fn(e) {
        // 텍스트로 값 설정 (Mendix가 파싱)
        ev.set_text_value(attr, event.target_value(e))
      }),
    ]),
    // 유효성 검사 에러 표시
    react.when_some(validation_msg, fn(msg) {
      html.span([attribute.class("text-danger")], [
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
    [
      attribute.class("btn"),
      attribute.disabled(case on_click {
        Some(a) -> !action.can_execute(a)
        None -> True
      }),
      event.on_click(fn(_) {
        // Option(ActionValue) 안전하게 실행
        action.execute_action(on_click)
      }),
    ],
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
          html.li([attribute.key(id)], [
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
      html.table_([
        html.tbody_(
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

            html.tr([attribute.key(id)], [
              html.td_([react.text(display)]),
              html.td_([
                html.button(
                  [event.on_click(fn(_) {
                    action.execute_action(action_opt)
                  })],
                  [react.text("편집")],
                ),
              ]),
            ])
          }),
        ),
      ])
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
  html.div([attribute.key(mendix.object_id(item))], [
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

`glendix/mendix/reference`로 단일 연관 관계, `glendix/mendix/reference_set`으로 다중 연관 관계를 다룹니다.

```gleam
import glendix/mendix/reference as ref
import glendix/mendix/reference_set as ref_set

// 단일 참조 (1:1, N:1)
let referenced = ref.value(my_ref)         // Option(a)
let is_readonly = ref.read_only(my_ref)    // Bool
let error = ref.validation(my_ref)         // Option(String)

ref.set_value(my_ref, Some(new_item))      // 참조 설정
ref.set_value(my_ref, None)                // 참조 해제

// 다중 참조 (M:N)
let items = ref_set.value(my_ref_set)      // Option(List(a))
ref_set.set_value(my_ref_set, Some([item1, item2]))
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

html.img([
  attribute.src(src),
  attribute.alt(option.unwrap(alt, "")),
])
```

#### WebIcon

```gleam
import glendix/mendix/icon

case icon.icon_type(my_icon) {
  icon.Glyph ->
    html.span([attribute.class(icon.icon_class(my_icon))], [])
  icon.Image ->
    html.img([attribute.src(icon.icon_url(my_icon))])
  icon.IconFont ->
    html.span([attribute.class(icon.icon_class(my_icon))], [])
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

### 4.12 Editor Configuration — 조건부 속성 제어

Studio Pro의 editorConfig에서 속성을 조건부로 숨기거나, 그룹을 탭으로 변환하는 등의 작업을 순수 Gleam으로 작성할 수 있습니다. `@mendix/pluggable-widgets-tools`의 헬퍼 함수를 래핑합니다.

#### Properties 타입

`Properties`는 Studio Pro가 `getProperties`에 전달하는 `PropertyGroup[]` 배열의 opaque 래퍼입니다. 모든 함수가 `Properties`를 반환하므로 파이프라인 체이닝이 가능합니다.

#### 속성 숨기기

```gleam
import glendix/editor_config.{type Properties}

// 단일 속성 숨기기
let props = editor_config.hide_property(default_properties, "barWidth")

// 여러 속성 한 번에 숨기기
let props = editor_config.hide_properties(default_properties, ["barWidth", "barColor"])

// 중첩 속성 숨기기 (배열 타입 속성의 특정 인덱스 내부)
let props = editor_config.hide_nested_property(default_properties, "columns", 0, "width")

// 여러 중첩 속성 한 번에 숨기기
let props = editor_config.hide_nested_properties(default_properties, "columns", 0, ["width", "alignment"])
```

#### 탭 변환 / 속성 순서 변경

```gleam
// 속성 그룹을 탭으로 변환 (웹 플랫폼용)
let props = editor_config.transform_groups_into_tabs(default_properties)

// 속성 순서 변경 (from_index → to_index)
let props = editor_config.move_property(default_properties, 0, 2)
```

#### 실전 예시 — 차트 유형별 조건부 속성

사용자의 `src/editor_config.gleam`에서 `getProperties` 로직을 작성합니다. 이 파일이 존재하면 `run_with_bridge` 실행 시 editorConfig 브릿지 JS가 자동 생성됩니다.

```gleam
import glendix/editor_config.{type Properties}
import glendix/mendix
import glendix/react.{type JsProps}

pub fn get_properties(
  values: JsProps,
  default_properties: Properties,
  platform: String,
) -> Properties {
  let chart_type = mendix.get_string_prop(values, "chartType")

  let props = case chart_type {
    "line" ->
      default_properties
      |> editor_config.hide_properties(["barWidth", "barColor"])
    "bar" ->
      default_properties
      |> editor_config.hide_properties(["lineStyle", "lineCurve"])
    _ -> default_properties
  }

  case platform {
    "web" -> editor_config.transform_groups_into_tabs(props)
    _ -> props
  }
}
```

#### 함수 요약

| 함수 | 설명 |
|------|------|
| `hide_property(properties, key)` | 단일 속성 숨기기 |
| `hide_properties(properties, keys)` | 여러 속성 한 번에 숨기기 |
| `hide_nested_property(properties, key, index, nested_key)` | 중첩 속성 숨기기 |
| `hide_nested_properties(properties, key, index, nested_keys)` | 여러 중첩 속성 숨기기 |
| `transform_groups_into_tabs(properties)` | 그룹 → 탭 변환 |
| `move_property(properties, from_index, to_index)` | 속성 순서 변경 |

---

## 5. 실전 패턴

### 5.1 폼 입력 위젯

```gleam
import gleam/option.{None, Some}
import glendix/mendix
import glendix/mendix/action
import glendix/mendix/editable_value as ev
import glendix/react.{type JsProps, type ReactElement}
import glendix/react/attribute
import glendix/react/event
import glendix/react/hook
import glendix/react/html

pub fn text_input_widget(props: JsProps) -> ReactElement {
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
          event.on_change(fn(e) {
            ev.set_text_value(text_attr, event.target_value(e))
          }),
          event.on_key_down(fn(e) {
            case event.key(e) {
              "Enter" -> action.execute_action(on_enter)
              _ -> Nil
            }
          }),
        ]),
        // 유효성 검사 메시지
        react.when_some(validation, fn(msg) {
          html.div([attribute.class("alert alert-danger")], [
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
import glendix/react/attribute
import glendix/react/event
import glendix/react/html

pub fn data_table(props: JsProps) -> ReactElement {
  let ds = mendix.get_prop_required(props, "dataSource")
  let col_name = mendix.get_prop_required(props, "nameColumn")
  let col_status = mendix.get_prop_required(props, "statusColumn")

  html.div([attribute.class("table-responsive")], [
    html.table([attribute.class("table table-striped")], [
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

              html.tr([attribute.key(id)], [
                html.td_([react.text(name)]),
                html.td_([react.text(status)]),
              ])
            })
          None -> [
            html.tr_([
              html.td(
                [attribute.col_span(2)],
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

  html.div([attribute.class("pagination")], [
    html.button(
      [
        attribute.disabled(offset == 0),
        event.on_click(fn(_) {
          lv.set_offset(ds, int.max(0, offset - limit))
        }),
      ],
      [react.text("이전")],
    ),
    html.button(
      [
        attribute.disabled(has_more == Some(False)),
        event.on_click(fn(_) {
          lv.set_offset(ds, offset + limit)
        }),
      ],
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
import glendix/react/attribute
import glendix/react/event
import glendix/react/hook
import glendix/react/html

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
  }, [query])

  html.div_([
    // 검색 입력
    html.input([
      attribute.class("form-control"),
      attribute.type_("search"),
      attribute.placeholder("검색..."),
      attribute.value(query),
      event.on_change(fn(e) { set_query(event.target_value(e)) }),
    ]),
    // 결과 리스트 렌더링
    render_results(ds),
  ])
}
```

### 5.4 컴포넌트 합성

Gleam 함수를 컴포넌트처럼 활용하여 UI를 분리합니다:

```gleam
import glendix/react.{type ReactElement}
import glendix/react/attribute
import glendix/react/html

// 재사용 가능한 카드 컴포넌트
fn card(title: String, children: List(ReactElement)) -> ReactElement {
  html.div([attribute.class("card")], [
    html.div([attribute.class("card-header")], [
      html.h3_([react.text(title)]),
    ]),
    html.div([attribute.class("card-body")], children),
  ])
}

// 재사용 가능한 빈 상태 컴포넌트
fn empty_state(message: String) -> ReactElement {
  html.div([attribute.class("empty-state")], [
    html.p_([react.text(message)]),
  ])
}

// 조합하여 사용
pub fn dashboard(props) -> ReactElement {
  html.div([attribute.class("dashboard")], [
    card("사용자 목록", [
      // 리스트 내용...
    ]),
    card("최근 활동", [
      empty_state("아직 활동이 없습니다."),
    ]),
  ])
}
```

### 5.5 SVG 아이콘 컴포넌트

```gleam
import glendix/react.{type ReactElement}
import glendix/react/attribute
import glendix/react/svg
import glendix/react/svg_attribute as sa

fn check_icon(size: String) -> ReactElement {
  svg.svg(
    [
      sa.view_box("0 0 24 24"),
      attribute.width(size),
      attribute.height(size),
      sa.fill("none"),
      sa.stroke("currentColor"),
      sa.stroke_width("2"),
      sa.stroke_linecap("round"),
      sa.stroke_linejoin("round"),
    ],
    [svg.path([sa.d("M20 6L9 17l-5-5")], [])],
  )
}
```

### 5.6 Marketplace 위젯 다운로드

Mendix Marketplace에서 위젯(.mpk)을 인터랙티브하게 검색하고 다운로드할 수 있습니다. 다운로드 완료 후 바인딩 `.gleam` 파일이 자동 생성되어, 별도의 수동 설정 없이 바로 사용할 수 있습니다.

#### 사전 준비

`.env` 파일에 Mendix Personal Access Token을 설정합니다:

```
MENDIX_PAT=your_personal_access_token
```

> PAT는 [Mendix Developer Settings](https://user-settings.mendix.com/link/developersettings)에서 **Personal Access Tokens** 섹션의 **New Token**을 클릭하여 발급합니다.
> 필요한 scope: `mx:marketplace-content:read`

#### 실행

```bash
gleam run -m glendix/marketplace
```

#### 인터랙티브 TUI

실행하면 Content API(`GET /content`)로 위젯 목록을 로드하고, 인터랙티브 TUI가 표시됩니다:

```
  ── 페이지 1/5+ ──

  [0] Star Rating (54611) v3.2.2 — Mendix
  [1] Switch (50324) v4.0.0 — Mendix
  [2] Progress Bar (48019) v3.1.0 — Mendix
  ...

  번호: 다운로드 | 검색어: 이름 검색 | n: 다음 | p: 이전 | r: 초기화 | q: 종료

>
```

**주요 명령어:**

| 입력 | 동작 |
|------|------|
| `0` | 0번 위젯 다운로드 |
| `0,1,3` | 여러 위젯 동시 다운로드 (쉼표 구분) |
| `star` | 이름/퍼블리셔로 검색 필터링 |
| `n` / `p` | 다음/이전 페이지 |
| `r` | 검색 초기화 (전체 목록 복귀) |
| `q` | 종료 |

#### 버전 선택

위젯을 선택하면 버전 목록이 표시됩니다. Pluggable/Classic 타입이 자동 구분됩니다:

```
  Star Rating — 버전 선택:

    [0] v3.2.2 (2024-01-15) (Mendix ≥9.24.0) [Pluggable]  ← 기본
    [1] v3.1.0 (2023-08-20) (Mendix ≥9.18.0) [Pluggable]
    [2] v2.5.1 (2022-03-10) (Mendix ≥8.0.0) [Classic]

  버전 번호 (Enter=최신):
```

Enter를 누르면 최신 버전이 다운로드됩니다.

#### 동작 흐름

1. **첫 배치 로드** — Content API에서 첫 40개 아이템을 직접 로드하여 즉시 표시
2. **백그라운드 로드** — 나머지 아이템을 별도 프로세스에서 비동기 로드 (`.marketplace-cache/`에 캐시)
3. **위젯 선택 시** — Playwright(headless chromium)로 Marketplace 페이지에서 S3 다운로드 URL 추출
4. **다운로드** — S3에서 `.mpk` 파일을 `widgets/` 디렉토리에 저장
5. **바인딩 생성** — `cmd.generate_widget_bindings()`가 자동 호출되어 `src/widgets/`에 바인딩 `.gleam` 파일 생성

> 버전 정보 조회에 Playwright를 사용하므로, 첫 다운로드 시 브라우저 로그인이 필요합니다. 세션은 `.marketplace-cache/session.json`에 저장되어 이후 재사용됩니다.

#### 다운로드 후 사용

다운로드된 위젯은 자동으로 바인딩이 생성됩니다. Pluggable 위젯과 Classic 위젯은 각각 다른 패턴으로 사용합니다:

**Pluggable 위젯** (`glendix/widget` 사용):

```gleam
// src/widgets/star_rating.gleam (자동 생성)
import glendix/mendix
import glendix/react.{type JsProps, type ReactElement}
import glendix/react/attribute
import glendix/widget

pub fn render(props: JsProps) -> ReactElement {
  let rate_attribute = mendix.get_prop_required(props, "rateAttribute")
  let comp = widget.component("StarRating")
  react.component_el(
    comp,
    [attribute.attribute("rateAttribute", rate_attribute)],
    [],
  )
}
```

**Classic (Dojo) 위젯** (`glendix/classic` 사용):

```gleam
// src/widgets/camera_widget.gleam (자동 생성)
import gleam/dynamic
import glendix/classic
import glendix/mendix
import glendix/react.{type JsProps, type ReactElement}

pub fn render(props: JsProps) -> ReactElement {
  let mf_to_execute = mendix.get_prop_required(props, "mfToExecute")
  classic.render("CameraWidget.widget.CameraWidget", [
    #("mfToExecute", dynamic.from(mf_to_execute)),
  ])
}
```

**위젯에서 import:**

```gleam
import widgets/star_rating
import widgets/camera_widget

// 컴포넌트 내부에서
star_rating.render(props)
camera_widget.render(props)
```

생성된 `src/widgets/*.gleam` 파일은 자유롭게 수정할 수 있으며, 이미 존재하는 파일은 재생성 시 덮어쓰지 않습니다.

---

## 6. 트러블슈팅

### 빌드 에러

| 문제 | 원인 | 해결 |
|---|---|---|
| `gleam build` 실패: glendix를 찾을 수 없음 | `gleam.toml`의 경로가 잘못됨 | `path = "../glendix"` 경로 확인 |
| `react is not defined` | peer dependency 미설치 | `gleam run -m glendix/install` |
| `Big is not a constructor` | big.js 미설치 | `gleam run -m glendix/install` |

### 런타임 에러

| 문제 | 원인 | 해결 |
|---|---|---|
| `Cannot read property of undefined` | 존재하지 않는 prop 접근 | `get_prop` (Option) 대신 `get_prop_required` 사용 시 prop 이름 확인 |
| `set_value` 호출 시 에러 | read_only 상태에서 값 설정 | `ev.is_editable(attr)` 확인 후 설정 |
| Hook 순서 에러 | 조건부로 Hook 호출 | Hook은 항상 동일한 순서로 호출해야 함 (React Rules of Hooks) |
| `바인딩이 생성되지 않았습니다` | `binding_ffi.mjs`가 스텁 상태 | `gleam run -m glendix/install` 실행 |
| `위젯 바인딩이 생성되지 않았습니다` | `widget_ffi.mjs`가 스텁 상태 | `widgets/` 디렉토리에 `.mpk` 배치 후 `gleam run -m glendix/install` 실행 |
| `위젯 바인딩에 등록되지 않은 위젯` | 해당 `.mpk`가 `widgets/`에 없음 | `.mpk` 파일 배치 후 재설치 |
| `could not be resolved – treating it as an external dependency` | `bindings.json`에 등록한 패키지가 `node_modules`에 없음 | `npm install <패키지명>` 등으로 설치 후 재빌드 |
| `바인딩에 등록되지 않은 모듈` | `bindings.json`에 해당 패키지 미등록 | `bindings.json`에 패키지와 컴포넌트 추가 후 재설치 |
| `모듈에 없는 컴포넌트` | `bindings.json`의 `components`에 해당 컴포넌트 미등록 | `components` 배열에 추가 후 재설치 |
| `.env 파일에 MENDIX_PAT가 필요합니다` | marketplace 실행 시 PAT 미설정 | `.env`에 `MENDIX_PAT=...` 추가 (scope: `mx:marketplace-content:read`) — [Developer Settings](https://user-settings.mendix.com/link/developersettings)에서 발급 |
| `인증 실패 — MENDIX_PAT를 확인하세요` | PAT가 잘못되었거나 만료됨 | [Developer Settings](https://user-settings.mendix.com/link/developersettings)에서 새 PAT 발급 |
| `위젯을 불러올 수 없습니다` | Content API 접근 실패 | 네트워크 및 PAT 확인 |
| `Playwright 오류` | chromium 미설치 또는 세션 만료 | `npx playwright install chromium` 실행, 또는 브라우저 재로그인 |
| `저장된 세션이 만료되었습니다` | Mendix 로그인 세션 만료 | 브라우저 로그인 팝업에서 재로그인 |

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
  html.div([attribute.key(mendix.object_id(item))], [
    // ...
  ])
})
```

**3. 월(month) 변환을 직접 하지 마세요:**

```gleam
// glendix/mendix/date가 자동으로 1-based ↔ 0-based 변환합니다
let month = date.month(my_date)  // 1~12 (Gleam 기준, 변환 불필요)
```

**4. 외부 React 컴포넌트용 `.mjs` 파일을 직접 작성하지 마세요:**

```gleam
// 잘못된 방법 — 수동 FFI 작성
// recharts_ffi.mjs를 만들고 @external로 연결하는 것

// 올바른 방법 — bindings.json + glendix/binding 사용
import glendix/binding
let rc = binding.module("recharts")
react.component_el(binding.resolve(rc, "PieChart"), attrs, children)
react.void_component_el(binding.resolve(rc, "Tooltip"), attrs)
```

**5. `.mpk` 위젯용 `.mjs` 파일을 직접 작성하지 마세요:**

```gleam
// 잘못된 방법 — 수동 FFI 작성

// 올바른 방법 — widgets/ 디렉토리 + glendix/widget 사용
import glendix/widget
let switch_comp = widget.component("Switch")
react.component_el(switch_comp, attrs, children)
```

**6. `binding.resolve()`에서 컴포넌트 이름을 snake_case로 바꾸지 마세요:**

```gleam
// 잘못된 예
binding.resolve(m(), "pie_chart")

// 올바른 예 — JavaScript 원본 이름(PascalCase) 그대로 사용
binding.resolve(m(), "PieChart")
```

**7. `react.none()` 대신 빈 문자열이나 빈 리스트를 사용하지 마세요:**

```gleam
// 잘못된 예
react.text("")        // 빈 텍스트 노드 생성
react.fragment([])    // 빈 Fragment 생성

// 올바른 예
react.none()          // React null 반환
```

---
