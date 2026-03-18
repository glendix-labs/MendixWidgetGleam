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
  draw_banner_lines(banner_lines())
  stdout.execute([
    command.Println(""),
  ])
}

fn draw_banner_lines(lines: List(#(String, String))) {
  case lines {
    [] -> Nil
    [#(glendi, lucy), ..rest] -> {
      stdout.execute([
        command.SetForegroundColor(style.Cyan),
        command.SetAttributes([style.Bold]),
        command.Print(glendi),
        command.ResetStyle,
        command.SetForegroundColor(style.Magenta),
        command.Println(lucy),
        command.ResetStyle,
      ])
      draw_banner_lines(rest)
    }
  }
}

fn banner_lines() -> List(#(String, String)) {
  [
    #("                   ████                                               ████   ████", ""),
    #("                   ████                                               ████  ██████", ""),
    #("                   ████                                               ████   ████", ""),
    #("                   ████                                               ████", "           █▓█"),
    #("   ████████ ████   ████      ████████     ████ ███████        ███████ ████   ████", "    ▓░▓█"),
    #(" ███████████████   ████    ████████████   ██████████████    ██████████████   ████", "    ▓░░▓▓▓▓"),
    #("█████     ██████   ████   ████     █████  █████     ████   █████     █████   ████", "  ▓▓░░░░░░▓"),
    #("████       █████   ████  ████       ████  █████     ████   ████      █████   ████", " ▓░░░░░▒░▒█"),
    #("████        ████   ████  ███████████████  █████     ████   ████       ████   ████", " █▓░▒░▒░░▓"),
    #("█████      █████   ████  ████             █████     ████   ████      █████   ████", "  █▓░░▒░░▓"),
    #(" ███████████████   ████   █████     ██    █████     ████   █████    ██████   ████", "   ▓░░░░░▓"),
    #("  █████████ ████   ████    ████████████   █████     ████    ██████████████   ████", "   ▓░▒▓█▓▓"),
    #("            ████   ████      ████████     █████     ████      ██████  ████   ████", "   █▓█"),
    #("   █       ████", ""),
    #("  █████████████", ""),
    #("   ██████████", ""),
  ]
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

// ── 표시 폭 계산 (한국어/CJK 전각 문자 대응) ────────────────

fn display_width(str: String) -> Int {
  string.to_utf_codepoints(str)
  |> list.fold(0, fn(acc, cp) {
    case is_wide_char(string.utf_codepoint_to_int(cp)) {
      True -> acc + 2
      False -> acc + 1
    }
  })
}

fn is_wide_char(code: Int) -> Bool {
  // Hangul Syllables (가-힣)
  code >= 0xAC00 && code <= 0xD7A3
  // Hangul Jamo
  || code >= 0x1100 && code <= 0x11FF
  // Hangul Compatibility Jamo
  || code >= 0x3130 && code <= 0x318F
  // CJK Symbols, Hiragana, Katakana, Bopomofo
  || code >= 0x3000 && code <= 0x30FF
  // CJK Unified Ideographs Extension A
  || code >= 0x3400 && code <= 0x4DBF
  // CJK Unified Ideographs
  || code >= 0x4E00 && code <= 0x9FFF
  // CJK Compatibility Ideographs
  || code >= 0xF900 && code <= 0xFAFF
  // Fullwidth Forms
  || code >= 0xFF01 && code <= 0xFF60
  || code >= 0xFFE0 && code <= 0xFFE6
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
  case completed {
    [] -> Nil
    _ -> stdout.execute([command.Println("")])
  }
  stdout.execute([
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
  let cursor = string.length(initial)
  render_input(
    completed,
    title,
    initial,
    cursor,
    validate(initial),
    preview(initial),
    hint,
  )
  input_loop(completed, title, initial, cursor, validate, preview, hint)
}

fn render_input(
  completed: List(#(String, String)),
  title: String,
  value: String,
  cursor: Int,
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

  // 입력 커서 위치 계산: header(17) + completed + blank(1) + input line
  // banner(16) + blank(1) = 17
  let input_row = 17 + list.length(completed) + 1
  let input_col =
    display_width(prefix) + display_width(string.slice(value, 0, cursor))
  stdout.execute([
    command.MoveTo(input_col, input_row),
    command.ShowCursor,
  ])
}

fn input_loop(
  completed: List(#(String, String)),
  title: String,
  value: String,
  cursor: Int,
  validate: fn(String) -> Option(String),
  preview: fn(String) -> List(String),
  hint: String,
) -> Promise(Result(String, Nil)) {
  use evt <- promise.await(event.read())
  case evt {
    // 문자 입력 — 커서 위치에 삽입
    Some(Ok(event.Key(event.KeyEvent(
      code: event.Char(c),
      modifiers: event.Modifiers(control: False, alt: False, ..),
      kind: event.Press,
      ..,
    )))) -> {
      let before = string.slice(value, 0, cursor)
      let after =
        string.slice(value, cursor, string.length(value) - cursor)
      let v = before <> c <> after
      let cur = cursor + 1
      render_input(completed, title, v, cur, validate(v), preview(v), hint)
      input_loop(completed, title, v, cur, validate, preview, hint)
    }
    // 백스페이스 — 커서 앞 문자 삭제
    Some(Ok(event.Key(event.KeyEvent(
      code: event.Backspace,
      kind: event.Press,
      ..,
    )))) -> {
      case cursor > 0 {
        True -> {
          let before = string.slice(value, 0, cursor - 1)
          let after =
            string.slice(value, cursor, string.length(value) - cursor)
          let v = before <> after
          let cur = cursor - 1
          render_input(
            completed, title, v, cur, validate(v), preview(v), hint,
          )
          input_loop(completed, title, v, cur, validate, preview, hint)
        }
        False ->
          input_loop(completed, title, value, cursor, validate, preview, hint)
      }
    }
    // Delete — 커서 뒤 문자 삭제
    Some(Ok(event.Key(event.KeyEvent(
      code: event.Delete,
      kind: event.Press,
      ..,
    )))) -> {
      let len = string.length(value)
      case cursor < len {
        True -> {
          let before = string.slice(value, 0, cursor)
          let after = string.slice(value, cursor + 1, len - cursor - 1)
          let v = before <> after
          render_input(
            completed, title, v, cursor, validate(v), preview(v), hint,
          )
          input_loop(completed, title, v, cursor, validate, preview, hint)
        }
        False ->
          input_loop(completed, title, value, cursor, validate, preview, hint)
      }
    }
    // 왼쪽 화살표
    Some(Ok(event.Key(event.KeyEvent(
      code: event.LeftArrow,
      kind: event.Press,
      ..,
    )))) -> {
      case cursor > 0 {
        True -> {
          let cur = cursor - 1
          render_input(
            completed, title, value, cur, validate(value), preview(value),
            hint,
          )
          input_loop(completed, title, value, cur, validate, preview, hint)
        }
        False ->
          input_loop(completed, title, value, cursor, validate, preview, hint)
      }
    }
    // 오른쪽 화살표
    Some(Ok(event.Key(event.KeyEvent(
      code: event.RightArrow,
      kind: event.Press,
      ..,
    )))) -> {
      let len = string.length(value)
      case cursor < len {
        True -> {
          let cur = cursor + 1
          render_input(
            completed, title, value, cur, validate(value), preview(value),
            hint,
          )
          input_loop(completed, title, value, cur, validate, preview, hint)
        }
        False ->
          input_loop(completed, title, value, cursor, validate, preview, hint)
      }
    }
    // Home — 맨 앞으로
    Some(Ok(event.Key(event.KeyEvent(
      code: event.Home,
      kind: event.Press,
      ..,
    )))) -> {
      render_input(
        completed, title, value, 0, validate(value), preview(value), hint,
      )
      input_loop(completed, title, value, 0, validate, preview, hint)
    }
    // End — 맨 뒤로
    Some(Ok(event.Key(event.KeyEvent(
      code: event.End,
      kind: event.Press,
      ..,
    )))) -> {
      let len = string.length(value)
      render_input(
        completed, title, value, len, validate(value), preview(value), hint,
      )
      input_loop(completed, title, value, len, validate, preview, hint)
    }
    // 확인
    Some(Ok(event.Key(event.KeyEvent(code: event.Enter, kind: event.Press, ..)))) -> {
      let trimmed = string.trim(value)
      case validate(trimmed) {
        Some(_) ->
          input_loop(completed, title, value, cursor, validate, preview, hint)
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
    _ -> input_loop(completed, title, value, cursor, validate, preview, hint)
  }
}
