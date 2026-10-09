import test from "node:test";
import assert from "node:assert/strict";
import { assemble } from "../dist/index.js";
import { createMachine } from "../../mips-core/dist/index.js";

const base = 0x80000000;
const target = base + 0x100;
const make = code => {
  const cpu = createMachine({
    memoryBase: base, memorySize: 0x400, startPc: base,
    initialRegisters: { 16: BigInt.asIntN(64, BigInt(target)) },
  });
  const program = assemble(code);
  cpu.loadWords(base, program.words);
  for (let i = 0; i < program.words.length; i++) cpu.step();
  return cpu;
};

test("learner-authored MIPS, not an answer string, changes the beacon state", () => {
  const source = "addiu $t0, $zero, 3\nsw $t0, 0($s0)\nlw $t1, 0($s0)\nnop";
  const good = make(source);
  assert.equal(good.readWord(target), 3);
  assert.equal(good.snapshot().gpr[9], 3n);
  const wrongPower = make(source.replace(", 3", ", 2"));
  assert.equal(wrongPower.readWord(target), 2);
  assert.equal(wrongPower.snapshot().gpr[9], 2n);
  good.reset();
  assert.equal(good.readWord(target), 0);
});

test("alternative valid register implementation produces the same device behavior", () => {
  const cpu = make("ori $v0, $zero, 3\nsw $v0, 0($s0)");
  assert.equal(cpu.readWord(target), 3);
});
