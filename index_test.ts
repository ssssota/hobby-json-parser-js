import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";
import { parseJson } from "./index.ts";

Deno.test("blank object", () => {
  const input = "{}";
  assertEquals(parseJson(input), JSON.parse(input));
});

Deno.test("blank array", () => {
  const input = "[]";
  assertEquals(parseJson(input), JSON.parse(input));
});

Deno.test("string", () => {
  const input = '"test\\n"';
  assertEquals(parseJson(input), JSON.parse(input));
});

Deno.test("number", () => {
  const input = "3.1415e-10";
  assertEquals(parseJson(input), JSON.parse(input));
});

Deno.test("array", () => {
  const input = JSON.stringify([1230, null, false, "test"]);
  assertEquals(parseJson(input), JSON.parse(input));
});

Deno.test("nested object", () => {
  const input = JSON.stringify({
    str: "string",
    num: 0,
    bool: true,
    null: null,
    arr: ["\\n\\t", 1230e+0, false, null],
    obj: {
      str: "string",
      num: 0,
      bool: true,
      null: null,
      arr: ["\\n\\t", 1230e+0, false, null],
      obj: { a: "b" },
    },
  });
  assertEquals(parseJson(input), JSON.parse(input));
});
