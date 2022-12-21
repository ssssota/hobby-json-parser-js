import { Peekable } from "./peekable.ts";

namespace Token {
  export type String<str extends string = string> = {
    type: "string";
    value: str;
  }; // "some string"
  export type Number<num extends number = number> = {
    type: "number";
    value: num;
  }; // 0, 13, 2.3, 1.4e-10
  export type Boolean<bool extends boolean = boolean> = {
    type: "boolean";
    value: bool;
  }; // true/false
  export type Null = { type: "null" }; // null
  export type LeftBrace = { type: "left-brace" }; // {
  export type RightBrace = { type: "right-brace" }; // }
  export type LeftBracket = { type: "left-bracket" }; // [
  export type RightBracket = { type: "right-bracket" }; // ]
  export type Comma = { type: "comma" }; // ,
  export type Colon = { type: "colon" }; // :
}
export type Token =
  | Token.String
  | Token.Number
  | Token.Boolean
  | Token.Null
  | Token.LeftBrace
  | Token.RightBrace
  | Token.LeftBracket
  | Token.RightBracket
  | Token.Comma
  | Token.Colon;

export class Lexer implements Iterator<Token, undefined> {
  private peekable: Peekable<string>;
  constructor(input: string) {
    this.peekable = new Peekable(input.split(""));
  }
  [Symbol.iterator]() {
    return this;
  }
  next(): IteratorResult<Token> {
    let char = this.peekable.peek();
    if (char === undefined) return { done: true, value: undefined };
    switch (char) {
      case "{":
      case "}":
      case "[":
      case "]":
      case ",":
      case ":":
        return { done: false, value: this.charToken() };
      case '"':
        return { done: false, value: this.stringToken() };
      case "t":
        return { done: false, value: this.trueToken() };
      case "f":
        return { done: false, value: this.falseToken() };
      case "n":
        return { done: false, value: this.nullToken() };
      case "-":
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        return { done: false, value: this.numberToken() };
      case " ":
        this.peekable.next();
        return this.next();
    }
    throw new Error("Tokenize error");
  }
  private charToken(): Token {
    switch (this.peekable.next().value) {
      case "{":
        return { type: "left-brace" };
      case "}":
        return { type: "right-brace" };
      case "[":
        return { type: "left-bracket" };
      case "]":
        return { type: "right-bracket" };
      case ",":
        return { type: "comma" };
      case ":":
        return { type: "colon" };
    }
    throw new Error("Unexpected error");
  }
  private stringToken(): Token.String { // https://www.rfc-editor.org/rfc/rfc7159#section-7
    let value = "";
    let next = this.peekable.next(); // ignore first double quote
    while (!(next = this.peekable.next()).done) {
      switch (next.value) {
        case '"':
          return { type: "string", value };
        case "\\": {
          next = this.peekable.next();
          if (next.value === undefined) {
            throw new Error("Tokenize error: Unexpected end of input");
          }
          const val = {
            '"': '"',
            "\\": "\\",
            "/": "/",
            "b": String.fromCharCode(0x08), //backspace
            "f": String.fromCharCode(0x0C), //form feed
            "n": String.fromCharCode(0x0A), //line feed
            "r": String.fromCharCode(0x0D), //carriage return
            "t": String.fromCharCode(0x09), //tab
          }[next.value];
          if (val !== undefined) {
            value += val;
            break;
          }
          if (next.value === "u") { // \uXXXX -> U+XXXX
            value += String.fromCodePoint(
              [
                this.peekable.next().value,
                this.peekable.next().value,
                this.peekable.next().value,
                this.peekable.next().value,
              ].map((c, i) => {
                if (c === undefined) {
                  throw new Error("Tokenize error: Unexpected end of input");
                }
                return parseInt(c, 16) << (4 * (3 - i));
              }).reduce((acc, sum) => acc + sum),
            );
            break;
          }
          throw new Error("Tokenize error: Unexpected escape character");
        }
        default: {
          const cp = next.value.codePointAt(0);
          if (cp === undefined) throw new Error("Unexpected error");
          if (
            (0x20 <= cp && cp <= 0x21) ||
            (0x23 <= cp && cp <= 0x5B) ||
            (0x5D <= cp && cp <= 0x10FFFF)
          ) {
            value += next.value;
            break;
          }
          throw new Error("Tokenize error: Unexpected string cheracter");
        }
      }
    }
    throw new Error("Tokenize error: Unexpected enf of input");
  }
  private static readonly DIGIT = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];
  private static readonly DIGIT1_9 = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ];
  private numberToken(): Token.Number { // https://www.rfc-editor.org/rfc/rfc7159#section-6
    // minus
    const minus = this.peekable.peek() === "-";
    if (minus) this.peekable.next();
    const int = this.intToken();
    const frac = this.fracToken();
    const exp = this.expToken();
    return {
      type: "number",
      value: Number([minus ? "-" : "", int, frac, exp].join("")),
    };
  }
  private intToken(): string {
    const result: string[] = [];
    const intFirst = this.peekable.next();
    if (intFirst.value === undefined) {
      throw new Error("Tokenize error: Unexpected end of input");
    }
    if (intFirst.value === "0") return "0";
    result.push(intFirst.value);
    while (Lexer.DIGIT.includes(this.peekable.peek()!)) {
      result.push(this.peekable.next().value!);
    }
    return result.join("");
  }
  private fracToken(): string {
    if (this.peekable.peek() !== ".") return "";
    const result = [this.peekable.next().value!];
    let next = this.peekable.peek();
    if (next === undefined) throw new Error("Tokenize error: digit expected");
    if (!Lexer.DIGIT.includes(next)) {
      throw new Error("Tokenize error: digit expected");
    }
    while (next = this.peekable.next().value!) {
      result.push(next);
      if (!Lexer.DIGIT.includes(this.peekable.peek()!)) {
        return result.join("");
      }
    }
    return result.join("");
  }
  private expToken(): string {
    if (this.peekable.peek() !== "e") return "";
    const result = [this.peekable.next().value!];
    const pluMinus = this.peekable.peek();
    if (pluMinus === "-" || pluMinus === "+") {
      result.push(this.peekable.next().value!);
    }
    let next = this.peekable.peek();
    if (next === undefined) throw new Error("Tokenize error: digit expected");
    if (!Lexer.DIGIT.includes(next)) {
      throw new Error("Tokenize error: digit expected");
    }
    while (next = this.peekable.next().value!) {
      result.push(next);
      if (!Lexer.DIGIT.includes(this.peekable.peek()!)) {
        return result.join("");
      }
    }
    return result.join("");
  }
  private trueToken(): Token.Boolean<true> {
    if (this.matchExpected("true")) return { type: "boolean", value: true };
    throw new Error("Tokenize error: true expected");
  }
  private falseToken(): Token.Boolean<false> {
    if (this.matchExpected("false")) return { type: "boolean", value: false };
    throw new Error("Tokenize error: false expected");
  }
  private nullToken(): Token.Null {
    if (this.matchExpected("null")) return { type: "null" };
    throw new Error("Tokenize error: null expected");
  }
  private matchExpected(expected: string): boolean {
    return expected.split("").every((c) => this.peekable.next().value === c);
  }
}
