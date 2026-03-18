import * as $command from "../../etch/etch/command.mjs";
import * as $event from "../../etch/etch/event.mjs";
import * as $stdout from "../../etch/etch/stdout.mjs";
import * as $style from "../../etch/etch/style.mjs";
import * as $terminal from "../../etch/etch/terminal.mjs";
import * as $promise from "../../gleam_javascript/gleam/javascript/promise.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { Ok, Error, toList, Empty as $Empty } from "../gleam.mjs";

function draw_banner_lines(loop$lines) {
  while (true) {
    let lines = loop$lines;
    if (lines instanceof $Empty) {
      return undefined;
    } else {
      let rest = lines.tail;
      let glendi = lines.head[0];
      let lucy = lines.head[1];
      $stdout.execute(
        toList([
          new $command.SetForegroundColor(new $style.Cyan()),
          new $command.SetAttributes(toList([new $style.Bold()])),
          new $command.Print(glendi),
          new $command.ResetStyle(),
          new $command.SetForegroundColor(new $style.Magenta()),
          new $command.Println(lucy),
          new $command.ResetStyle(),
        ]),
      );
      loop$lines = rest;
    }
  }
}

function banner_lines() {
  return toList([
    [
      "                   ████                                               ████   ████",
      "",
    ],
    [
      "                   ████                                               ████  ██████",
      "",
    ],
    [
      "                   ████                                               ████   ████",
      "",
    ],
    [
      "                   ████                                               ████",
      "           █▓█",
    ],
    [
      "   ████████ ████   ████      ████████     ████ ███████        ███████ ████   ████",
      "    ▓░▓█",
    ],
    [
      " ███████████████   ████    ████████████   ██████████████    ██████████████   ████",
      "    ▓░░▓▓▓▓",
    ],
    [
      "█████     ██████   ████   ████     █████  █████     ████   █████     █████   ████",
      "  ▓▓░░░░░░▓",
    ],
    [
      "████       █████   ████  ████       ████  █████     ████   ████      █████   ████",
      " ▓░░░░░▒░▒█",
    ],
    [
      "████        ████   ████  ███████████████  █████     ████   ████       ████   ████",
      " █▓░▒░▒░░▓",
    ],
    [
      "█████      █████   ████  ████             █████     ████   ████      █████   ████",
      "  █▓░░▒░░▓",
    ],
    [
      " ███████████████   ████   █████     ██    █████     ████   █████    ██████   ████",
      "   ▓░░░░░▓",
    ],
    [
      "  █████████ ████   ████    ████████████   █████     ████    ██████████████   ████",
      "   ▓░▒▓█▓▓",
    ],
    [
      "            ████   ████      ████████     █████     ████      ██████  ████   ████",
      "   █▓█",
    ],
    ["   █       ████", ""],
    ["  █████████████", ""],
    ["   ██████████", ""],
  ]);
}

export function draw_header() {
  draw_banner_lines(banner_lines());
  return $stdout.execute(toList([new $command.Println("")]));
}

export function draw_completed(steps) {
  return $list.each(
    steps,
    (step) => {
      let label;
      let value;
      label = step[0];
      value = step[1];
      return $stdout.execute(
        toList([
          new $command.SetForegroundColor(new $style.Green()),
          new $command.Print("  ✓ "),
          new $command.ResetStyle(),
          new $command.SetAttributes(toList([new $style.Bold()])),
          new $command.Print(label),
          new $command.ResetStyle(),
          new $command.Println(": " + value),
        ]),
      );
    },
  );
}

function draw_hint(hint) {
  return $stdout.execute(
    toList([
      new $command.Println(""),
      new $command.SetForegroundColor(new $style.BrightGrey()),
      new $command.Println("  " + hint),
      new $command.ResetStyle(),
    ]),
  );
}

function clear_screen() {
  return $stdout.execute(
    toList([new $command.Clear(new $terminal.All()), new $command.MoveTo(0, 0)]),
  );
}

function is_wide_char(code) {
  return (((((((((code >= 0xAC00) && (code <= 0xD7A3)) || ((code >= 0x1100) && (code <= 0x11FF))) || ((code >= 0x3130) && (code <= 0x318F))) || ((code >= 0x3000) && (code <= 0x30FF))) || ((code >= 0x3400) && (code <= 0x4DBF))) || ((code >= 0x4E00) && (code <= 0x9FFF))) || ((code >= 0xF900) && (code <= 0xFAFF))) || ((code >= 0xFF01) && (code <= 0xFF60))) || ((code >= 0xFFE0) && (code <= 0xFFE6));
}

function display_width(str) {
  let _pipe = $string.to_utf_codepoints(str);
  return $list.fold(
    _pipe,
    0,
    (acc, cp) => {
      let $ = is_wide_char($string.utf_codepoint_to_int(cp));
      if ($) {
        return acc + 2;
      } else {
        return acc + 1;
      }
    },
  );
}

function render_items(loop$items, loop$selected, loop$i) {
  while (true) {
    let items = loop$items;
    let selected = loop$selected;
    let i = loop$i;
    if (items instanceof $Empty) {
      return undefined;
    } else {
      let item = items.head;
      let rest = items.tail;
      let $ = i === selected;
      if ($) {
        $stdout.execute(
          toList([
            new $command.SetForegroundColor(new $style.Cyan()),
            new $command.SetAttributes(toList([new $style.Bold()])),
            new $command.Println("  ❯ " + item),
            new $command.ResetStyle(),
          ]),
        )
      } else {
        $stdout.execute(
          toList([
            new $command.SetForegroundColor(new $style.White()),
            new $command.Println("    " + item),
            new $command.ResetStyle(),
          ]),
        )
      }
      loop$items = rest;
      loop$selected = selected;
      loop$i = i + 1;
    }
  }
}

function render_select(completed, title, items, selected, hint) {
  clear_screen();
  draw_header();
  draw_completed(completed);
  if (completed instanceof $Empty) {
    undefined
  } else {
    $stdout.execute(toList([new $command.Println("")]))
  }
  $stdout.execute(
    toList([
      new $command.SetAttributes(toList([new $style.Bold()])),
      new $command.Println("  " + title),
      new $command.ResetStyle(),
      new $command.Println(""),
    ]),
  );
  render_items(items, selected, 0);
  return draw_hint(hint);
}

function select_loop(completed, title, items, selected, count, hint) {
  return $promise.await$(
    $event.read(),
    (evt) => {
      if (evt instanceof Some) {
        let $ = evt[0];
        if ($ instanceof Ok) {
          let $1 = $[0];
          if ($1 instanceof $event.Key) {
            let $2 = $1[0].kind;
            if ($2 instanceof $event.Press) {
              let $3 = $1[0].code;
              if ($3 instanceof $event.Char) {
                let $4 = $1[0].modifiers.control;
                if ($4) {
                  let $5 = $3[0];
                  if ($5 === "c") {
                    return $promise.resolve(-1);
                  } else {
                    return select_loop(
                      completed,
                      title,
                      items,
                      selected,
                      count,
                      hint,
                    );
                  }
                } else {
                  return select_loop(
                    completed,
                    title,
                    items,
                    selected,
                    count,
                    hint,
                  );
                }
              } else if ($3 instanceof $event.UpArrow) {
                let _block;
                let $4 = selected > 0;
                if ($4) {
                  _block = selected - 1;
                } else {
                  _block = count - 1;
                }
                let s = _block;
                render_select(completed, title, items, s, hint);
                return select_loop(completed, title, items, s, count, hint);
              } else if ($3 instanceof $event.DownArrow) {
                let _block;
                let $4 = selected < (count - 1);
                if ($4) {
                  _block = selected + 1;
                } else {
                  _block = 0;
                }
                let s = _block;
                render_select(completed, title, items, s, hint);
                return select_loop(completed, title, items, s, count, hint);
              } else if ($3 instanceof $event.Enter) {
                return $promise.resolve(selected);
              } else if ($3 instanceof $event.Esc) {
                return $promise.resolve(-1);
              } else {
                return select_loop(
                  completed,
                  title,
                  items,
                  selected,
                  count,
                  hint,
                );
              }
            } else {
              return select_loop(completed, title, items, selected, count, hint);
            }
          } else {
            return select_loop(completed, title, items, selected, count, hint);
          }
        } else {
          return select_loop(completed, title, items, selected, count, hint);
        }
      } else {
        return select_loop(completed, title, items, selected, count, hint);
      }
    },
  );
}

export function select(completed, title, items, default$, hint) {
  render_select(completed, title, items, default$, hint);
  return select_loop(
    completed,
    title,
    items,
    default$,
    $list.length(items),
    hint,
  );
}

function render_input(
  completed,
  title,
  value,
  cursor,
  error,
  preview_lines,
  hint
) {
  clear_screen();
  draw_header();
  draw_completed(completed);
  let prefix = ("  " + title) + ": ";
  $stdout.execute(
    toList([
      new $command.Println(""),
      new $command.SetAttributes(toList([new $style.Bold()])),
      new $command.Print(prefix),
      new $command.ResetStyle(),
      new $command.Println(value),
    ]),
  );
  if (error instanceof Some) {
    let err = error[0];
    $stdout.execute(
      toList([
        new $command.SetForegroundColor(new $style.Red()),
        new $command.Println("  " + err),
        new $command.ResetStyle(),
      ]),
    )
  } else {
    if (preview_lines instanceof $Empty) {
      $stdout.execute(toList([new $command.Println("")]))
    } else {
      let lines = preview_lines;
      $stdout.execute(toList([new $command.Println("")]));
      $list.each(
        lines,
        (line) => {
          return $stdout.execute(
            toList([
              new $command.SetForegroundColor(new $style.BrightGrey()),
              new $command.Println("    " + line),
              new $command.ResetStyle(),
            ]),
          );
        },
      )
    }
  }
  draw_hint(hint);
  let input_row = (17 + $list.length(completed)) + 1;
  let input_col = display_width(prefix) + display_width(
    $string.slice(value, 0, cursor),
  );
  return $stdout.execute(
    toList([
      new $command.MoveTo(input_col, input_row),
      new $command.ShowCursor(),
    ]),
  );
}

function input_loop(completed, title, value, cursor, validate, preview, hint) {
  return $promise.await$(
    $event.read(),
    (evt) => {
      if (evt instanceof Some) {
        let $ = evt[0];
        if ($ instanceof Ok) {
          let $1 = $[0];
          if ($1 instanceof $event.Key) {
            let $2 = $1[0].modifiers.control;
            if ($2) {
              let $3 = $1[0].kind;
              if ($3 instanceof $event.Press) {
                let $4 = $1[0].code;
                if ($4 instanceof $event.Char) {
                  let $5 = $4[0];
                  if ($5 === "c") {
                    return $promise.resolve(new Error(undefined));
                  } else {
                    return input_loop(
                      completed,
                      title,
                      value,
                      cursor,
                      validate,
                      preview,
                      hint,
                    );
                  }
                } else if ($4 instanceof $event.LeftArrow) {
                  let $5 = cursor > 0;
                  if ($5) {
                    let cur = cursor - 1;
                    render_input(
                      completed,
                      title,
                      value,
                      cur,
                      validate(value),
                      preview(value),
                      hint,
                    );
                    return input_loop(
                      completed,
                      title,
                      value,
                      cur,
                      validate,
                      preview,
                      hint,
                    );
                  } else {
                    return input_loop(
                      completed,
                      title,
                      value,
                      cursor,
                      validate,
                      preview,
                      hint,
                    );
                  }
                } else if ($4 instanceof $event.RightArrow) {
                  let len = $string.length(value);
                  let $5 = cursor < len;
                  if ($5) {
                    let cur = cursor + 1;
                    render_input(
                      completed,
                      title,
                      value,
                      cur,
                      validate(value),
                      preview(value),
                      hint,
                    );
                    return input_loop(
                      completed,
                      title,
                      value,
                      cur,
                      validate,
                      preview,
                      hint,
                    );
                  } else {
                    return input_loop(
                      completed,
                      title,
                      value,
                      cursor,
                      validate,
                      preview,
                      hint,
                    );
                  }
                } else if ($4 instanceof $event.Home) {
                  render_input(
                    completed,
                    title,
                    value,
                    0,
                    validate(value),
                    preview(value),
                    hint,
                  );
                  return input_loop(
                    completed,
                    title,
                    value,
                    0,
                    validate,
                    preview,
                    hint,
                  );
                } else if ($4 instanceof $event.End) {
                  let len = $string.length(value);
                  render_input(
                    completed,
                    title,
                    value,
                    len,
                    validate(value),
                    preview(value),
                    hint,
                  );
                  return input_loop(
                    completed,
                    title,
                    value,
                    len,
                    validate,
                    preview,
                    hint,
                  );
                } else if ($4 instanceof $event.Delete) {
                  let len = $string.length(value);
                  let $5 = cursor < len;
                  if ($5) {
                    let before = $string.slice(value, 0, cursor);
                    let after = $string.slice(
                      value,
                      cursor + 1,
                      (len - cursor) - 1,
                    );
                    let v = before + after;
                    render_input(
                      completed,
                      title,
                      v,
                      cursor,
                      validate(v),
                      preview(v),
                      hint,
                    );
                    return input_loop(
                      completed,
                      title,
                      v,
                      cursor,
                      validate,
                      preview,
                      hint,
                    );
                  } else {
                    return input_loop(
                      completed,
                      title,
                      value,
                      cursor,
                      validate,
                      preview,
                      hint,
                    );
                  }
                } else if ($4 instanceof $event.Enter) {
                  let trimmed = $string.trim(value);
                  let $5 = validate(trimmed);
                  if ($5 instanceof Some) {
                    return input_loop(
                      completed,
                      title,
                      value,
                      cursor,
                      validate,
                      preview,
                      hint,
                    );
                  } else {
                    return $promise.resolve(new Ok(trimmed));
                  }
                } else if ($4 instanceof $event.Backspace) {
                  let $5 = cursor > 0;
                  if ($5) {
                    let before = $string.slice(value, 0, cursor - 1);
                    let after = $string.slice(
                      value,
                      cursor,
                      $string.length(value) - cursor,
                    );
                    let v = before + after;
                    let cur = cursor - 1;
                    render_input(
                      completed,
                      title,
                      v,
                      cur,
                      validate(v),
                      preview(v),
                      hint,
                    );
                    return input_loop(
                      completed,
                      title,
                      v,
                      cur,
                      validate,
                      preview,
                      hint,
                    );
                  } else {
                    return input_loop(
                      completed,
                      title,
                      value,
                      cursor,
                      validate,
                      preview,
                      hint,
                    );
                  }
                } else if ($4 instanceof $event.Esc) {
                  return $promise.resolve(new Error(undefined));
                } else {
                  return input_loop(
                    completed,
                    title,
                    value,
                    cursor,
                    validate,
                    preview,
                    hint,
                  );
                }
              } else {
                return input_loop(
                  completed,
                  title,
                  value,
                  cursor,
                  validate,
                  preview,
                  hint,
                );
              }
            } else {
              let $3 = $1[0].modifiers.alt;
              if (!$3) {
                let $4 = $1[0].kind;
                if ($4 instanceof $event.Press) {
                  let $5 = $1[0].code;
                  if ($5 instanceof $event.Char) {
                    let c = $5[0];
                    let before = $string.slice(value, 0, cursor);
                    let after = $string.slice(
                      value,
                      cursor,
                      $string.length(value) - cursor,
                    );
                    let v = (before + c) + after;
                    let cur = cursor + 1;
                    render_input(
                      completed,
                      title,
                      v,
                      cur,
                      validate(v),
                      preview(v),
                      hint,
                    );
                    return input_loop(
                      completed,
                      title,
                      v,
                      cur,
                      validate,
                      preview,
                      hint,
                    );
                  } else if ($5 instanceof $event.LeftArrow) {
                    let $6 = cursor > 0;
                    if ($6) {
                      let cur = cursor - 1;
                      render_input(
                        completed,
                        title,
                        value,
                        cur,
                        validate(value),
                        preview(value),
                        hint,
                      );
                      return input_loop(
                        completed,
                        title,
                        value,
                        cur,
                        validate,
                        preview,
                        hint,
                      );
                    } else {
                      return input_loop(
                        completed,
                        title,
                        value,
                        cursor,
                        validate,
                        preview,
                        hint,
                      );
                    }
                  } else if ($5 instanceof $event.RightArrow) {
                    let len = $string.length(value);
                    let $6 = cursor < len;
                    if ($6) {
                      let cur = cursor + 1;
                      render_input(
                        completed,
                        title,
                        value,
                        cur,
                        validate(value),
                        preview(value),
                        hint,
                      );
                      return input_loop(
                        completed,
                        title,
                        value,
                        cur,
                        validate,
                        preview,
                        hint,
                      );
                    } else {
                      return input_loop(
                        completed,
                        title,
                        value,
                        cursor,
                        validate,
                        preview,
                        hint,
                      );
                    }
                  } else if ($5 instanceof $event.Home) {
                    render_input(
                      completed,
                      title,
                      value,
                      0,
                      validate(value),
                      preview(value),
                      hint,
                    );
                    return input_loop(
                      completed,
                      title,
                      value,
                      0,
                      validate,
                      preview,
                      hint,
                    );
                  } else if ($5 instanceof $event.End) {
                    let len = $string.length(value);
                    render_input(
                      completed,
                      title,
                      value,
                      len,
                      validate(value),
                      preview(value),
                      hint,
                    );
                    return input_loop(
                      completed,
                      title,
                      value,
                      len,
                      validate,
                      preview,
                      hint,
                    );
                  } else if ($5 instanceof $event.Delete) {
                    let len = $string.length(value);
                    let $6 = cursor < len;
                    if ($6) {
                      let before = $string.slice(value, 0, cursor);
                      let after = $string.slice(
                        value,
                        cursor + 1,
                        (len - cursor) - 1,
                      );
                      let v = before + after;
                      render_input(
                        completed,
                        title,
                        v,
                        cursor,
                        validate(v),
                        preview(v),
                        hint,
                      );
                      return input_loop(
                        completed,
                        title,
                        v,
                        cursor,
                        validate,
                        preview,
                        hint,
                      );
                    } else {
                      return input_loop(
                        completed,
                        title,
                        value,
                        cursor,
                        validate,
                        preview,
                        hint,
                      );
                    }
                  } else if ($5 instanceof $event.Enter) {
                    let trimmed = $string.trim(value);
                    let $6 = validate(trimmed);
                    if ($6 instanceof Some) {
                      return input_loop(
                        completed,
                        title,
                        value,
                        cursor,
                        validate,
                        preview,
                        hint,
                      );
                    } else {
                      return $promise.resolve(new Ok(trimmed));
                    }
                  } else if ($5 instanceof $event.Backspace) {
                    let $6 = cursor > 0;
                    if ($6) {
                      let before = $string.slice(value, 0, cursor - 1);
                      let after = $string.slice(
                        value,
                        cursor,
                        $string.length(value) - cursor,
                      );
                      let v = before + after;
                      let cur = cursor - 1;
                      render_input(
                        completed,
                        title,
                        v,
                        cur,
                        validate(v),
                        preview(v),
                        hint,
                      );
                      return input_loop(
                        completed,
                        title,
                        v,
                        cur,
                        validate,
                        preview,
                        hint,
                      );
                    } else {
                      return input_loop(
                        completed,
                        title,
                        value,
                        cursor,
                        validate,
                        preview,
                        hint,
                      );
                    }
                  } else if ($5 instanceof $event.Esc) {
                    return $promise.resolve(new Error(undefined));
                  } else {
                    return input_loop(
                      completed,
                      title,
                      value,
                      cursor,
                      validate,
                      preview,
                      hint,
                    );
                  }
                } else {
                  return input_loop(
                    completed,
                    title,
                    value,
                    cursor,
                    validate,
                    preview,
                    hint,
                  );
                }
              } else {
                let $4 = $1[0].kind;
                if ($4 instanceof $event.Press) {
                  let $5 = $1[0].code;
                  if ($5 instanceof $event.LeftArrow) {
                    let $6 = cursor > 0;
                    if ($6) {
                      let cur = cursor - 1;
                      render_input(
                        completed,
                        title,
                        value,
                        cur,
                        validate(value),
                        preview(value),
                        hint,
                      );
                      return input_loop(
                        completed,
                        title,
                        value,
                        cur,
                        validate,
                        preview,
                        hint,
                      );
                    } else {
                      return input_loop(
                        completed,
                        title,
                        value,
                        cursor,
                        validate,
                        preview,
                        hint,
                      );
                    }
                  } else if ($5 instanceof $event.RightArrow) {
                    let len = $string.length(value);
                    let $6 = cursor < len;
                    if ($6) {
                      let cur = cursor + 1;
                      render_input(
                        completed,
                        title,
                        value,
                        cur,
                        validate(value),
                        preview(value),
                        hint,
                      );
                      return input_loop(
                        completed,
                        title,
                        value,
                        cur,
                        validate,
                        preview,
                        hint,
                      );
                    } else {
                      return input_loop(
                        completed,
                        title,
                        value,
                        cursor,
                        validate,
                        preview,
                        hint,
                      );
                    }
                  } else if ($5 instanceof $event.Home) {
                    render_input(
                      completed,
                      title,
                      value,
                      0,
                      validate(value),
                      preview(value),
                      hint,
                    );
                    return input_loop(
                      completed,
                      title,
                      value,
                      0,
                      validate,
                      preview,
                      hint,
                    );
                  } else if ($5 instanceof $event.End) {
                    let len = $string.length(value);
                    render_input(
                      completed,
                      title,
                      value,
                      len,
                      validate(value),
                      preview(value),
                      hint,
                    );
                    return input_loop(
                      completed,
                      title,
                      value,
                      len,
                      validate,
                      preview,
                      hint,
                    );
                  } else if ($5 instanceof $event.Delete) {
                    let len = $string.length(value);
                    let $6 = cursor < len;
                    if ($6) {
                      let before = $string.slice(value, 0, cursor);
                      let after = $string.slice(
                        value,
                        cursor + 1,
                        (len - cursor) - 1,
                      );
                      let v = before + after;
                      render_input(
                        completed,
                        title,
                        v,
                        cursor,
                        validate(v),
                        preview(v),
                        hint,
                      );
                      return input_loop(
                        completed,
                        title,
                        v,
                        cursor,
                        validate,
                        preview,
                        hint,
                      );
                    } else {
                      return input_loop(
                        completed,
                        title,
                        value,
                        cursor,
                        validate,
                        preview,
                        hint,
                      );
                    }
                  } else if ($5 instanceof $event.Enter) {
                    let trimmed = $string.trim(value);
                    let $6 = validate(trimmed);
                    if ($6 instanceof Some) {
                      return input_loop(
                        completed,
                        title,
                        value,
                        cursor,
                        validate,
                        preview,
                        hint,
                      );
                    } else {
                      return $promise.resolve(new Ok(trimmed));
                    }
                  } else if ($5 instanceof $event.Backspace) {
                    let $6 = cursor > 0;
                    if ($6) {
                      let before = $string.slice(value, 0, cursor - 1);
                      let after = $string.slice(
                        value,
                        cursor,
                        $string.length(value) - cursor,
                      );
                      let v = before + after;
                      let cur = cursor - 1;
                      render_input(
                        completed,
                        title,
                        v,
                        cur,
                        validate(v),
                        preview(v),
                        hint,
                      );
                      return input_loop(
                        completed,
                        title,
                        v,
                        cur,
                        validate,
                        preview,
                        hint,
                      );
                    } else {
                      return input_loop(
                        completed,
                        title,
                        value,
                        cursor,
                        validate,
                        preview,
                        hint,
                      );
                    }
                  } else if ($5 instanceof $event.Esc) {
                    return $promise.resolve(new Error(undefined));
                  } else {
                    return input_loop(
                      completed,
                      title,
                      value,
                      cursor,
                      validate,
                      preview,
                      hint,
                    );
                  }
                } else {
                  return input_loop(
                    completed,
                    title,
                    value,
                    cursor,
                    validate,
                    preview,
                    hint,
                  );
                }
              }
            }
          } else {
            return input_loop(
              completed,
              title,
              value,
              cursor,
              validate,
              preview,
              hint,
            );
          }
        } else {
          return input_loop(
            completed,
            title,
            value,
            cursor,
            validate,
            preview,
            hint,
          );
        }
      } else {
        return input_loop(
          completed,
          title,
          value,
          cursor,
          validate,
          preview,
          hint,
        );
      }
    },
  );
}

export function text_input(completed, title, initial, validate, preview, hint) {
  let cursor = $string.length(initial);
  render_input(
    completed,
    title,
    initial,
    cursor,
    validate(initial),
    preview(initial),
    hint,
  );
  return input_loop(completed, title, initial, cursor, validate, preview, hint);
}
