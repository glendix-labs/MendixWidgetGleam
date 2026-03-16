// 화살표 키 기반 Select / Text Input TUI 컴포넌트

import etch/command
import etch/event
import etch/stdout
import etch/style
import etch/terminal
import gleam/javascript/promise.{type Promise}
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string

// ── 공통 렌더링 ──────────────────────────────────────────────

pub fn draw_header() {
  stdout.execute([
    command.SetForegroundColor(style.Cyan),
    command.SetAttributes([style.Bold]),
    command.Println("  create-mendix-widget-gleam"),
    command.ResetStyle,
    command.Println(""),
  ])
}

pub fn draw_completed(steps: List(#(String, String))) {
  list.each(steps, fn(step) {
    let #(label, value) = step
    stdout.execute([
      command.SetForegroundColor(style.Green),
      command.Print("  ✓ "),
      command.ResetStyle,
      command.SetAttributes([style.Bold]),
      command.Print(label),
      command.ResetStyle,
      command.Println(": " <> value),
    ])
  })
}

fn draw_hint(hint: String) {
  stdout.execute([
    command.Println(""),
    command.SetForegroundColor(style.BrightGrey),
    command.Println("  " <> hint),
    command.ResetStyle,
  ])
}

fn clear_screen() {
  stdout.execute([
    command.Clear(terminal.All),
    command.MoveTo(0, 0),
  ])
}

// ── Select 컴포넌트 ─────────────────────────────────────────

pub fn select(
  completed: List(#(String, String)),
  title: String,
  items: List(String),
  default: Int,
  hint: String,
) -> Promise(Int) {
  render_select(completed, title, items, default, hint)
  select_loop(completed, title, items, default, list.length(items), hint)
}

fn render_select(
  completed: List(#(String, String)),
  title: String,
  items: List(String),
  selected: Int,
  hint: String,
) {
  clear_screen()
  draw_header()
  draw_completed(completed)
  stdout.execute([
    command.Println(""),
    command.SetAttributes([style.Bold]),
    command.Println("  " <> title),
    command.ResetStyle,
    command.Println(""),
  ])
  render_items(items, selected, 0)
  draw_hint(hint)
}

fn render_items(items: List(String), selected: Int, i: Int) {
  case items {
    [] -> Nil
    [item, ..rest] -> {
      case i == selected {
        True ->
          stdout.execute([
            command.SetForegroundColor(style.Cyan),
            command.SetAttributes([style.Bold]),
            command.Println("  ❯ " <> item),
            command.ResetStyle,
          ])
        False ->
          stdout.execute([
            command.SetForegroundColor(style.White),
            command.Println("    " <> item),
            command.ResetStyle,
          ])
      }
      render_items(rest, selected, i + 1)
    }
  }
}

fn select_loop(
  completed: List(#(String, String)),
  title: String,
  items: List(String),
  selected: Int,
  count: Int,
  hint: String,
) -> Promise(Int) {
  use evt <- promise.await(event.read())
  case evt {
    // 위로
    Some(Ok(event.Key(event.KeyEvent(code: event.UpArrow, kind: event.Press, ..)))) -> {
      let s = case selected > 0 {
        True -> selected - 1
        False -> count - 1
      }
      render_select(completed, title, items, s, hint)
      select_loop(completed, title, items, s, count, hint)
    }
    // 아래로
    Some(Ok(event.Key(event.KeyEvent(
      code: event.DownArrow,
      kind: event.Press,
      ..,
    )))) -> {
      let s = case selected < count - 1 {
        True -> selected + 1
        False -> 0
      }
      render_select(completed, title, items, s, hint)
      select_loop(completed, title, items, s, count, hint)
    }
    // 확인
    Some(Ok(event.Key(event.KeyEvent(code: event.Enter, kind: event.Press, ..)))) ->
      promise.resolve(selected)
    // 취소
    Some(Ok(event.Key(event.KeyEvent(code: event.Esc, kind: event.Press, ..)))) ->
      promise.resolve(-1)
    // Ctrl+C
    Some(Ok(event.Key(event.KeyEvent(
      code: event.Char("c"),
      modifiers: event.Modifiers(control: True, ..),
      kind: event.Press,
      ..,
    )))) -> promise.resolve(-1)
    // 그 외 → 무시
    _ -> select_loop(completed, title, items, selected, count, hint)
  }
}

// ── Text Input 컴포넌트 ─────────────────────────────────────

pub fn text_input(
  completed: List(#(String, String)),
  title: String,
  initial: String,
  validate: fn(String) -> Option(String),
  preview: fn(String) -> List(String),
  hint: String,
) -> Promise(Result(String, Nil)) {
  render_input(
    completed,
    title,
    initial,
    validate(initial),
    preview(initial),
    hint,
  )
  input_loop(completed, title, initial, validate, preview, hint)
}

fn render_input(
  completed: List(#(String, String)),
  title: String,
  value: String,
  error: Option(String),
  preview_lines: List(String),
  hint: String,
) {
  clear_screen()
  draw_header()
  draw_completed(completed)

  // 제목 + 입력값
  let prefix = "  " <> title <> ": "
  stdout.execute([
    command.Println(""),
    command.SetAttributes([style.Bold]),
    command.Print(prefix),
    command.ResetStyle,
    command.Println(value),
  ])

  // 에러 또는 미리보기
  case error {
    Some(err) ->
      stdout.execute([
        command.SetForegroundColor(style.Red),
        command.Println("  " <> err),
        command.ResetStyle,
      ])
    None ->
      case preview_lines {
        [] -> stdout.execute([command.Println("")])
        lines -> {
          stdout.execute([command.Println("")])
          list.each(lines, fn(line) {
            stdout.execute([
              command.SetForegroundColor(style.BrightGrey),
              command.Println("    " <> line),
              command.ResetStyle,
            ])
          })
        }
      }
  }

  draw_hint(hint)

  // 입력 커서 위치 계산: header(1) + blank(1) + completed + blank(1) + input line
  let input_row = 2 + list.length(completed) + 1
  let input_col = string.length(prefix) + string.length(value)
  stdout.execute([
    command.MoveTo(input_col, input_row),
    command.ShowCursor,
  ])
}

fn input_loop(
  completed: List(#(String, String)),
  title: String,
  value: String,
  validate: fn(String) -> Option(String),
  preview: fn(String) -> List(String),
  hint: String,
) -> Promise(Result(String, Nil)) {
  use evt <- promise.await(event.read())
  case evt {
    // 문자 입력
    Some(Ok(event.Key(event.KeyEvent(
      code: event.Char(c),
      modifiers: event.Modifiers(control: False, alt: False, ..),
      kind: event.Press,
      ..,
    )))) -> {
      let v = value <> c
      render_input(completed, title, v, validate(v), preview(v), hint)
      input_loop(completed, title, v, validate, preview, hint)
    }
    // 백스페이스
    Some(Ok(event.Key(event.KeyEvent(
      code: event.Backspace,
      kind: event.Press,
      ..,
    )))) -> {
      let v = string.drop_end(value, 1)
      render_input(completed, title, v, validate(v), preview(v), hint)
      input_loop(completed, title, v, validate, preview, hint)
    }
    // 확인
    Some(Ok(event.Key(event.KeyEvent(code: event.Enter, kind: event.Press, ..)))) -> {
      let trimmed = string.trim(value)
      case validate(trimmed) {
        Some(_) -> input_loop(completed, title, value, validate, preview, hint)
        None -> promise.resolve(Ok(trimmed))
      }
    }
    // 취소
    Some(Ok(event.Key(event.KeyEvent(code: event.Esc, kind: event.Press, ..)))) ->
      promise.resolve(Error(Nil))
    // Ctrl+C
    Some(Ok(event.Key(event.KeyEvent(
      code: event.Char("c"),
      modifiers: event.Modifiers(control: True, ..),
      kind: event.Press,
      ..,
    )))) -> promise.resolve(Error(Nil))
    // 그 외
    _ -> input_loop(completed, title, value, validate, preview, hint)
  }
}
