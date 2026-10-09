import test from "node:test";
import assert from "node:assert/strict";
import { assemble, AssemblyError } from "../dist/index.js";

test("assembles the actual beacon program to known MIPS instruction words", () => {
  const result = assemble("// charge the beacon\naddiu $t0, $zero, 3\nsw $t0, 0($s0) ; write device\nlw $t1, 0($s0)\nnop");
  assert.deepEqual(result.words, [0x24080003, 0xae080000, 0x8e090000, 0x00000000]);
  assert.deepEqual(result.instructions.map(i => i.line), [2, 3, 4, 5]);
});
test("handles hex immediates and signed fields correctly", () => {
  assert.equal(assemble("lui $t0, 0x8000").words[0], 0x3c088000);
  assert.equal(assemble("ori $t0, $zero, 0xFFFF").words[0], 0x3408ffff);
  assert.equal(assemble("addiu $t0, $t0, -1").words[0], 0x2508ffff);
  assert.equal(assemble("lw $v0, -4($sp)").words[0], 0x8fa2fffc);
});
test("rejects out-of-range immediate without silently truncating", () => {
  assert.throws(() => assemble("ori $t0, $zero, 65536"), e => e instanceof AssemblyError && e.line === 1);
  assert.throws(() => assemble("addiu $t0, $zero, 32768"), AssemblyError);
});
test("rejects invalid register names and bad memory syntax", () => {
  assert.throws(() => assemble("ori $wat, $zero, 4"), AssemblyError);
  assert.throws(() => assemble("sw $t0, $s0"), AssemblyError);
});
test("rejects unsupported opcodes, macros and empty source", () => {
  assert.throws(() => assemble("beq $t0, $zero, 4"), AssemblyError);
  assert.throws(() => assemble(".org 0x100"), AssemblyError);
  assert.throws(() => assemble("; empty\n"), AssemblyError);
});
test("limits sandbox length and source size", () => {
  assert.throws(() => assemble("nop\nnop", { maxInstructions: 1 }), AssemblyError);
  assert.throws(() => assemble(" ".repeat(16385)), AssemblyError);
});
test("instruction with missing operands gets useful line diagnostics", () => {
  assert.throws(() => assemble("\naddiu $t0, 3"), e => e instanceof AssemblyError && e.line === 2);
});
