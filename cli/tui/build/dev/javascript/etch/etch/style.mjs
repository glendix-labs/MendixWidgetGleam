import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $consts from "../etch/internal/consts.mjs";
import { csi } from "../etch/internal/consts.mjs";
import { toList, Empty as $Empty, CustomType as $CustomType } from "../gleam.mjs";

export class Default extends $CustomType {}
export const Color$Default = () => new Default();
export const Color$isDefault = (value) => value instanceof Default;

export class Black extends $CustomType {}
export const Color$Black = () => new Black();
export const Color$isBlack = (value) => value instanceof Black;

export class Grey extends $CustomType {}
export const Color$Grey = () => new Grey();
export const Color$isGrey = (value) => value instanceof Grey;

export class Red extends $CustomType {}
export const Color$Red = () => new Red();
export const Color$isRed = (value) => value instanceof Red;

export class BrightRed extends $CustomType {}
export const Color$BrightRed = () => new BrightRed();
export const Color$isBrightRed = (value) => value instanceof BrightRed;

export class Green extends $CustomType {}
export const Color$Green = () => new Green();
export const Color$isGreen = (value) => value instanceof Green;

export class BrightGreen extends $CustomType {}
export const Color$BrightGreen = () => new BrightGreen();
export const Color$isBrightGreen = (value) => value instanceof BrightGreen;

export class Yellow extends $CustomType {}
export const Color$Yellow = () => new Yellow();
export const Color$isYellow = (value) => value instanceof Yellow;

export class BrightYellow extends $CustomType {}
export const Color$BrightYellow = () => new BrightYellow();
export const Color$isBrightYellow = (value) => value instanceof BrightYellow;

export class Blue extends $CustomType {}
export const Color$Blue = () => new Blue();
export const Color$isBlue = (value) => value instanceof Blue;

export class BrightBlue extends $CustomType {}
export const Color$BrightBlue = () => new BrightBlue();
export const Color$isBrightBlue = (value) => value instanceof BrightBlue;

export class Magenta extends $CustomType {}
export const Color$Magenta = () => new Magenta();
export const Color$isMagenta = (value) => value instanceof Magenta;

export class BrightMagenta extends $CustomType {}
export const Color$BrightMagenta = () => new BrightMagenta();
export const Color$isBrightMagenta = (value) => value instanceof BrightMagenta;

export class Cyan extends $CustomType {}
export const Color$Cyan = () => new Cyan();
export const Color$isCyan = (value) => value instanceof Cyan;

export class BrightCyan extends $CustomType {}
export const Color$BrightCyan = () => new BrightCyan();
export const Color$isBrightCyan = (value) => value instanceof BrightCyan;

export class White extends $CustomType {}
export const Color$White = () => new White();
export const Color$isWhite = (value) => value instanceof White;

export class BrightWhite extends $CustomType {}
export const Color$BrightWhite = () => new BrightWhite();
export const Color$isBrightWhite = (value) => value instanceof BrightWhite;

export class BrightGrey extends $CustomType {}
export const Color$BrightGrey = () => new BrightGrey();
export const Color$isBrightGrey = (value) => value instanceof BrightGrey;

/**
 * Ansi color (256 colors). See https://www.ditig.com/256-colors-cheat-sheet.
 */
export class AnsiValue extends $CustomType {
  constructor(v) {
    super();
    this.v = v;
  }
}
export const Color$AnsiValue = (v) => new AnsiValue(v);
export const Color$isAnsiValue = (value) => value instanceof AnsiValue;
export const Color$AnsiValue$v = (value) => value.v;
export const Color$AnsiValue$0 = (value) => value.v;

/**
 * RGB color.
 */
export class Rgb extends $CustomType {
  constructor(r, g, b) {
    super();
    this.r = r;
    this.g = g;
    this.b = b;
  }
}
export const Color$Rgb = (r, g, b) => new Rgb(r, g, b);
export const Color$isRgb = (value) => value instanceof Rgb;
export const Color$Rgb$r = (value) => value.r;
export const Color$Rgb$0 = (value) => value.r;
export const Color$Rgb$g = (value) => value.g;
export const Color$Rgb$1 = (value) => value.g;
export const Color$Rgb$b = (value) => value.b;
export const Color$Rgb$2 = (value) => value.b;

export class Bold extends $CustomType {}
export const Attribute$Bold = () => new Bold();
export const Attribute$isBold = (value) => value instanceof Bold;

export class Dim extends $CustomType {}
export const Attribute$Dim = () => new Dim();
export const Attribute$isDim = (value) => value instanceof Dim;

export class Underline extends $CustomType {}
export const Attribute$Underline = () => new Underline();
export const Attribute$isUnderline = (value) => value instanceof Underline;

export class Italic extends $CustomType {}
export const Attribute$Italic = () => new Italic();
export const Attribute$isItalic = (value) => value instanceof Italic;

export class Blinking extends $CustomType {}
export const Attribute$Blinking = () => new Blinking();
export const Attribute$isBlinking = (value) => value instanceof Blinking;

export class Inverse extends $CustomType {}
export const Attribute$Inverse = () => new Inverse();
export const Attribute$isInverse = (value) => value instanceof Inverse;

export class Style extends $CustomType {
  constructor(bg, fg, attributes) {
    super();
    this.bg = bg;
    this.fg = fg;
    this.attributes = attributes;
  }
}
export const Style$Style = (bg, fg, attributes) =>
  new Style(bg, fg, attributes);
export const Style$isStyle = (value) => value instanceof Style;
export const Style$Style$bg = (value) => value.bg;
export const Style$Style$0 = (value) => value.bg;
export const Style$Style$fg = (value) => value.fg;
export const Style$Style$1 = (value) => value.fg;
export const Style$Style$attributes = (value) => value.attributes;
export const Style$Style$2 = (value) => value.attributes;

/**
 * Returns default [`Style`](style.html#Style) with terminal's default
 * foreground and background [`Colors`](style.html#Color))
 * and no [`Attributes`](style.html#Attribute).
 */
export function default_style() {
  return new Style(new Default(), new Default(), toList([]));
}

function get_fg(c) {
  if (c instanceof Default) {
    return "39";
  } else if (c instanceof Black) {
    return "30";
  } else if (c instanceof Grey) {
    return "90";
  } else if (c instanceof Red) {
    return "31";
  } else if (c instanceof BrightRed) {
    return "91";
  } else if (c instanceof Green) {
    return "32";
  } else if (c instanceof BrightGreen) {
    return "92";
  } else if (c instanceof Yellow) {
    return "33";
  } else if (c instanceof BrightYellow) {
    return "93";
  } else if (c instanceof Blue) {
    return "34";
  } else if (c instanceof BrightBlue) {
    return "94";
  } else if (c instanceof Magenta) {
    return "35";
  } else if (c instanceof BrightMagenta) {
    return "95";
  } else if (c instanceof Cyan) {
    return "36";
  } else if (c instanceof BrightCyan) {
    return "96";
  } else if (c instanceof White) {
    return "37";
  } else if (c instanceof BrightWhite) {
    return "97";
  } else if (c instanceof BrightGrey) {
    return "38;5;7";
  } else if (c instanceof AnsiValue) {
    let v = c.v;
    return "38;5;" + $int.to_string(v);
  } else {
    let r = c.r;
    let g = c.g;
    let b = c.b;
    return (((("38;2;" + $int.to_string(r)) + ";") + $int.to_string(g)) + ";") + $int.to_string(
      b,
    );
  }
}

function get_bg(c) {
  if (c instanceof Default) {
    return "49";
  } else if (c instanceof Black) {
    return "40";
  } else if (c instanceof Grey) {
    return "100";
  } else if (c instanceof Red) {
    return "41";
  } else if (c instanceof BrightRed) {
    return "101";
  } else if (c instanceof Green) {
    return "42";
  } else if (c instanceof BrightGreen) {
    return "102";
  } else if (c instanceof Yellow) {
    return "43";
  } else if (c instanceof BrightYellow) {
    return "103";
  } else if (c instanceof Blue) {
    return "44";
  } else if (c instanceof BrightBlue) {
    return "104";
  } else if (c instanceof Magenta) {
    return "45";
  } else if (c instanceof BrightMagenta) {
    return "105";
  } else if (c instanceof Cyan) {
    return "46";
  } else if (c instanceof BrightCyan) {
    return "106";
  } else if (c instanceof White) {
    return "47";
  } else if (c instanceof BrightWhite) {
    return "107";
  } else if (c instanceof BrightGrey) {
    return "48;5;7";
  } else if (c instanceof AnsiValue) {
    let v = c.v;
    return "48;5;" + $int.to_string(v);
  } else {
    let r = c.r;
    let g = c.g;
    let b = c.b;
    return (((("48;2;" + $int.to_string(r)) + ";") + $int.to_string(g)) + ";") + $int.to_string(
      b,
    );
  }
}

/**
 * Sets the foreground color of a string. It does not reset the color after applying it.
 * Also see [`on`](style.html#on) to set the background color.
 * Using [`with_on`](style.html#with_on) is prefered to set both the background and foreground colors.
 */
export function with$(s, c) {
  return ((csi + get_fg(c)) + "m") + s;
}

/**
 * Sets the foreground color of a string. It does not reset the color after applying it.
 * Also see [`with`](style.html#with) to set the foreground color.
 * Using [`with_on`](style.html#with_on) is prefered to set both the background and foreground colors.
 */
export function on(s, c) {
  return ((csi + get_bg(c)) + "m") + s;
}

/**
 * Sets both the foreground and background colors. It is the prefered way to set them both for one string.
 * Also see [`with`](style.html#with) to set the foreground color and [`on`](style.html#on) to set the background color.
 */
export function with_on(s, fg, bg) {
  return ((((csi + get_fg(fg)) + ";") + get_bg(bg)) + "m") + s;
}

function get_attributes(loop$a, loop$acc) {
  while (true) {
    let a = loop$a;
    let acc = loop$acc;
    if (a instanceof $Empty) {
      return "";
    } else {
      let $ = a.tail;
      if ($ instanceof $Empty) {
        let attr = a.head;
        if (attr instanceof Bold) {
          return acc + "1";
        } else if (attr instanceof Dim) {
          return acc + "2";
        } else if (attr instanceof Underline) {
          return acc + "4";
        } else if (attr instanceof Italic) {
          return acc + "3";
        } else if (attr instanceof Blinking) {
          return acc + "5";
        } else {
          return acc + "7";
        }
      } else {
        let attr = a.head;
        let rest = $;
        let acc$1 = (() => {
          if (attr instanceof Bold) {
            return acc + "1";
          } else if (attr instanceof Dim) {
            return acc + "2";
          } else if (attr instanceof Underline) {
            return acc + "4";
          } else if (attr instanceof Italic) {
            return acc + "3";
          } else if (attr instanceof Blinking) {
            return acc + "5";
          } else {
            return acc + "7";
          }
        })() + ";";
        loop$a = rest;
        loop$acc = acc$1;
      }
    }
  }
}

/**
 * Applies style to a string.
 */
export function with_style(s, style) {
  return ((((((csi + get_fg(style.fg)) + ";") + get_bg(style.bg)) + ";") + get_attributes(
    style.attributes,
    "",
  )) + "m") + s;
}

/**
 * Sets [`Attributes`](style.html#Attribute) of a string.
 */
export function attributes(s, a) {
  return ((csi + get_attributes(a, "")) + "m") + s;
}

/**
 * Makes the string bold and resets this attribute afterwards.
 */
export function bold(s) {
  return (((csi + "1m") + s) + csi) + "22m";
}

/**
 * Makes the string dim and resets this attribute afterwards.
 */
export function dim(s) {
  return (((csi + "2m") + s) + csi) + "22m";
}

/**
 * Makes the string italic and resets this attribute afterwards.
 */
export function italic(s) {
  return (((csi + "3m") + s) + csi) + "23m";
}

/**
 * Makes the string underline and resets this attribute afterwards.
 */
export function underline(s) {
  return (((csi + "4m") + s) + csi) + "24m";
}

/**
 * Makes the string blinking and resets this attribute afterwards.
 */
export function blinking(s) {
  return (((csi + "5m") + s) + csi) + "25m";
}

/**
 * Makes the string inverse (swaps background and foreground colors)
 * and resets this attribute afterwards. See [`Color`](style.html#Color).
 */
export function inverse(s) {
  return (((csi + "7m") + s) + csi) + "27m";
}

/**
 * Resets style (foreground, background and attributes). See [`Style`](style.html#Style).
 */
export function reset_style(s) {
  return (s + csi) + "39;49;22;23;24;25;27m";
}

/**
 * Sets style. See [`Style`](style.html#Style).
 */
export function set_style(s) {
  return with_style("", s);
}

/**
 * Resets color of the string. See [`Color`](style.html#Color).
 */
export function reset_color(s) {
  return (s + csi) + "39;49m";
}

/**
 * Resets foreground of the string. See [`Color`](style.html#Color).
 */
export function reset_foreground(s) {
  return (s + csi) + "39m";
}

/**
 * Resets background of the string. See [`Color`](style.html#Color).
 */
export function reset_background(s) {
  return (s + csi) + "49m";
}

/**
 * Resets [`Attributes`](style.html#Attribute) of the string.
 */
export function reset_attributes(s) {
  return (s + csi) + "22;23;24;25;27m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to black and
 * resets the color afterwards.
 */
export function black(s) {
  return (((csi + "30m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to red and
 * resets the color afterwards.
 */
export function red(s) {
  return (((csi + "31m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to bright red and
 * resets the color afterwards.
 */
export function bright_red(s) {
  return (((csi + "91m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to green and
 * resets the color afterwards.
 */
export function green(s) {
  return (((csi + "32m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to bright green and
 * resets the color afterwards.
 */
export function bright_green(s) {
  return (((csi + "92m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to yellow and
 * resets the color afterwards.
 */
export function yellow(s) {
  return (((csi + "33m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to bright yellow and
 * resets the color afterwards.
 */
export function bright_yellow(s) {
  return (((csi + "93m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to blue and
 * resets the color afterwards.
 */
export function blue(s) {
  return (((csi + "34m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to bright blue and
 * resets the color afterwards.
 */
export function bright_blue(s) {
  return (((csi + "94m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to magenta and
 * resets the color afterwards.
 */
export function magenta(s) {
  return (((csi + "35m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to bright magenta and
 * resets the color afterwards.
 */
export function bright_magenta(s) {
  return (((csi + "95m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to cyan and
 * resets the color afterwards.
 */
export function cyan(s) {
  return (((csi + "36m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to bright cyan and
 * resets the color afterwards.
 */
export function bright_cyan(s) {
  return (((csi + "96m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to white and
 * resets the color afterwards.
 */
export function white(s) {
  return (((csi + "37m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to bright white and
 * resets the color afterwards.
 */
export function bright_white(s) {
  return (((csi + "97m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to bright grey and
 * resets the color afterwards.
 */
export function bright_grey(s) {
  return (((csi + "38;5;7m") + s) + csi) + "39m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to grey and
 * resets the color afterwards.
 */
export function grey(s) {
  return (((csi + "90m") + s) + csi) + "39m";
}

/**
 * Sets the background [`Color`](style.html#Color) to black
 * and resets it afterwards.
 */
export function on_black(s) {
  return (((csi + "40m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to red
 * and resets it afterwards.
 */
export function on_red(s) {
  return (((csi + "41m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to bright red
 * and resets it afterwards.
 */
export function on_bright_red(s) {
  return (((csi + "101m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to green
 * and resets it afterwards.
 */
export function on_green(s) {
  return (((csi + "42m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to bright green
 * and resets it afterwards.
 */
export function on_bright_green(s) {
  return (((csi + "102m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to yellow
 * and resets it afterwards.
 */
export function on_yellow(s) {
  return (((csi + "43m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to bright yellow
 * and resets it afterwards.
 */
export function on_bright_yellow(s) {
  return (((csi + "103m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to blue
 * and resets it afterwards.
 */
export function on_blue(s) {
  return (((csi + "44m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to bright blue
 * and resets it afterwards.
 */
export function on_bright_blue(s) {
  return (((csi + "104m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to magenta
 * and resets it afterwards.
 */
export function on_magenta(s) {
  return (((csi + "45m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to bright magenta
 * and resets it afterwards.
 */
export function on_bright_magenta(s) {
  return (((csi + "105m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to cyan
 * and resets it afterwards.
 */
export function on_cyan(s) {
  return (((csi + "46m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to bright cyan
 * and resets it afterwards.
 */
export function on_bright_cyan(s) {
  return (((csi + "106m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to white
 * and resets it afterwards.
 */
export function on_white(s) {
  return (((csi + "47m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to bright white
 * and resets it afterwards.
 */
export function on_bright_white(s) {
  return (((csi + "107m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to bright grey
 * and resets it afterwards.
 */
export function on_bright_grey(s) {
  return (((csi + "48;5;7m") + s) + csi) + "49m";
}

/**
 * Sets the background [`Color`](style.html#Color) to grey
 * and resets it afterwards.
 */
export function on_grey(s) {
  return (((csi + "100m") + s) + csi) + "49m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to the given ANSI value
 * and resets it afterwards.
 */
export function ansi(s, value) {
  return ((((csi + get_fg(new AnsiValue(value))) + "m") + s) + csi) + "39m";
}

/**
 * Sets the background [`Color`](style.html#Color) to the given ANSI value
 * and resets it afterwards.
 */
export function on_ansi(s, value) {
  return ((((csi + get_bg(new AnsiValue(value))) + "m") + s) + csi) + "49m";
}

/**
 * Sets the foreground [`Color`](style.html#Color) to the given RBG color
 * and resets it afterwards.
 */
export function rbg(s, r, g, b) {
  return ((((csi + get_fg(new Rgb(r, g, b))) + "m") + s) + csi) + "39m";
}

/**
 * Sets the background [`Color`](style.html#Color) to the given RBG color
 * and resets it afterwards.
 */
export function on_rbg(s, r, g, b) {
  return ((((csi + get_bg(new Rgb(r, g, b))) + "m") + s) + csi) + "49m";
}
