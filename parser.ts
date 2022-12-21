import { Token } from "./lexer.ts";
import { Peekable } from "./peekable.ts";

type JsonPrimitive = null | number | string | boolean;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;

export class Parser {
  private peekableToken: Peekable<Token>;
  constructor(tokens: Token[]) {
    this.peekableToken = new Peekable(tokens);
  }
  parse(): JsonValue {
    const peek = this.peekableToken.peek();
    switch (peek?.type) {
      case "null":
        this.peekableToken.next();
        return null;
      case "boolean":
      case "number":
      case "string":
        this.peekableToken.next();
        return peek.value;
      case "left-brace":
        return this.parseObject();
      case "left-bracket":
        return this.parseArray();
    }
    throw new Error("Unexpected token");
  }
  parseArray(): JsonArray {
    const result: JsonArray = [];
    this.peekableToken.next(); // skip opening bracket
    if (this.peekableToken.peek()?.type === "right-bracket") return result;
    let next;
    while (true) {
      result.push(this.parse());
      next = this.peekableToken.next();
      if (next.value?.type === "right-bracket") return result;
      if (next.value?.type === "comma") continue;
      throw new Error("Unexpected token");
    }
  }
  parseObject(): JsonObject {
    const result: JsonObject = Object.create(null);
    this.peekableToken.next(); // skip opening brace
    if (this.peekableToken.peek()?.type === "right-brace") return result;
    let key: string;
    let next: Token | undefined;
    while (true) {
      next = this.peekableToken.next().value;
      if (next?.type !== "string") throw new Error("Unexpected token");
      key = next.value;
      next = this.peekableToken.next().value;
      if (next?.type !== "colon") throw new Error("Unexpected token");
      result[key] = this.parse();
      next = this.peekableToken.next().value;
      if (next?.type === "right-brace") return result;
      if (next?.type === "comma") continue;
      throw new Error("Unexpected token");
    }
  }
}
