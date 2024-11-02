import { assert, assertEquals } from "jsr:@std/assert";
import { NumArray } from "./numarray.ts";

// ============================================================================
// constructor tests
// ============================================================================

Deno.test("constructor with no input", () => {
    const arr = new NumArray();
    assertEquals(arr.elements, []);
});

Deno.test("constructor with variable input", () => {
    const arr = new NumArray(1, 2, 3, 4, 5);
    assertEquals(arr.elements, [1, 2, 3, 4, 5]);
});

Deno.test("constructor with array input", () => {
    const arr = new NumArray([1, 2, 3, 4, 5]);
    assertEquals(arr.elements, [1, 2, 3, 4, 5]);
});

Deno.test("constructor with NaN input", () => {
    try {
        new NumArray(1, 2, 3, 4, NaN);
        assert(false, "Expected Error: Input contains non-numeric values: only numbers are allowed.");
    } catch (e) {
        assertEquals((e as Error).message, "Input contains non-numeric values: only numbers are allowed.");
    }
});

// ============================================================================
// arange tests
// ============================================================================

Deno.test("arange with step = 0", () => {
    try {
        NumArray.arange(1, 5, 0);
        assert(false, "Expected Error: The step value can not be 0.");
    } catch (e) {
        assertEquals((e as Error).message, "The step value can not be 0.");
    }
});

Deno.test("arange with start = stop and step > 0", () => {
    const arr = NumArray.arange(5, 5, 1);
    assertEquals(arr.elements, []);
});

Deno.test("arange with start < stop and step > 0", () => {
    const arr = NumArray.arange(1, 5, 1);
    assertEquals(arr.elements, [1, 2, 3, 4, 5]);
});

Deno.test("arange with start > stop and step < 0", () => {
    const arr = NumArray.arange(5, 1, -1);
    assertEquals(arr.elements, [5, 4, 3, 2, 1]);
});

Deno.test("arange with start > stop and step < 0", () => {
    const arr = NumArray.arange(5, 1, -1);
    assertEquals(arr.elements, [5, 4, 3, 2, 1]);
});

Deno.test("arange with start > stop and step > 0", () => {
    const arr = NumArray.arange(5, 1, 1);
    assertEquals(arr.elements, []);
});

Deno.test("arange with start < stop and step < 0", () => {
    const arr = NumArray.arange(1, 5, -1);
    assertEquals(arr.elements, []);
});
