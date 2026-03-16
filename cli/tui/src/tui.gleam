// create-mendix-widget-gleam TUI — etch 기반 인터랙티브 프롬프트

import etch/command
import etch/event
import etch/stdout
import etch/terminal
import gleam/io
import gleam/javascript/array.{type Array as JsArray}
import gleam/javascript/promise.{type Promise}
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/result
import gleam/string
import tui/prompt

// ── FFI ─────────────────────────────────────────────────────

@external(javascript, "./tui_ffi.mjs", "dir_exists")
fn dir_exists(name: String) -> Bool

@external(javascript, "./tui_ffi.mjs", "detect_pm")
fn detect_pm() -> String

@external(javascript, "./tui_ffi.mjs", "process_exit")
fn process_exit(code: Int) -> Nil

@external(javascript, "./tui_ffi.mjs", "is_valid_name")
fn is_valid_name(name: String) -> Bool

@external(javascript, "./tui_ffi.mjs", "split_words")
fn split_words_ffi(input: String) -> JsArray(String)

fn split_words(input: String) -> List(String) {
  split_words_ffi(input) |> array.to_list
}

fn list_at(items: List(a), index: Int) -> Result(a, Nil) {
  items |> list.drop(index) |> list.first
}

// ── 결과 타입 ───────────────────────────────────────────────

pub type Options {
  Options(project_name: String, pm: String, lang: String)
}

// ── 이름 변환 ───────────────────────────────────────────────

fn capitalize(word: String) -> String {
  case string.first(word) {
    Ok(first) -> string.uppercase(first) <> string.drop_start(word, 1)
    Error(_) -> ""
  }
}

fn to_pascal(words: List(String)) -> String {
  words |> list.map(capitalize) |> string.join("")
}

fn to_snake(words: List(String)) -> String {
  string.join(words, "_")
}

// ── i18n (프롬프트 전용) ────────────────────────────────────

fn t(lang: String, key: String) -> String {
  case lang, key {
    _, "lang.title" -> "Language / 언어 / 言語"

    "en", "name.title" -> "Project name"
    "ko", "name.title" -> "프로젝트 이름"
    "ja", "name.title" -> "プロジェクト名"

    "en", "name.widget" -> "Widget"
    "ko", "name.widget" -> "위젯"
    "ja", "name.widget" -> "ウィジェット"

    "en", "name.module" -> "Module"
    "ko", "name.module" -> "모듈"
    "ja", "name.module" -> "モジュール"

    "en", "name.empty" -> "Please enter a project name."
    "ko", "name.empty" -> "프로젝트 이름을 입력해주세요."
    "ja", "name.empty" -> "プロジェクト名を入力してください。"

    "en", "name.invalid" ->
      "Must start with a letter (a-z, A-Z, 0-9, -, _ only)"
    "ko", "name.invalid" -> "영문자로 시작, 영문자/숫자/-/_ 만 사용 가능"
    "ja", "name.invalid" -> "英字で始まり、英字/数字/-/_ のみ使用可能"

    "en", "name.exists" -> "Directory already exists!"
    "ko", "name.exists" -> "디렉토리가 이미 존재합니다!"
    "ja", "name.exists" -> "ディレクトリは既に存在します！"

    "en", "pm.title" -> "Package Manager"
    "ko", "pm.title" -> "패키지 매니저"
    "ja", "pm.title" -> "パッケージマネージャー"

    "en", "pm.detected" -> "detected"
    "ko", "pm.detected" -> "감지됨"
    "ja", "pm.detected" -> "検出済み"

    _, "hint.select" -> "↑↓ move  ⏎ select  Esc cancel"
    _, "hint.input" -> "⏎ confirm  Esc cancel"

    "en", "cancelled" -> "Cancelled."
    "ko", "cancelled" -> "취소되었습니다."
    "ja", "cancelled" -> "キャンセルされました。"

    _, _ -> key
  }
}

// ── 검증 ────────────────────────────────────────────────────

fn validate_name(lang: String, value: String) -> Option(String) {
  let trimmed = string.trim(value)
  case trimmed {
    "" -> Some(t(lang, "name.empty"))
    _ ->
      case is_valid_name(trimmed) {
        False -> Some(t(lang, "name.invalid"))
        True ->
          case dir_exists(trimmed) {
            True -> Some(t(lang, "name.exists"))
            False -> None
          }
      }
  }
}

fn name_preview(lang: String, value: String) -> List(String) {
  let words = split_words(string.trim(value))
  case words {
    [] -> []
    _ -> [
      t(lang, "name.widget") <> ":  " <> to_pascal(words),
      t(lang, "name.module") <> ":  " <> to_snake(words),
    ]
  }
}

// ── 취소 처리 ───────────────────────────────────────────────

fn cancel(lang: String) -> Promise(Options) {
  cleanup()
  io.println("\n" <> t(lang, "cancelled"))
  process_exit(0)
  // unreachable — process_exit 이후 도달하지 않음
  promise.resolve(Options("", "", ""))
}

fn cleanup() {
  stdout.execute([command.ShowCursor, command.LeaveAlternateScreen])
  let _ = terminal.exit_raw()
  Nil
}

// ── 메인 엔트리 ─────────────────────────────────────────────

pub fn collect_options(cli_name: String) -> Promise(Options) {
  // raw mode 진입 후 이벤트 서버 시작 (fire-and-forget: 내부 무한 루프)
  let assert Ok(_) = terminal.enter_raw()
  stdout.execute([command.EnterAlternateScreen, command.HideCursor])
  let _ = event.init_event_server()

  // 1단계: 언어 선택
  let languages = ["English", "한국어", "日本語"]
  let lang_codes = ["en", "ko", "ja"]

  use lang_idx <- promise.await(prompt.select(
    [],
    t("en", "lang.title"),
    languages,
    0,
    t("en", "hint.select"),
  ))

  case lang_idx < 0 {
    True -> cancel("en")
    False -> {
      let lang = result.unwrap(list_at(lang_codes, lang_idx), "en")
      let lang_label = result.unwrap(list_at(languages, lang_idx), "English")
      let completed = [#("Language", lang_label)]

      // 2단계: 프로젝트 이름
      stdout.execute([command.ShowCursor])
      use name_result <- promise.await(prompt.text_input(
        completed,
        t(lang, "name.title"),
        cli_name,
        validate_name(lang, _),
        name_preview(lang, _),
        t(lang, "hint.input"),
      ))

      case name_result {
        Error(_) -> cancel(lang)
        Ok(name) -> {
          stdout.execute([command.HideCursor])
          let completed = [#("Language", lang_label), #("Project", name)]

          // 3단계: 패키지 매니저
          let detected = detect_pm()
          let pms = ["npm", "yarn", "pnpm", "bun"]
          let default_idx = case detected {
            "yarn" -> 1
            "pnpm" -> 2
            "bun" -> 3
            _ -> 0
          }
          let pm_labels =
            list.map(pms, fn(pm) {
              case pm == detected {
                True -> pm <> "  ← " <> t(lang, "pm.detected")
                False -> pm
              }
            })

          use pm_idx <- promise.await(prompt.select(
            completed,
            t(lang, "pm.title"),
            pm_labels,
            default_idx,
            t(lang, "hint.select"),
          ))

          case pm_idx < 0 {
            True -> cancel(lang)
            False -> {
              let pm = result.unwrap(list_at(pms, pm_idx), "npm")
              cleanup()
              promise.resolve(Options(project_name: name, pm: pm, lang: lang))
            }
          }
        }
      }
    }
  }
}
