import test from "node:test";
import assert from "node:assert/strict";
import { createMachine, MachineFault } from "../dist/index.js";

const base = 0x80000000;
const machine = (registers = {}) => createMachine({
  memoryBase: base, memorySize: 0x400, startPc: base, initialRegisters: registers,
});

test("ADDIU executes real 32-bit wrapping and sign-extension semantics", () => {
  const cpu = machine({ 8: 0x7fffffffn });
  cpu.loadWords(base, [0x25080001]);
  const result = cpu.step();
  assert.equal(result.snapshot.gpr[8], -2147483648n);
  assert.equal(result.snapshot.pc, base + 4);
  assert.equal(result.events[0].mnemonic, "addiu");
});

test("zero register cannot be written and is always zero", () => {
  const cpu = machine({ 0: 99n });
  cpu.loadWords(base, [0x24000007]);
  cpu.step();
  assert.equal(cpu.snapshot().gpr[0], 0n);
});

test("SW stores bytes big-endian, LW retrieves and sign-extends them", () => {
  const cpu = machine({ 16: -2147483648n, 8: -1n });
  cpu.loadWords(base, [0xae080100, 0x8e090100]);
  const store = cpu.step();
  assert.deepEqual(Array.from(store.snapshot.memory.slice(0x100, 0x104)), [255, 255, 255, 255]);
  assert.equal(cpu.step().snapshot.gpr[9], -1n);
});

test("ORI uses a zero-extended immediate; LUI sign-extends its result", () => {
  const cpu = machine();
  cpu.loadWords(base, [0x340800ff, 0x3c098000]);
  cpu.step();
  assert.equal(cpu.snapshot().gpr[8], 255n);
  cpu.step();
  assert.equal(cpu.snapshot().gpr[9], -2147483648n);
});

test("misaligned access faults without retiring the instruction", () => {
  const cpu = machine({ 16: -2147483648n });
  cpu.loadWords(base, [0x8e080101]);
  assert.throws(() => cpu.step(), e => e instanceof MachineFault && e.code === "MISALIGNED");
  assert.equal(cpu.snapshot().pc, base);
  assert.equal(cpu.snapshot().retiredInstructions, 0);
});

test("unsupported instructions fault instead of pretending to execute", () => {
  const cpu = machine();
  cpu.loadWords(base, [0x10000000]); // BEQ reserved for Milestone B
  assert.throws(() => cpu.step(), e => e instanceof MachineFault && e.code === "UNSUPPORTED");
  assert.equal(cpu.snapshot().pc, base);
});

test("reset restores loaded bytes, original registers and PC", () => {
  const cpu = machine({ 16: -2147483648n });
  cpu.loadWords(base, [0x24080003, 0xae080100]);
  cpu.step();
  cpu.step();
  assert.equal(cpu.readWord(base + 0x100), 3);
  cpu.reset();
  assert.equal(cpu.readWord(base + 0x100), 0);
  assert.equal(cpu.snapshot().gpr[8], 0n);
  assert.equal(cpu.snapshot().pc, base);
});

test("external snapshot memory mutation does not mutate CPU", () => {
  const cpu = machine();
  cpu.loadWords(base, [0x24080003]);
  const snap = cpu.snapshot();
  snap.memory[0] = 0;
  assert.equal(cpu.readWord(base), 0x24080003);
});

test("loading invalid code cannot partially overwrite the running program", () => {
  const cpu = machine();
  cpu.loadWords(base, [0x24080003]);
  assert.throws(() => cpu.loadWords(base, [0x24090001, -1]), RangeError);
  assert.equal(cpu.readWord(base), 0x24080003);
});

test("the web diagnostic beacon program powers the mapped device and restores on reset", () => {
  const beacon = base + 0x100;
  const cpu = machine({ 16: BigInt.asIntN(64, BigInt(beacon)) });
  cpu.loadWords(base, [0x24080003, 0xae080000, 0x8e090000, 0]);
  assert.equal(cpu.readWord(beacon), 0);
  cpu.step();
  assert.equal(cpu.snapshot().gpr[8], 3n);
  cpu.step();
  assert.equal(cpu.readWord(beacon), 3);
  cpu.step();
  assert.equal(cpu.snapshot().gpr[9], 3n);
  cpu.step();
  assert.equal(cpu.snapshot().retiredInstructions, 4);
  cpu.reset();
  assert.equal(cpu.readWord(beacon), 0);
});
