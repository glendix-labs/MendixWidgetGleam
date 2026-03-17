# MendixWidgetGleam

**[English](README.md)** | **[한국어](README.ko.md)** | **[日本語](README.ja.md)**

**Build Mendix Pluggable Widgets with Gleam — no JSX required.**

Write React components entirely in Gleam and run them as Mendix Studio Pro widgets. React and Mendix API bindings are provided by the [glendix](https://hexdocs.pm/glendix/) package.

## Why Gleam?

- **Static type safety** — Gleam's robust type system catches runtime errors at compile time
- **Immutable data** — Predictable state management
- **JavaScript target support** — `gleam build --target javascript` outputs ES modules
- **glendix package** — Type-safe Gleam bindings for React + Mendix API + JS Interop, supporting `EditableValue`, `ActionValue`, `ListValue` and all other Mendix Pluggable Widget API types

## Architecture

```
src/
  mendix_widget_gleam.gleam           # Main widget module
  editor_config.gleam                 # Studio Pro property panel configuration
  editor_preview.gleam                # Studio Pro design view preview
  components/
    hello_world.gleam               # Shared Hello World component
  MendixWidget.xml                    # Widget property definitions
  package.xml                         # Mendix package manifest
widgets/                                # .mpk widget files (used via glendix/widget)
bindings.json                           # External React component binding configuration
package.json                            # npm dependencies (React, external libraries, etc.)
gleam.toml                            # Includes glendix >= 2.0.19 dependency
```

React/Mendix FFI and JS Interop bindings are not included in this project — they are provided by the [glendix](https://hexdocs.pm/glendix/) Hex package.

### Build Pipeline

```
Widget code (.gleam) + glendix package (Hex)
    |  gleam run -m glendix/build (Gleam compilation runs automatically)
ES modules (.mjs) — build/dev/javascript/...
    |  Bridge JS (auto-generated) handles imports
    |  Rollup (pluggable-widgets-tools)
.mpk widget package — dist/
```

### Core Principles

The Gleam function `fn(JsProps) -> ReactElement` has an identical signature to a React functional component. glendix provides type-safe access to React primitives and Mendix runtime type accessors, so widget projects need only focus on business logic.

```gleam
// src/mendix_widget_gleam.gleam
import glendix/mendix
import glendix/react.{type JsProps, type ReactElement}
import glendix/react/attribute
import glendix/react/html

pub fn widget(props: JsProps) -> ReactElement {
  let sample_text = mendix.get_string_prop(props, "sampleText")
  html.div([attribute.class("widget-hello-world")], [
    react.text("Hello " <> sample_text),
  ])
}
```

Mendix complex types can also be used in a type-safe manner from Gleam:

```gleam
import glendix/mendix
import glendix/mendix/editable_value
import glendix/mendix/action

pub fn widget(props: JsProps) -> ReactElement {
  // Access EditableValue
  let name_attr: EditableValue = mendix.get_prop_required(props, "name")
  let display = editable_value.display_value(name_attr)

  // Execute ActionValue
  let on_save: Option(ActionValue) = mendix.get_prop(props, "onSave")
  action.execute_action(on_save)
  // ...
}
```

## Getting Started

### Prerequisites

- [Gleam](https://gleam.run/getting-started/installing/) (v1.0+)
- [Node.js](https://nodejs.org/) (v16+)
- [Mendix Studio Pro](https://marketplace.mendix.com/link/studiopro/) (for widget testing)

### Installation

```bash
gleam run -m glendix/install   # Auto-downloads Gleam deps + installs npm deps + generates binding code (external React packages must be installed manually beforehand)
```

### Build

```bash
gleam run -m glendix/build     # Gleam compilation + widget build (.mpk output)
```

Build artefacts are output as `.mpk` files in the `dist/` directory.

### Development

```bash
gleam run -m glendix/dev       # Gleam compilation + dev server (HMR, port 3000)
gleam run -m glendix/start     # Linked development with Mendix test project
```

## Commands

All commands are unified under `gleam`. `gleam run -m` automatically compiles Gleam before running the script.

| Command | Description |
|---------|-------------|
| `gleam run -m glendix/install` | Install dependencies (Gleam + npm) + generate binding code |
| `gleam run -m glendix/build` | Production build (.mpk output) |
| `gleam run -m glendix/dev` | Development server (HMR, port 3000) |
| `gleam run -m glendix/start` | Linked development with Mendix test project |
| `gleam run -m glendix/lint` | Run ESLint |
| `gleam run -m glendix/lint_fix` | ESLint auto-fix |
| `gleam run -m glendix/release` | Release build |
| `gleam run -m glendix/marketplace` | Search/download Mendix Marketplace widgets |
| `gleam run -m glendix/define` | Widget property definition TUI editor |
| `gleam build --target javascript` | Gleam to JS compilation only |
| `gleam test` | Run Gleam tests |
| `gleam format` | Format Gleam code |

## Using External React Components

React component libraries distributed as npm packages can be used from pure Gleam without writing any `.mjs` FFI files.

### Step 1: Install the npm package

```bash
npm install recharts
```

### Step 2: Write `bindings.json`

Create `bindings.json` at the project root and register the components you wish to use:

```json
{
  "recharts": {
    "components": ["PieChart", "Pie", "Cell", "Tooltip", "ResponsiveContainer"]
  }
}
```

### Step 3: Generate bindings

```bash
gleam run -m glendix/install
```

A `binding_ffi.mjs` file is generated automatically. It is also regenerated on subsequent builds via `gleam run -m glendix/build`.

### Step 4: Use from Gleam

```gleam
import glendix/binding
import glendix/react.{type ReactElement}
import glendix/react/attribute.{type Attribute}

fn m() { binding.module("recharts") }

pub fn pie_chart(attrs: List(Attribute), children: List(ReactElement)) -> ReactElement {
  react.component_el(binding.resolve(m(), "PieChart"), attrs, children)
}

pub fn tooltip(attrs: List(Attribute)) -> ReactElement {
  react.void_component_el(binding.resolve(m(), "Tooltip"), attrs)
}
```

External React components follow the same calling pattern as `html.div`.

## Mendix Marketplace Widget Download

Interactively search and download widgets (.mpk) from the Mendix Marketplace. After download, binding `.gleam` files are generated automatically and are ready to use straight away.

### Preparation

Set your Mendix Personal Access Token in a `.env` file:

```
MENDIX_PAT=your_personal_access_token
```

> Generate a PAT from [Mendix Developer Settings](https://user-settings.mendix.com/link/developersettings) — click **New Token** under **Personal Access Tokens**. Required scope: `mx:marketplace-content:read`

### Run

```bash
gleam run -m glendix/marketplace
```

Search and select widgets in the interactive TUI. The `.mpk` is downloaded to the `widgets/` directory, and binding `.gleam` files are auto-generated in `src/widgets/`.

## Using .mpk Widget Components

Place `.mpk` files (Mendix widget build artefacts) in the `widgets/` directory to render existing Mendix widgets as React components within your own widget.

### Step 1: Place the `.mpk` files

```
project root/
├── widgets/
│   ├── Switch.mpk
│   └── Badge.mpk
├── src/
└── gleam.toml
```

### Step 2: Generate bindings

```bash
gleam run -m glendix/install
```

This automatically:
- Extracts `.mjs`/`.css` from the `.mpk` and generates `widget_ffi.mjs`
- Parses `<property>` definitions from the `.mpk` XML and generates binding `.gleam` files in `src/widgets/` (existing files are skipped)

### Step 3: Review the auto-generated `src/widgets/*.gleam` files

```gleam
// src/widgets/switch.gleam (auto-generated)
import glendix/mendix
import glendix/react.{type JsProps, type ReactElement}
import glendix/react/attribute
import glendix/widget

/// Render the Switch widget — reads properties from props and passes them to the widget
pub fn render(props: JsProps) -> ReactElement {
  let boolean_attribute = mendix.get_prop_required(props, "booleanAttribute")
  let action = mendix.get_prop_required(props, "action")

  let comp = widget.component("Switch")
  react.component_el(
    comp,
    [
      attribute.attribute("booleanAttribute", boolean_attribute),
      attribute.attribute("action", action),
    ],
    [],
  )
}
```

Required and optional properties are distinguished automatically. You are free to modify the generated files as needed.

### Step 4: Use in your widget

```gleam
import widgets/switch

// Inside a component
switch.render(props)
```

The widget name comes from the `<name>` value in the `.mpk`'s internal XML, and property keys use the original keys from the `.mpk` XML.

## Tech Stack

- **Gleam** — Widget logic and UI (compiled to JavaScript target)
- **[glendix](https://hexdocs.pm/glendix/)** — React + Mendix API + JS Interop Gleam bindings (Hex package)
- **React 19** — Mendix Pluggable Widget runtime
- **Rollup** — Bundling via `@mendix/pluggable-widgets-tools`

## Limitations

- The Gleam to JS to Mendix Widget pipeline is not an officially supported combination; build configuration customisation may be required
- JSX files are not used — all React logic is implemented via Gleam + glendix
- External Gleam React libraries such as Redraw are not used
- FFI files are not written directly in the widget project — React/Mendix FFI is provided by glendix

## Licence

Apache License 2.0 — see [LICENSE](./LICENSE)
