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

export function draw_header() {
  return $stdout.execute(
    toList([
      new $command.SetForegroundColor(new $style.Cyan()),
      new $command.SetAttributes(toList([new $style.Bold()])),
      new $command.Println("  create-mendix-widget-gleam"),
      new $command.ResetStyle(),
      new $command.Println(""),
    ]),
  );
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
  $stdout.execute(
    toList([
      new $command.Println(""),
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

function render_input(completed, title, value, error, preview_lines, hint) {
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
  let input_row = (2 + $list.length(completed)) + 1;
  let input_col = $string.length(prefix) + $string.length(value);
  return $stdout.execute(
    toList([
      new $command.MoveTo(input_col, input_row),
      new $command.ShowCursor(),
    ]),
  );
}

function input_loop(completed, title, value, validate, preview, hint) {
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
                      validate,
                      preview,
                      hint,
                    );
                  } else {
                    return $promise.resolve(new Ok(trimmed));
                  }
                } else if ($4 instanceof $event.Backspace) {
                  let v = $string.drop_end(value, 1);
                  render_input(
                    completed,
                    title,
                    v,
                    validate(v),
                    preview(v),
                    hint,
                  );
                  return input_loop(
                    completed,
                    title,
                    v,
                    validate,
                    preview,
                    hint,
                  );
                } else if ($4 instanceof $event.Esc) {
                  return $promise.resolve(new Error(undefined));
                } else {
                  return input_loop(
                    completed,
                    title,
                    value,
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
                    let v = value + c;
                    render_input(
                      completed,
                      title,
                      v,
                      validate(v),
                      preview(v),
                      hint,
                    );
                    return input_loop(
                      completed,
                      title,
                      v,
                      validate,
                      preview,
                      hint,
                    );
                  } else if ($5 instanceof $event.Enter) {
                    let trimmed = $string.trim(value);
                    let $6 = validate(trimmed);
                    if ($6 instanceof Some) {
                      return input_loop(
                        completed,
                        title,
                        value,
                        validate,
                        preview,
                        hint,
                      );
                    } else {
                      return $promise.resolve(new Ok(trimmed));
                    }
                  } else if ($5 instanceof $event.Backspace) {
                    let v = $string.drop_end(value, 1);
                    render_input(
                      completed,
                      title,
                      v,
                      validate(v),
                      preview(v),
                      hint,
                    );
                    return input_loop(
                      completed,
                      title,
                      v,
                      validate,
                      preview,
                      hint,
                    );
                  } else if ($5 instanceof $event.Esc) {
                    return $promise.resolve(new Error(undefined));
                  } else {
                    return input_loop(
                      completed,
                      title,
                      value,
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
                    validate,
                    preview,
                    hint,
                  );
                }
              } else {
                let $4 = $1[0].kind;
                if ($4 instanceof $event.Press) {
                  let $5 = $1[0].code;
                  if ($5 instanceof $event.Enter) {
                    let trimmed = $string.trim(value);
                    let $6 = validate(trimmed);
                    if ($6 instanceof Some) {
                      return input_loop(
                        completed,
                        title,
                        value,
                        validate,
                        preview,
                        hint,
                      );
                    } else {
                      return $promise.resolve(new Ok(trimmed));
                    }
                  } else if ($5 instanceof $event.Backspace) {
                    let v = $string.drop_end(value, 1);
                    render_input(
                      completed,
                      title,
                      v,
                      validate(v),
                      preview(v),
                      hint,
                    );
                    return input_loop(
                      completed,
                      title,
                      v,
                      validate,
                      preview,
                      hint,
                    );
                  } else if ($5 instanceof $event.Esc) {
                    return $promise.resolve(new Error(undefined));
                  } else {
                    return input_loop(
                      completed,
                      title,
                      value,
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
                    validate,
                    preview,
                    hint,
                  );
                }
              }
            }
          } else {
            return input_loop(completed, title, value, validate, preview, hint);
          }
        } else {
          return input_loop(completed, title, value, validate, preview, hint);
        }
      } else {
        return input_loop(completed, title, value, validate, preview, hint);
      }
    },
  );
}

export function text_input(completed, title, initial, validate, preview, hint) {
  render_input(
    completed,
    title,
    initial,
    validate(initial),
    preview(initial),
    hint,
  );
  return input_loop(completed, title, initial, validate, preview, hint);
}
