import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";
import { Peekable } from "./peekable.ts";

Deno.test("peek", () => {
  const peekable = new Peekable("test".split(""));
  assertEquals(peekable.peek(), "t");
  assertEquals(peekable.next().value, "t");

  assertEquals(peekable.peek(), "e");
  assertEquals(peekable.peek(), "e");
  assertEquals(peekable.next().value, "e");

  assertEquals(peekable.peek(), "s");
  assertEquals(peekable.next().value, "s");

  assertEquals(peekable.next().value, "t");

  assertEquals(peekable.peek(), undefined);
  assertEquals(peekable.next(), { done: true, value: undefined });
});
