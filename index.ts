import { Lexer } from "./lexer.ts";
import { JsonValue, Parser } from "./parser.ts";

export function parseJson(jsonString: string): JsonValue {
  const lexer = new Lexer(jsonString);
  const parser = new Parser([...lexer]);
  return parser.parse();
}
