import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $consts from "../etch/internal/consts.mjs";
import { csi, esc } from "../etch/internal/consts.mjs";
import { CustomType as $CustomType } from "../gleam.mjs";

export class DefaultShape extends $CustomType {}
export const CursorStyle$DefaultShape = () => new DefaultShape();
export const CursorStyle$isDefaultShape = (value) =>
  value instanceof DefaultShape;

export class BlinkingBlock extends $CustomType {}
export const CursorStyle$BlinkingBlock = () => new BlinkingBlock();
export const CursorStyle$isBlinkingBlock = (value) =>
  value instanceof BlinkingBlock;

export class SteadyBlock extends $CustomType {}
export const CursorStyle$SteadyBlock = () => new SteadyBlock();
export const CursorStyle$isSteadyBlock = (value) =>
  value instanceof SteadyBlock;

export class BlinkingUnderScore extends $CustomType {}
export const CursorStyle$BlinkingUnderScore = () => new BlinkingUnderScore();
export const CursorStyle$isBlinkingUnderScore = (value) =>
  value instanceof BlinkingUnderScore;

export class SteadyUnderScore extends $CustomType {}
export const CursorStyle$SteadyUnderScore = () => new SteadyUnderScore();
export const CursorStyle$isSteadyUnderScore = (value) =>
  value instanceof SteadyUnderScore;

export class BlinkingBar extends $CustomType {}
export const CursorStyle$BlinkingBar = () => new BlinkingBar();
export const CursorStyle$isBlinkingBar = (value) =>
  value instanceof BlinkingBar;

export class SteadyBar extends $CustomType {}
export const CursorStyle$SteadyBar = () => new SteadyBar();
export const CursorStyle$isSteadyBar = (value) => value instanceof SteadyBar;

/**
 * Moves cursor to the given position.
 * It is prefered not to use this directly. See [`MoveTo`](command.html#MoveTo).
 */
export function move_to(x, y) {
  return (((csi + $int.to_string(y + 1)) + ";") + $int.to_string(x + 1)) + "H";
}

/**
 * Hides cursor.
 * It is prefered not to use this directly. See [`Hide`](command.html#Hide).
 */
export function hide() {
  return csi + "?25l";
}

/**
 * Shows cursor.
 * It is prefered not to use this directly. See [`Show`](command.html#Show).
 */
export function show() {
  return csi + "?25h";
}

/**
 * Moves cursor to the next line (at the beginning of the line below).
 * It is prefered not to use this directly. See [`MoveToNextLine`](command.html#MoveToNextLine).
 */
export function move_to_next_line(n) {
  return (csi + $int.to_string(n)) + "E";
}

/**
 * Moves cursor to the previous line (at the beginning of the line above).
 * It is prefered not to use this directly. See [`MoveToPreviousLine`](command.html#MoveToPreviousLine).
 */
export function move_to_previous_line(n) {
  return (csi + $int.to_string(n)) + "F";
}

/**
 * Moves cursor to the given column (the row remains unchainged).
 * It is prefered not to use this directly. See [`MoveToColumn`](command.html#MoveToColumn).
 */
export function move_to_column(n) {
  return (csi + $int.to_string(n)) + "G";
}

/**
 * Moves cursor to the given row (the column remains unchainged).
 * It is prefered not to use this directly. See [`MoveToRow`](command.html#MoveToRow).
 */
export function move_to_row(n) {
  return (csi + $int.to_string(n)) + "d";
}

/**
 * Moves cursor n column to the right.
 * It is prefered not to use this directly. See [`MoveRight`](command.html#MoveRight).
 */
export function move_right(n) {
  return (csi + $int.to_string(n)) + "C";
}

/**
 * Moves cursor n column to the left.
 * It is prefered not to use this directly. See [`MoveLeft`](command.html#MoveLeft).
 */
export function move_left(n) {
  return (csi + $int.to_string(n)) + "D";
}

/**
 * Moves cursor n rows to the up.
 * It is prefered not to use this directly. See [`MoveUp`](command.html#MoveUp).
 */
export function move_up(n) {
  return (csi + $int.to_string(n)) + "A";
}

/**
 * Moves cursor n rows to the down.
 * It is prefered not to use this directly. See [`MoveDown`](command.html#MoveDown).
 */
export function move_down(n) {
  return (csi + $int.to_string(n)) + "B";
}

/**
 * Sets cursor style.
 * It is prefered not to use this directly. See [`SetCursorStyle`](command.html#SetCursorStyle).
 */
export function set_cursor_style(s) {
  if (s instanceof DefaultShape) {
    return csi + "0 q";
  } else if (s instanceof BlinkingBlock) {
    return csi + "1 q";
  } else if (s instanceof SteadyBlock) {
    return csi + "2 q";
  } else if (s instanceof BlinkingUnderScore) {
    return csi + "3 q";
  } else if (s instanceof SteadyUnderScore) {
    return csi + "4 q";
  } else if (s instanceof BlinkingBar) {
    return csi + "5 q";
  } else {
    return csi + "6 q";
  }
}

/**
 * Saves current cursor position.
 * It is prefered not to use this directly. See [`SavePosition`](command.html#SavePosition).
 */
export function save_position() {
  return esc + "7";
}

/**
 * Restores saved cursor position.
 * It is prefered not to use this directly. See [`RestorePosition`](command.html#RestorePosition).
 */
export function restore_position() {
  return esc + "8";
}
