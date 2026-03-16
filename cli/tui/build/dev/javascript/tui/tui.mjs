import * as $command from "../etch/etch/command.mjs";
import * as $event from "../etch/etch/event.mjs";
import * as $stdout from "../etch/etch/stdout.mjs";
import * as $terminal from "../etch/etch/terminal.mjs";
import * as $array from "../gleam_javascript/gleam/javascript/array.mjs";
import * as $promise from "../gleam_javascript/gleam/javascript/promise.mjs";
import * as $io from "../gleam_stdlib/gleam/io.mjs";
import * as $list from "../gleam_stdlib/gleam/list.mjs";
import * as $option from "../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../gleam_stdlib/gleam/option.mjs";
import * as $result from "../gleam_stdlib/gleam/result.mjs";
import * as $string from "../gleam_stdlib/gleam/string.mjs";
import { Ok, toList, Empty as $Empty, CustomType as $CustomType, makeError } from "./gleam.mjs";
import * as $prompt from "./tui/prompt.mjs";
import {
  dir_exists,
  detect_pm,
  process_exit,
  is_valid_name,
  split_words as split_words_ffi,
} from "./tui_ffi.mjs";

const FILEPATH = "src\\tui.gleam";

export class Options extends $CustomType {
  constructor(project_name, pm, lang) {
    super();
    this.project_name = project_name;
    this.pm = pm;
    this.lang = lang;
  }
}
export const Options$Options = (project_name, pm, lang) =>
  new Options(project_name, pm, lang);
export const Options$isOptions = (value) => value instanceof Options;
export const Options$Options$project_name = (value) => value.project_name;
export const Options$Options$0 = (value) => value.project_name;
export const Options$Options$pm = (value) => value.pm;
export const Options$Options$1 = (value) => value.pm;
export const Options$Options$lang = (value) => value.lang;
export const Options$Options$2 = (value) => value.lang;

function split_words(input) {
  let _pipe = split_words_ffi(input);
  return $array.to_list(_pipe);
}

function list_at(items, index) {
  let _pipe = items;
  let _pipe$1 = $list.drop(_pipe, index);
  return $list.first(_pipe$1);
}

function capitalize(word) {
  let $ = $string.first(word);
  if ($ instanceof Ok) {
    let first = $[0];
    return $string.uppercase(first) + $string.drop_start(word, 1);
  } else {
    return "";
  }
}

function to_pascal(words) {
  let _pipe = words;
  let _pipe$1 = $list.map(_pipe, capitalize);
  return $string.join(_pipe$1, "");
}

function to_snake(words) {
  return $string.join(words, "_");
}

function t(lang, key) {
  if (key === "lang.title") {
    return "Language / 언어 / 言語";
  } else if (key === "name.title") {
    if (lang === "en") {
      return "Project name";
    } else if (lang === "ko") {
      return "프로젝트 이름";
    } else if (lang === "ja") {
      return "プロジェクト名";
    } else {
      return key;
    }
  } else if (key === "name.widget") {
    if (lang === "en") {
      return "Widget";
    } else if (lang === "ko") {
      return "위젯";
    } else if (lang === "ja") {
      return "ウィジェット";
    } else {
      return key;
    }
  } else if (key === "name.module") {
    if (lang === "en") {
      return "Module";
    } else if (lang === "ko") {
      return "모듈";
    } else if (lang === "ja") {
      return "モジュール";
    } else {
      return key;
    }
  } else if (key === "name.empty") {
    if (lang === "en") {
      return "Please enter a project name.";
    } else if (lang === "ko") {
      return "프로젝트 이름을 입력해주세요.";
    } else if (lang === "ja") {
      return "プロジェクト名を入力してください。";
    } else {
      return key;
    }
  } else if (key === "name.invalid") {
    if (lang === "en") {
      return "Must start with a letter (a-z, A-Z, 0-9, -, _ only)";
    } else if (lang === "ko") {
      return "영문자로 시작, 영문자/숫자/-/_ 만 사용 가능";
    } else if (lang === "ja") {
      return "英字で始まり、英字/数字/-/_ のみ使用可能";
    } else {
      return key;
    }
  } else if (key === "name.exists") {
    if (lang === "en") {
      return "Directory already exists!";
    } else if (lang === "ko") {
      return "디렉토리가 이미 존재합니다!";
    } else if (lang === "ja") {
      return "ディレクトリは既に存在します！";
    } else {
      return key;
    }
  } else if (key === "pm.title") {
    if (lang === "en") {
      return "Package Manager";
    } else if (lang === "ko") {
      return "패키지 매니저";
    } else if (lang === "ja") {
      return "パッケージマネージャー";
    } else {
      return key;
    }
  } else if (key === "pm.detected") {
    if (lang === "en") {
      return "detected";
    } else if (lang === "ko") {
      return "감지됨";
    } else if (lang === "ja") {
      return "検出済み";
    } else {
      return key;
    }
  } else if (key === "hint.select") {
    return "↑↓ move  ⏎ select  Esc cancel";
  } else if (key === "hint.input") {
    return "⏎ confirm  Esc cancel";
  } else if (key === "cancelled") {
    if (lang === "en") {
      return "Cancelled.";
    } else if (lang === "ko") {
      return "취소되었습니다.";
    } else if (lang === "ja") {
      return "キャンセルされました。";
    } else {
      return key;
    }
  } else {
    return key;
  }
}

function validate_name(lang, value) {
  let trimmed = $string.trim(value);
  if (trimmed === "") {
    return new Some(t(lang, "name.empty"));
  } else {
    let $ = is_valid_name(trimmed);
    if ($) {
      let $1 = dir_exists(trimmed);
      if ($1) {
        return new Some(t(lang, "name.exists"));
      } else {
        return new None();
      }
    } else {
      return new Some(t(lang, "name.invalid"));
    }
  }
}

function name_preview(lang, value) {
  let words = split_words($string.trim(value));
  if (words instanceof $Empty) {
    return words;
  } else {
    return toList([
      (t(lang, "name.widget") + ":  ") + to_pascal(words),
      (t(lang, "name.module") + ":  ") + to_snake(words),
    ]);
  }
}

function cleanup() {
  $stdout.execute(
    toList([new $command.ShowCursor(), new $command.LeaveAlternateScreen()]),
  );
  let $ = $terminal.exit_raw();
  
  return undefined;
}

function cancel(lang) {
  cleanup();
  $io.println("\n" + t(lang, "cancelled"));
  process_exit(0);
  return $promise.resolve(new Options("", "", ""));
}

export function collect_options(cli_name) {
  let $ = $terminal.enter_raw();
  if (!($ instanceof Ok)) {
    throw makeError(
      "let_assert",
      FILEPATH,
      "tui",
      163,
      "collect_options",
      "Pattern match failed, no pattern matched the value.",
      {
        value: $,
        start: 5543,
        end: 5582,
        pattern_start: 5554,
        pattern_end: 5559
      }
    )
  }
  $stdout.execute(
    toList([new $command.EnterAlternateScreen(), new $command.HideCursor()]),
  );
  let $1 = $event.init_event_server();
  
  let languages = toList(["English", "한국어", "日本語"]);
  let lang_codes = toList(["en", "ko", "ja"]);
  return $promise.await$(
    $prompt.select(
      toList([]),
      t("en", "lang.title"),
      languages,
      0,
      t("en", "hint.select"),
    ),
    (lang_idx) => {
      let $2 = lang_idx < 0;
      if ($2) {
        return cancel("en");
      } else {
        let lang = $result.unwrap(list_at(lang_codes, lang_idx), "en");
        let lang_label = $result.unwrap(list_at(languages, lang_idx), "English");
        let completed = toList([["Language", lang_label]]);
        $stdout.execute(toList([new $command.ShowCursor()]));
        return $promise.await$(
          $prompt.text_input(
            completed,
            t(lang, "name.title"),
            cli_name,
            (_capture) => { return validate_name(lang, _capture); },
            (_capture) => { return name_preview(lang, _capture); },
            t(lang, "hint.input"),
          ),
          (name_result) => {
            if (name_result instanceof Ok) {
              let name = name_result[0];
              $stdout.execute(toList([new $command.HideCursor()]));
              let completed$1 = toList([
                ["Language", lang_label],
                ["Project", name],
              ]);
              let detected = detect_pm();
              let pms = toList(["npm", "yarn", "pnpm", "bun"]);
              let _block;
              if (detected === "yarn") {
                _block = 1;
              } else if (detected === "pnpm") {
                _block = 2;
              } else if (detected === "bun") {
                _block = 3;
              } else {
                _block = 0;
              }
              let default_idx = _block;
              let pm_labels = $list.map(
                pms,
                (pm) => {
                  let $3 = pm === detected;
                  if ($3) {
                    return (pm + "  ← ") + t(lang, "pm.detected");
                  } else {
                    return pm;
                  }
                },
              );
              return $promise.await$(
                $prompt.select(
                  completed$1,
                  t(lang, "pm.title"),
                  pm_labels,
                  default_idx,
                  t(lang, "hint.select"),
                ),
                (pm_idx) => {
                  let $3 = pm_idx < 0;
                  if ($3) {
                    return cancel(lang);
                  } else {
                    let pm = $result.unwrap(list_at(pms, pm_idx), "npm");
                    cleanup();
                    return $promise.resolve(new Options(name, pm, lang));
                  }
                },
              );
            } else {
              return cancel(lang);
            }
          },
        );
      }
    },
  );
}
