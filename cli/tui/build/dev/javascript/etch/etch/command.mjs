import * as $cursor from "../etch/cursor.mjs";
import * as $event from "../etch/event.mjs";
import * as $style from "../etch/style.mjs";
import * as $terminal from "../etch/terminal.mjs";
import { CustomType as $CustomType } from "../gleam.mjs";

/**
 * Prints text.
 */
export class Print extends $CustomType {
  constructor(s) {
    super();
    this.s = s;
  }
}
export const Command$Print = (s) => new Print(s);
export const Command$isPrint = (value) => value instanceof Print;
export const Command$Print$s = (value) => value.s;
export const Command$Print$0 = (value) => value.s;

/**
 * Prints text and resets its [`Colors`](style.html#Color)
 * and [`Attributes`](style.html#Attribute).
 */
export class PrintReset extends $CustomType {
  constructor(s) {
    super();
    this.s = s;
  }
}
export const Command$PrintReset = (s) => new PrintReset(s);
export const Command$isPrintReset = (value) => value instanceof PrintReset;
export const Command$PrintReset$s = (value) => value.s;
export const Command$PrintReset$0 = (value) => value.s;

/**
 * Prints text and moves the caret to the beginning of a new line.
 */
export class Println extends $CustomType {
  constructor(s) {
    super();
    this.s = s;
  }
}
export const Command$Println = (s) => new Println(s);
export const Command$isPrintln = (value) => value instanceof Println;
export const Command$Println$s = (value) => value.s;
export const Command$Println$0 = (value) => value.s;

/**
 * Prints text, resets its [`Colors`](style.html#Color)
 * and [`Attributes`](style.html#Attribute)
 * and moves the caret to the beginning of a new line.
 */
export class PrintlnReset extends $CustomType {
  constructor(s) {
    super();
    this.s = s;
  }
}
export const Command$PrintlnReset = (s) => new PrintlnReset(s);
export const Command$isPrintlnReset = (value) => value instanceof PrintlnReset;
export const Command$PrintlnReset$s = (value) => value.s;
export const Command$PrintlnReset$0 = (value) => value.s;

/**
 * Moves the cursor n lines up.
 */
export class MoveUp extends $CustomType {
  constructor(n) {
    super();
    this.n = n;
  }
}
export const Command$MoveUp = (n) => new MoveUp(n);
export const Command$isMoveUp = (value) => value instanceof MoveUp;
export const Command$MoveUp$n = (value) => value.n;
export const Command$MoveUp$0 = (value) => value.n;

/**
 * Moves the cursor n lines down.
 */
export class MoveDown extends $CustomType {
  constructor(n) {
    super();
    this.n = n;
  }
}
export const Command$MoveDown = (n) => new MoveDown(n);
export const Command$isMoveDown = (value) => value instanceof MoveDown;
export const Command$MoveDown$n = (value) => value.n;
export const Command$MoveDown$0 = (value) => value.n;

/**
 * Moves the cursor n characters left.
 */
export class MoveLeft extends $CustomType {
  constructor(n) {
    super();
    this.n = n;
  }
}
export const Command$MoveLeft = (n) => new MoveLeft(n);
export const Command$isMoveLeft = (value) => value instanceof MoveLeft;
export const Command$MoveLeft$n = (value) => value.n;
export const Command$MoveLeft$0 = (value) => value.n;

/**
 * Moves the cursor n characters right.
 */
export class MoveRight extends $CustomType {
  constructor(n) {
    super();
    this.n = n;
  }
}
export const Command$MoveRight = (n) => new MoveRight(n);
export const Command$isMoveRight = (value) => value instanceof MoveRight;
export const Command$MoveRight$n = (value) => value.n;
export const Command$MoveRight$0 = (value) => value.n;

/**
 * Moves the cursor n lines down and moves the caret
 * to the beginning of the line.
 */
export class MoveToNextLine extends $CustomType {
  constructor(n) {
    super();
    this.n = n;
  }
}
export const Command$MoveToNextLine = (n) => new MoveToNextLine(n);
export const Command$isMoveToNextLine = (value) =>
  value instanceof MoveToNextLine;
export const Command$MoveToNextLine$n = (value) => value.n;
export const Command$MoveToNextLine$0 = (value) => value.n;

/**
 * Moves the cursor n lines up and moves the caret
 * to the beginning of the line.
 */
export class MoveToPreviousLine extends $CustomType {
  constructor(n) {
    super();
    this.n = n;
  }
}
export const Command$MoveToPreviousLine = (n) => new MoveToPreviousLine(n);
export const Command$isMoveToPreviousLine = (value) =>
  value instanceof MoveToPreviousLine;
export const Command$MoveToPreviousLine$n = (value) => value.n;
export const Command$MoveToPreviousLine$0 = (value) => value.n;

/**
 * Moves the cursor to the given column while the row remains the same.
 */
export class MoveToColumn extends $CustomType {
  constructor(n) {
    super();
    this.n = n;
  }
}
export const Command$MoveToColumn = (n) => new MoveToColumn(n);
export const Command$isMoveToColumn = (value) => value instanceof MoveToColumn;
export const Command$MoveToColumn$n = (value) => value.n;
export const Command$MoveToColumn$0 = (value) => value.n;

/**
 * Moves the cursor to the given row while the column remains the same.
 */
export class MoveToRow extends $CustomType {
  constructor(n) {
    super();
    this.n = n;
  }
}
export const Command$MoveToRow = (n) => new MoveToRow(n);
export const Command$isMoveToRow = (value) => value instanceof MoveToRow;
export const Command$MoveToRow$n = (value) => value.n;
export const Command$MoveToRow$0 = (value) => value.n;

/**
 * Moves the cursor to the given row and column.
 */
export class MoveTo extends $CustomType {
  constructor(column, row) {
    super();
    this.column = column;
    this.row = row;
  }
}
export const Command$MoveTo = (column, row) => new MoveTo(column, row);
export const Command$isMoveTo = (value) => value instanceof MoveTo;
export const Command$MoveTo$column = (value) => value.column;
export const Command$MoveTo$0 = (value) => value.column;
export const Command$MoveTo$row = (value) => value.row;
export const Command$MoveTo$1 = (value) => value.row;

export class SavePosition extends $CustomType {}
export const Command$SavePosition = () => new SavePosition();
export const Command$isSavePosition = (value) => value instanceof SavePosition;

export class RestorePosition extends $CustomType {}
export const Command$RestorePosition = () => new RestorePosition();
export const Command$isRestorePosition = (value) =>
  value instanceof RestorePosition;

export class ShowCursor extends $CustomType {}
export const Command$ShowCursor = () => new ShowCursor();
export const Command$isShowCursor = (value) => value instanceof ShowCursor;

export class HideCursor extends $CustomType {}
export const Command$HideCursor = () => new HideCursor();
export const Command$isHideCursor = (value) => value instanceof HideCursor;

/**
 * Sets cursor style. See [`CursorStyle`](cursor.html#CursorStyle).
 */
export class SetCursorStyle extends $CustomType {
  constructor(style) {
    super();
    this.style = style;
  }
}
export const Command$SetCursorStyle = (style) => new SetCursorStyle(style);
export const Command$isSetCursorStyle = (value) =>
  value instanceof SetCursorStyle;
export const Command$SetCursorStyle$style = (value) => value.style;
export const Command$SetCursorStyle$0 = (value) => value.style;

/**
 * Scrolls the terminal n lines up.
 */
export class ScrollUp extends $CustomType {
  constructor(n) {
    super();
    this.n = n;
  }
}
export const Command$ScrollUp = (n) => new ScrollUp(n);
export const Command$isScrollUp = (value) => value instanceof ScrollUp;
export const Command$ScrollUp$n = (value) => value.n;
export const Command$ScrollUp$0 = (value) => value.n;

/**
 * Scrolls the terminal n lines down.
 */
export class ScrollDown extends $CustomType {
  constructor(n) {
    super();
    this.n = n;
  }
}
export const Command$ScrollDown = (n) => new ScrollDown(n);
export const Command$isScrollDown = (value) => value instanceof ScrollDown;
export const Command$ScrollDown$n = (value) => value.n;
export const Command$ScrollDown$0 = (value) => value.n;

/**
 * Clears the terminal. See [`ClearType`](terminal.html#ClearType).
 */
export class Clear extends $CustomType {
  constructor(clear_type) {
    super();
    this.clear_type = clear_type;
  }
}
export const Command$Clear = (clear_type) => new Clear(clear_type);
export const Command$isClear = (value) => value instanceof Clear;
export const Command$Clear$clear_type = (value) => value.clear_type;
export const Command$Clear$0 = (value) => value.clear_type;

/**
 * Sets terminal size.
 */
export class SetSize extends $CustomType {
  constructor(columns, rows) {
    super();
    this.columns = columns;
    this.rows = rows;
  }
}
export const Command$SetSize = (columns, rows) => new SetSize(columns, rows);
export const Command$isSetSize = (value) => value instanceof SetSize;
export const Command$SetSize$columns = (value) => value.columns;
export const Command$SetSize$0 = (value) => value.columns;
export const Command$SetSize$rows = (value) => value.rows;
export const Command$SetSize$1 = (value) => value.rows;

/**
 * Sets terminal title.
 */
export class SetTitle extends $CustomType {
  constructor(title) {
    super();
    this.title = title;
  }
}
export const Command$SetTitle = (title) => new SetTitle(title);
export const Command$isSetTitle = (value) => value instanceof SetTitle;
export const Command$SetTitle$title = (value) => value.title;
export const Command$SetTitle$0 = (value) => value.title;

export class DisableLineWrap extends $CustomType {}
export const Command$DisableLineWrap = () => new DisableLineWrap();
export const Command$isDisableLineWrap = (value) =>
  value instanceof DisableLineWrap;

export class EnableLineWrap extends $CustomType {}
export const Command$EnableLineWrap = () => new EnableLineWrap();
export const Command$isEnableLineWrap = (value) =>
  value instanceof EnableLineWrap;

export class EnterAlternateScreen extends $CustomType {}
export const Command$EnterAlternateScreen = () => new EnterAlternateScreen();
export const Command$isEnterAlternateScreen = (value) =>
  value instanceof EnterAlternateScreen;

export class LeaveAlternateScreen extends $CustomType {}
export const Command$LeaveAlternateScreen = () => new LeaveAlternateScreen();
export const Command$isLeaveAlternateScreen = (value) =>
  value instanceof LeaveAlternateScreen;

export class EnableMouseCapture extends $CustomType {}
export const Command$EnableMouseCapture = () => new EnableMouseCapture();
export const Command$isEnableMouseCapture = (value) =>
  value instanceof EnableMouseCapture;

export class DisableMouseCapture extends $CustomType {}
export const Command$DisableMouseCapture = () => new DisableMouseCapture();
export const Command$isDisableMouseCapture = (value) =>
  value instanceof DisableMouseCapture;

/**
 * Pushes keyboard enhancement flags.
 * See https://sw.kovidgoyal.net/kitty/keyboard-protocol/#progressive-enhancement
 */
export class PushKeyboardEnhancementFlags extends $CustomType {
  constructor(flags) {
    super();
    this.flags = flags;
  }
}
export const Command$PushKeyboardEnhancementFlags = (flags) =>
  new PushKeyboardEnhancementFlags(flags);
export const Command$isPushKeyboardEnhancementFlags = (value) =>
  value instanceof PushKeyboardEnhancementFlags;
export const Command$PushKeyboardEnhancementFlags$flags = (value) =>
  value.flags;
export const Command$PushKeyboardEnhancementFlags$0 = (value) => value.flags;

export class PopKeyboardEnhancementFlags extends $CustomType {}
export const Command$PopKeyboardEnhancementFlags = () =>
  new PopKeyboardEnhancementFlags();
export const Command$isPopKeyboardEnhancementFlags = (value) =>
  value instanceof PopKeyboardEnhancementFlags;

export class EnableFocusChange extends $CustomType {}
export const Command$EnableFocusChange = () => new EnableFocusChange();
export const Command$isEnableFocusChange = (value) =>
  value instanceof EnableFocusChange;

export class DisableFocusChange extends $CustomType {}
export const Command$DisableFocusChange = () => new DisableFocusChange();
export const Command$isDisableFocusChange = (value) =>
  value instanceof DisableFocusChange;

/**
 * Sets foreground [`Color`](style.html#Color).
 * Using [`SetForegroundAndBackgroundColors`](command.html#SetForegroundAndBackgroundColors)
 * is prefered to set both the background and foreground colors.
 */
export class SetForegroundColor extends $CustomType {
  constructor(fg) {
    super();
    this.fg = fg;
  }
}
export const Command$SetForegroundColor = (fg) => new SetForegroundColor(fg);
export const Command$isSetForegroundColor = (value) =>
  value instanceof SetForegroundColor;
export const Command$SetForegroundColor$fg = (value) => value.fg;
export const Command$SetForegroundColor$0 = (value) => value.fg;

/**
 * Sets background [`Color`](style.html#Color).
 * Using [`SetForegroundAndBackgroundColors`](command.html#SetForegroundAndBackgroundColors)
 * is prefered to set both the background and foreground colors.
 */
export class SetBackgroundColor extends $CustomType {
  constructor(bg) {
    super();
    this.bg = bg;
  }
}
export const Command$SetBackgroundColor = (bg) => new SetBackgroundColor(bg);
export const Command$isSetBackgroundColor = (value) =>
  value instanceof SetBackgroundColor;
export const Command$SetBackgroundColor$bg = (value) => value.bg;
export const Command$SetBackgroundColor$0 = (value) => value.bg;

/**
 * Sets foreground and background [`Colors`](style.html#Color).
 * Using this is prefered to set both the background and foreground colors.
 */
export class SetForegroundAndBackgroundColors extends $CustomType {
  constructor(fg, bg) {
    super();
    this.fg = fg;
    this.bg = bg;
  }
}
export const Command$SetForegroundAndBackgroundColors = (fg, bg) =>
  new SetForegroundAndBackgroundColors(fg, bg);
export const Command$isSetForegroundAndBackgroundColors = (value) =>
  value instanceof SetForegroundAndBackgroundColors;
export const Command$SetForegroundAndBackgroundColors$fg = (value) => value.fg;
export const Command$SetForegroundAndBackgroundColors$0 = (value) => value.fg;
export const Command$SetForegroundAndBackgroundColors$bg = (value) => value.bg;
export const Command$SetForegroundAndBackgroundColors$1 = (value) => value.bg;

/**
 * Sets [`Style`](style.html#Style)
 * Example:
 * ```gleam
 * execute([
 *   command.SetStyle(Style(fg: style.Red, bg: style.Black, attributes: [style.Underline])),
 *   command.Print("my string"),
 *   command.ResetStyle,
 * ])
 */
export class SetStyle extends $CustomType {
  constructor(style) {
    super();
    this.style = style;
  }
}
export const Command$SetStyle = (style) => new SetStyle(style);
export const Command$isSetStyle = (value) => value instanceof SetStyle;
export const Command$SetStyle$style = (value) => value.style;
export const Command$SetStyle$0 = (value) => value.style;

export class ResetStyle extends $CustomType {}
export const Command$ResetStyle = () => new ResetStyle();
export const Command$isResetStyle = (value) => value instanceof ResetStyle;

export class ResetColor extends $CustomType {}
export const Command$ResetColor = () => new ResetColor();
export const Command$isResetColor = (value) => value instanceof ResetColor;

export class ResetForeground extends $CustomType {}
export const Command$ResetForeground = () => new ResetForeground();
export const Command$isResetForeground = (value) =>
  value instanceof ResetForeground;

export class ResetBackground extends $CustomType {}
export const Command$ResetBackground = () => new ResetBackground();
export const Command$isResetBackground = (value) =>
  value instanceof ResetBackground;

/**
 * Sets [`Attributes`](style.html#Attribute).
 */
export class SetAttributes extends $CustomType {
  constructor(attrs) {
    super();
    this.attrs = attrs;
  }
}
export const Command$SetAttributes = (attrs) => new SetAttributes(attrs);
export const Command$isSetAttributes = (value) =>
  value instanceof SetAttributes;
export const Command$SetAttributes$attrs = (value) => value.attrs;
export const Command$SetAttributes$0 = (value) => value.attrs;

export class ResetAttributes extends $CustomType {}
export const Command$ResetAttributes = () => new ResetAttributes();
export const Command$isResetAttributes = (value) =>
  value instanceof ResetAttributes;
