import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $consts from "../etch/internal/consts.mjs";
import { csi, esc } from "../etch/internal/consts.mjs";
import { CustomType as $CustomType } from "../gleam.mjs";
import { enter_raw, exit_raw, is_raw_mode, window_size } from "../terminal/terminal_ffi.mjs";

export { enter_raw, exit_raw, is_raw_mode, window_size };

export class All extends $CustomType {}
export const ClearType$All = () => new All();
export const ClearType$isAll = (value) => value instanceof All;

export class Purge extends $CustomType {}
export const ClearType$Purge = () => new Purge();
export const ClearType$isPurge = (value) => value instanceof Purge;

export class FromCursorDown extends $CustomType {}
export const ClearType$FromCursorDown = () => new FromCursorDown();
export const ClearType$isFromCursorDown = (value) =>
  value instanceof FromCursorDown;

export class FromCursorUp extends $CustomType {}
export const ClearType$FromCursorUp = () => new FromCursorUp();
export const ClearType$isFromCursorUp = (value) =>
  value instanceof FromCursorUp;

export class CurrentLine extends $CustomType {}
export const ClearType$CurrentLine = () => new CurrentLine();
export const ClearType$isCurrentLine = (value) => value instanceof CurrentLine;

export class UntilNewLine extends $CustomType {}
export const ClearType$UntilNewLine = () => new UntilNewLine();
export const ClearType$isUntilNewLine = (value) =>
  value instanceof UntilNewLine;

export class FailedToEnterRawMode extends $CustomType {}
export const TerminalError$FailedToEnterRawMode = () =>
  new FailedToEnterRawMode();
export const TerminalError$isFailedToEnterRawMode = (value) =>
  value instanceof FailedToEnterRawMode;

export class FailedToExitRawMode extends $CustomType {}
export const TerminalError$FailedToExitRawMode = () =>
  new FailedToExitRawMode();
export const TerminalError$isFailedToExitRawMode = (value) =>
  value instanceof FailedToExitRawMode;

export class CouldNotGetWindowSize extends $CustomType {}
export const TerminalError$CouldNotGetWindowSize = () =>
  new CouldNotGetWindowSize();
export const TerminalError$isCouldNotGetWindowSize = (value) =>
  value instanceof CouldNotGetWindowSize;

/**
 * Clears the terminal. See [`ClearType`](terminal.html#ClearType).
 * It is prefered not to use this directly. See [`Clear`](command.html#Clear).
 */
export function clear(t) {
  if (t instanceof All) {
    return csi + "2J";
  } else if (t instanceof Purge) {
    return csi + "3J";
  } else if (t instanceof FromCursorDown) {
    return csi + "J";
  } else if (t instanceof FromCursorUp) {
    return csi + "1J";
  } else if (t instanceof CurrentLine) {
    return csi + "2K";
  } else {
    return csi + "K";
  }
}

/**
 * Sets terminal title.
 * It is prefered not to use this directly. See [`SetTitle`](command.html#SetTitle).
 */
export function set_title(s) {
  return ((esc + "]0;") + s) + "\u{0007}";
}

/**
 * Disable line wrap.
 * It is prefered not to use this directly. See [`DisableLineWrap`](command.html#DisableLineWrap).
 */
export function disable_line_wrap() {
  return csi + "?7l";
}

/**
 * Enable line wrap.
 * It is prefered not to use this directly. See [`EnableLineWrap`](command.html#EnableLineWrap).
 */
export function enable_line_wrap() {
  return csi + "?7h";
}

/**
 * Scroll N rows up.
 * It is prefered not to use this directly. See [`ScrollUp`](command.html#ScrollUp).
 */
export function scroll_up(n) {
  return (csi + $int.to_string(n)) + "S";
}

/**
 * Scroll N rows down.
 * It is prefered not to use this directly. See [`ScrollDown`](command.html#ScrollDown).
 */
export function scroll_down(n) {
  return (csi + $int.to_string(n)) + "T";
}

/**
 * Enter alternative screen.
 * It is prefered not to use this directly. See [`EnterAlternative`](command.html#EnterAlternative).
 */
export function enter_alternative() {
  return csi + "?1049h";
}

/**
 * Leave alternative screen.
 * It is prefered not to use this directly. See [`LeaveAlternative`](command.html#LeaveAlternative).
 */
export function leave_alternative() {
  return csi + "?1049l";
}

/**
 * Set window size. It does not work on most modern terminals
 * due to security issues.
 * It is prefered not to use this directly. See [`SetSize`](command.html#SetSize).
 */
export function set_size(x, y) {
  return ((((csi + "8;") + $int.to_string(x)) + ";") + $int.to_string(y)) + "t";
}
