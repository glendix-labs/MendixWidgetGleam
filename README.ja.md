# MendixWidgetGleam

**[English](README.md)** | **[한국어](README.ko.md)** | **[日本語](README.ja.md)**

**Gleam言語でMendix Pluggable Widgetを開発するプロジェクト。**

JSXを使わず、Gleamコードのみでreactコンポーネントを記述し、Mendix Studio Proで動作するウィジェットを作成する。Reactバインディングは[redraw](https://hexdocs.pm/redraw/)/[redraw_dom](https://hexdocs.pm/redraw_dom/)が、Mendix APIバインディングは[mendraw](https://hexdocs.pm/mendraw/)が、ビルドツール + JS interopは[glendix](https://hexdocs.pm/glendix/)が提供する。

## なぜGleamなのか？

- **静的型安全性** — Gleamの強力な型システムにより、ランタイムエラーをコンパイル時に防止
- **イミュータブルデータ** — 予測可能な状態管理
- **JavaScriptターゲット対応** — `gleam build --target javascript`でESモジュールを出力
- **glendix + mendrawパッケージ** — React + Mendix API + JS Interopの型安全なGleamバインディング。`EditableValue`、`ActionValue`、`ListValue`など、すべてのMendix Pluggable Widget APIをサポート

## アーキテクチャ

```
src/
  mendix_widget_gleam.gleam           # ウィジェットメインモジュール
  editor_config.gleam                 # Studio Proプロパティパネル設定
  editor_preview.gleam                # Studio Proデザインビュープレビュー
  components/
    hello_world.gleam               # Hello World共有コンポーネント
  MendixWidget.xml                    # ウィジェットプロパティ定義
  package.xml                         # Mendixパッケージマニフェスト
package.json                            # npm依存関係（React、外部ライブラリなど）
gleam.toml                            # glendix >= 4.0.5 + mendraw依存関係を含む
```

React/Mendix FFIおよびJS Interopバインディングはこのプロジェクトには含まれず、[glendix](https://hexdocs.pm/glendix/)および[mendraw](https://hexdocs.pm/mendraw/) Hexパッケージとして提供される。

### ビルドパイプライン

```
ウィジェットコード (.gleam) + glendixパッケージ (Hex)
    ↓  gleam run -m glendix/build（Gleamコンパイルを自動実行）
ESモジュール (.mjs) — build/dev/javascript/...
    ↓  ブリッジJS（自動生成）がimport
    ↓  Rollup (pluggable-widgets-tools)
.mpkウィジェットパッケージ — dist/
```

### 基本原理

Gleam関数`fn(JsProps) -> Element`はReact関数コンポーネントと同一のシグネチャを持つ。Reactバインディングは[redraw](https://hexdocs.pm/redraw/) / [redraw_dom](https://hexdocs.pm/redraw_dom/)が提供し、mendrawはMendixランタイム型アクセサを、glendixはJS interopを型安全に提供するため、ウィジェットプロジェクトではビジネスロジックにのみ集中すればよい。

```gleam
// src/mendix_widget_gleam.gleam
import mendraw/mendix.{type JsProps}
import redraw.{type Element}
import redraw/dom/attribute
import redraw/dom/html

pub fn widget(props: JsProps) -> Element {
  let sample_text = mendix.get_string_prop(props, "sampleText")
  html.div([attribute.class("widget-hello-world")], [
    html.text("Hello " <> sample_text),
  ])
}
```

Mendixの複合型もGleamから型安全に使用できる：

```gleam
import mendraw/mendix
import mendraw/mendix/editable_value
import mendraw/mendix/action

pub fn widget(props: JsProps) -> Element {
  // EditableValueへのアクセス
  let name_attr: EditableValue = mendix.get_prop_required(props, "name")
  let display = editable_value.display_value(name_attr)

  // ActionValueの実行
  let on_save: Option(ActionValue) = mendix.get_prop(props, "onSave")
  action.execute_action(on_save)
  // ...
}
```

## はじめに

### 前提条件

- [Gleam](https://gleam.run/getting-started/installing/)（v1.0以上）
- [Node.js](https://nodejs.org/)（v16以上）
- [Mendix Studio Pro](https://marketplace.mendix.com/link/studiopro/)（ウィジェットテスト用）

### インストール

```bash
gleam run -m glendix/install   # Gleam依存関係の自動ダウンロード + npm依存関係のインストール + バインディングコード生成（外部Reactパッケージは事前に手動インストールが必要）
```

### ビルド

```bash
gleam run -m glendix/build     # Gleamコンパイル + ウィジェットビルド（.mpk生成）
```

ビルド成果物は`dist/`ディレクトリに`.mpk`ファイルとして生成される。

### 開発

```bash
gleam run -m glendix/dev       # Gleamコンパイル + 開発サーバー（HMR、ポート3000）
gleam run -m glendix/start     # Mendixテストプロジェクトとの連携開発
```

## コマンド一覧

すべてのコマンドは`gleam`に統一。`gleam run -m`はGleamコンパイルを自動実行してからスクリプトを実行する。

| コマンド | 説明 |
|----------|------|
| `gleam run -m glendix/install` | 依存関係インストール（Gleam + npm）+ バインディングコード生成 |
| `gleam run -m glendix/build` | プロダクションビルド（.mpk生成） |
| `gleam run -m glendix/dev` | 開発サーバー（HMR、ポート3000） |
| `gleam run -m glendix/start` | Mendixテストプロジェクト連携 |
| `gleam run -m glendix/lint` | ESLint実行 |
| `gleam run -m glendix/lint_fix` | ESLint自動修正 |
| `gleam run -m glendix/release` | リリースビルド |
| `gleam run -m mendraw/marketplace` | Mendix Marketplaceウィジェット検索/ダウンロード |
| `gleam run -m glendix/define` | ウィジェットプロパティ定義TUIエディター |
| `gleam build --target javascript` | Gleam → JSコンパイルのみ |
| `gleam test` | Gleamテスト実行 |
| `gleam format` | Gleamコードフォーマット |

## 外部Reactコンポーネントの使用

npmパッケージとして提供されるReactコンポーネントライブラリを、`.mjs` FFIファイルを書くことなく純粋なGleamから使用できる。

### ステップ1：npmパッケージのインストール

```bash
npm install recharts
```

### ステップ2：`gleam.toml`にバインディングを追加

`gleam.toml`に`[tools.glendix.bindings]`セクションを追加する：

```toml
[tools.glendix.bindings.recharts]
components = ["PieChart", "Pie", "Cell", "Tooltip", "ResponsiveContainer"]
```

### ステップ3：バインディングの生成

```bash
gleam run -m glendix/install
```

`binding_ffi.mjs`が自動生成される。以降の`gleam run -m glendix/build`等のビルド時にも自動更新される。

### ステップ4：Gleamから使用

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

`html.div`と同じ呼び出しパターンで外部Reactコンポーネントを使用できる。

## 技術スタック

- **Gleam** — ウィジェットロジック、UI（JavaScriptターゲットへコンパイル）
- **[glendix](https://hexdocs.pm/glendix/)** — ビルドツール + JS Interop Gleamバインディング（Hexパッケージ）
- **[mendraw](https://hexdocs.pm/mendraw/)** — Mendix API Gleamバインディング（Hexパッケージ）
- **React 19** — Mendix Pluggable Widgetランタイム
- **Rollup** — `@mendix/pluggable-widgets-tools`ベースのバンドル

## 制約事項

- Gleam → JS → Mendix Widgetパイプラインは公式にサポートされた組み合わせではないため、ビルド設定のカスタマイズが必要な場合がある
- JSXファイルは使用しない — すべてのReactロジックはGleam + glendixで実装
- Reactバインディングはglendixを通じてredraw/redraw_domを使用する — 他のGleam Reactライブラリは使用しない
- ウィジェットプロジェクトにFFIファイルを直接記述しない — React/Mendix FFIはglendixが提供

## ライセンス

Apache License 2.0 — [LICENSE](./LICENSE)を参照
