import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";
import { Lexer } from "./lexer.ts";

Deno.test("true", () => {
  const lexer = new Lexer("true");
  assertEquals(lexer.next(), {
    done: false,
    value: { type: "boolean", value: true },
  });
  assertEquals(lexer.next(), { done: true, value: undefined });
});

Deno.test("false", () => {
  const lexer = new Lexer("false");
  assertEquals(lexer.next(), {
    done: false,
    value: { type: "boolean", value: false },
  });
});

Deno.test("null", () => {
  const lexer = new Lexer("null");
  assertEquals(lexer.next(), {
    done: false,
    value: { type: "null" },
  });
});

Deno.test("[]", () => {
  const lexer = new Lexer("[]");
  assertEquals(lexer.next(), { done: false, value: { type: "left-bracket" } });
  assertEquals(lexer.next(), { done: false, value: { type: "right-bracket" } });
  assertEquals(lexer.next(), { done: true, value: undefined });
});

Deno.test("{}", () => {
  const lexer = new Lexer("{}");
  assertEquals(lexer.next(), { done: false, value: { type: "left-brace" } });
  assertEquals(lexer.next(), { done: false, value: { type: "right-brace" } });
  assertEquals(lexer.next(), { done: true, value: undefined });
});

Deno.test('"test\\n"', () => {
  const lexer = new Lexer('"test\\n"');
  assertEquals(lexer.next(), {
    done: false,
    value: { type: "string", value: "test\n" },
  });
  assertEquals(lexer.next(), { done: true, value: undefined });
});

Deno.test("123456.7890e+2", () => {
  const lexer = new Lexer("123456.7890e+2");
  assertEquals(lexer.next(), {
    done: false,
    value: { type: "number", value: 123456.7890e+2 },
  });
  assertEquals(lexer.next(), { done: true, value: undefined });
});

Deno.test("314e-2", () => {
  const lexer = new Lexer("314e-2");
  assertEquals(lexer.next(), {
    done: false,
    value: { type: "number", value: 314e-2 },
  });
  assertEquals(lexer.next(), { done: true, value: undefined });
});

Deno.test("[1.2, 410, 2.3e+10]", () => {
  const lexer = new Lexer("[1.2, 410, 2.3e+10]");
  assertEquals(lexer.next(), { done: false, value: { type: "left-bracket" } });
  assertEquals(lexer.next(), {
    done: false,
    value: { type: "number", value: 1.2 },
  });
  assertEquals(lexer.next(), { done: false, value: { type: "comma" } });
  assertEquals(lexer.next(), {
    done: false,
    value: { type: "number", value: 410 },
  });
  assertEquals(lexer.next(), { done: false, value: { type: "comma" } });
  assertEquals(lexer.next(), {
    done: false,
    value: { type: "number", value: 2.3e+10 },
  });
  assertEquals(lexer.next(), { done: false, value: { type: "right-bracket" } });
  assertEquals(lexer.next(), { done: true, value: undefined });
});
