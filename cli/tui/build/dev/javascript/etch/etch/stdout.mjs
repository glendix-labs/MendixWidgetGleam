import * as $io from "../../gleam_stdlib/gleam/io.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $stree from "../../gleam_stdlib/gleam/string_tree.mjs";
import { append } from "../../gleam_stdlib/gleam/string_tree.mjs";
import * as $command from "../etch/command.mjs";
import {
  Clear,
  DisableFocusChange,
  DisableLineWrap,
  DisableMouseCapture,
  EnableFocusChange,
  EnableLineWrap,
  EnableMouseCapture,
  EnterAlternateScreen,
  HideCursor,
  LeaveAlternateScreen,
  MoveDown,
  MoveLeft,
  MoveRight,
  MoveTo,
  MoveToColumn,
  MoveToNextLine,
  MoveToPreviousLine,
  MoveToRow,
  MoveUp,
  PopKeyboardEnhancementFlags,
  Print,
  PrintReset,
  Println,
  PrintlnReset,
  PushKeyboardEnhancementFlags,
  ResetAttributes,
  ResetBackground,
  ResetColor,
  ResetForeground,
  ResetStyle,
  RestorePosition,
  SavePosition,
  ScrollDown,
  ScrollUp,
  SetAttributes,
  SetBackgroundColor,
  SetCursorStyle,
  SetForegroundAndBackgroundColors,
  SetForegroundColor,
  SetSize,
  SetStyle,
  SetTitle,
  ShowCursor,
} from "../etch/command.mjs";
import * as $cursor from "../etch/cursor.mjs";
import {
  hide,
  move_down,
  move_left,
  move_right,
  move_to,
  move_to_column,
  move_to_next_line,
  move_to_previous_line,
  move_to_row,
  move_up,
  restore_position,
  save_position,
  set_cursor_style,
  show,
} from "../etch/cursor.mjs";
import * as $event from "../etch/event.mjs";
import {
  disable_focus_change,
  disable_mouse_capture,
  enable_focus_change,
  enable_mouse_capture,
  pop_keyboard_enhancement_flags,
  push_keyboard_enhancement_flags,
} from "../etch/event.mjs";
import * as $consts from "../etch/internal/consts.mjs";
import { csi } from "../etch/internal/consts.mjs";
import * as $style from "../etch/style.mjs";
import {
  attributes,
  on,
  reset_attributes,
  reset_background,
  reset_color,
  reset_foreground,
  reset_style,
  set_style,
  with$,
  with_on,
} from "../etch/style.mjs";
import * as $terminal from "../etch/terminal.mjs";
import {
  disable_line_wrap,
  enable_line_wrap,
  enter_alternative,
  leave_alternative,
  scroll_down,
  scroll_up,
  set_size,
  set_title,
} from "../etch/terminal.mjs";
import { toList, Empty as $Empty, CustomType as $CustomType } from "../gleam.mjs";

export class Queue extends $CustomType {
  constructor(commands) {
    super();
    this.commands = commands;
  }
}
export const Queue$Queue = (commands) => new Queue(commands);
export const Queue$isQueue = (value) => value instanceof Queue;
export const Queue$Queue$commands = (value) => value.commands;
export const Queue$Queue$0 = (value) => value.commands;

/**
 * Adds [`Commands`](#command.html#Command)
 * to the [`Queue`](stdout.html#Command).
 */
export function queue(queue, commands) {
  return new Queue($list.append(queue.commands, commands));
}

function flush_inner(loop$commands, loop$tree) {
  while (true) {
    let commands = loop$commands;
    let tree = loop$tree;
    if (commands instanceof $Empty) {
      return $io.print(
        (() => {
          let _pipe = tree;
          return $stree.to_string(_pipe);
        })(),
      );
    } else {
      let $ = commands.head;
      if ($ instanceof Print) {
        let rest = commands.tail;
        let str = $.s;
        loop$commands = rest;
        loop$tree = (() => {
          let _pipe = tree;
          return append(_pipe, str);
        })();
      } else if ($ instanceof PrintReset) {
        let rest = commands.tail;
        let str = $.s;
        loop$commands = rest;
        loop$tree = append(tree, (str + csi) + "0m");
      } else if ($ instanceof Println) {
        let rest = commands.tail;
        let str = $.s;
        loop$commands = rest;
        loop$tree = append(tree, str + move_to_next_line(1));
      } else if ($ instanceof PrintlnReset) {
        let rest = commands.tail;
        let str = $.s;
        loop$commands = rest;
        loop$tree = append(tree, ((str + move_to_next_line(1)) + csi) + "0m");
      } else if ($ instanceof MoveUp) {
        let rest = commands.tail;
        let n = $.n;
        loop$commands = rest;
        loop$tree = append(tree, move_up(n));
      } else if ($ instanceof MoveDown) {
        let rest = commands.tail;
        let n = $.n;
        loop$commands = rest;
        loop$tree = append(tree, move_down(n));
      } else if ($ instanceof MoveLeft) {
        let rest = commands.tail;
        let n = $.n;
        loop$commands = rest;
        loop$tree = append(tree, move_left(n));
      } else if ($ instanceof MoveRight) {
        let rest = commands.tail;
        let n = $.n;
        loop$commands = rest;
        loop$tree = append(tree, move_right(n));
      } else if ($ instanceof MoveToNextLine) {
        let rest = commands.tail;
        let n = $.n;
        loop$commands = rest;
        loop$tree = (() => {
          let _pipe = tree;
          return append(_pipe, move_to_next_line(n));
        })();
      } else if ($ instanceof MoveToPreviousLine) {
        let rest = commands.tail;
        let n = $.n;
        loop$commands = rest;
        loop$tree = (() => {
          let _pipe = tree;
          return append(_pipe, move_to_previous_line(n));
        })();
      } else if ($ instanceof MoveToColumn) {
        let rest = commands.tail;
        let n = $.n;
        loop$commands = rest;
        loop$tree = (() => {
          let _pipe = tree;
          return append(_pipe, move_to_column(n));
        })();
      } else if ($ instanceof MoveToRow) {
        let rest = commands.tail;
        let n = $.n;
        loop$commands = rest;
        loop$tree = append(tree, move_to_row(n));
      } else if ($ instanceof MoveTo) {
        let rest = commands.tail;
        let x = $.column;
        let y = $.row;
        loop$commands = rest;
        loop$tree = append(tree, move_to(x, y));
      } else if ($ instanceof SavePosition) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, save_position());
      } else if ($ instanceof RestorePosition) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = (() => {
          let _pipe = tree;
          return append(_pipe, restore_position());
        })();
      } else if ($ instanceof ShowCursor) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, show());
      } else if ($ instanceof HideCursor) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, hide());
      } else if ($ instanceof SetCursorStyle) {
        let rest = commands.tail;
        let s = $.style;
        loop$commands = rest;
        loop$tree = append(tree, set_cursor_style(s));
      } else if ($ instanceof ScrollUp) {
        let rest = commands.tail;
        let n = $.n;
        loop$commands = rest;
        loop$tree = append(tree, scroll_up(n));
      } else if ($ instanceof ScrollDown) {
        let rest = commands.tail;
        let n = $.n;
        loop$commands = rest;
        loop$tree = append(tree, scroll_down(n));
      } else if ($ instanceof Clear) {
        let rest = commands.tail;
        let t = $.clear_type;
        loop$commands = rest;
        loop$tree = append(tree, $terminal.clear(t));
      } else if ($ instanceof SetSize) {
        let rest = commands.tail;
        let x = $.columns;
        let y = $.rows;
        loop$commands = rest;
        loop$tree = append(tree, set_size(x, y));
      } else if ($ instanceof SetTitle) {
        let rest = commands.tail;
        let s = $.title;
        loop$commands = rest;
        loop$tree = append(tree, set_title(s));
      } else if ($ instanceof DisableLineWrap) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, disable_line_wrap());
      } else if ($ instanceof EnableLineWrap) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, enable_line_wrap());
      } else if ($ instanceof EnterAlternateScreen) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, enter_alternative());
      } else if ($ instanceof LeaveAlternateScreen) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, leave_alternative());
      } else if ($ instanceof EnableMouseCapture) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, enable_mouse_capture());
      } else if ($ instanceof DisableMouseCapture) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, disable_mouse_capture());
      } else if ($ instanceof PushKeyboardEnhancementFlags) {
        let rest = commands.tail;
        let f = $.flags;
        loop$commands = rest;
        loop$tree = append(tree, push_keyboard_enhancement_flags(f));
      } else if ($ instanceof PopKeyboardEnhancementFlags) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = (() => {
          let _pipe = tree;
          return append(_pipe, pop_keyboard_enhancement_flags());
        })();
      } else if ($ instanceof EnableFocusChange) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, enable_focus_change());
      } else if ($ instanceof DisableFocusChange) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, disable_focus_change());
      } else if ($ instanceof SetForegroundColor) {
        let rest = commands.tail;
        let c = $.fg;
        loop$commands = rest;
        loop$tree = append(tree, with$("", c));
      } else if ($ instanceof SetBackgroundColor) {
        let rest = commands.tail;
        let c = $.bg;
        loop$commands = rest;
        loop$tree = append(tree, on("", c));
      } else if ($ instanceof SetForegroundAndBackgroundColors) {
        let rest = commands.tail;
        let fg = $.fg;
        let bg = $.bg;
        loop$commands = rest;
        loop$tree = append(tree, with_on("", fg, bg));
      } else if ($ instanceof SetStyle) {
        let rest = commands.tail;
        let s = $.style;
        loop$commands = rest;
        loop$tree = append(tree, set_style(s));
      } else if ($ instanceof ResetStyle) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, reset_style(""));
      } else if ($ instanceof ResetColor) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, reset_color(""));
      } else if ($ instanceof ResetForeground) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, reset_foreground(""));
      } else if ($ instanceof ResetBackground) {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, reset_background(""));
      } else if ($ instanceof SetAttributes) {
        let rest = commands.tail;
        let attrs = $.attrs;
        loop$commands = rest;
        loop$tree = append(tree, attributes("", attrs));
      } else {
        let rest = commands.tail;
        loop$commands = rest;
        loop$tree = append(tree, reset_attributes(""));
      }
    }
  }
}

/**
 * Flushes the [`Queue`](stdout.html#Command).
 */
export function flush(queue) {
  let tree = $stree.new$();
  flush_inner(queue.commands, tree);
  return new Queue(toList([]));
}

/**
 * Flushes [`Commands`](#command.html#Command) without queueing them beforehand.
 */
export function execute(commands) {
  let tree = $stree.new$();
  return flush_inner(commands, tree);
}
