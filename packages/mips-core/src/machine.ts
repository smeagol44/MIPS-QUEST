import {
  MachineFault,
  type MachineConfig,
  type MachineEvent,
  type MachineSnapshot,
  type MipsMachine,
  type StepResult,
} from "./types.js";

/**
 * Milestone A instruction subset: NOP, ADDIU, ORI, LUI, LW, SW.
 * This is NOT a complete R4300i emulator. Branches, delay slots, exceptions,
 * TLB, caches, coprocessors, and memory-mapped hardware are not implemented yet.
 */
const REGISTER_COUNT = 32;

function u32(value: number): number {
  return value >>> 0;
}

function signed16(value: number): number {
  return (value << 16) >> 16;
}

function signExtend32(value: bigint): bigint {
  return BigInt.asIntN(64, BigInt.asIntN(32, value));
}

export function createMachine(config: MachineConfig): MipsMachine {
  const base = u32(config.memoryBase);
  const startPc = u32(config.startPc);
  const size = config.memorySize;
  if (!Number.isSafeInteger(size) || size < 4 || !Number.isInteger(config.memoryBase)
      || !Number.isInteger(config.startPc) || !Number.isSafeInteger(config.memoryBase)
      || !Number.isSafeInteger(config.startPc) || base + size > 0x1_0000_0000) {
    throw new RangeError("Invalid 32-bit memory map");
  }

  let seedMemory = new Uint8Array(size);
  let memory = seedMemory.slice();
  const seedGpr = Array<bigint>(REGISTER_COUNT).fill(0n);
  for (const [indexText, value] of Object.entries(config.initialRegisters ?? {})) {
    const index = Number(indexText);
    if (!Number.isInteger(index) || index < 0 || index >= REGISTER_COUNT) {
      throw new RangeError("Invalid register index");
    }
    if (index !== 0) seedGpr[index] = BigInt.asIntN(64, value);
  }
  let gpr = seedGpr.slice();
  let pc = startPc;
  let retiredInstructions = 0;

  function offset(address: number, width: number): number {
    const a = u32(address);
    if (a % width !== 0) {
      throw new MachineFault("MISALIGNED", "Unaligned " + width + "-byte access at 0x" + a.toString(16));
    }
    if (a < base || a - base + width > size) {
      throw new MachineFault("UNMAPPED", "Unmapped memory address 0x" + a.toString(16));
    }
    return a - base;
  }

  function readWord(address: number): number {
    const i = offset(address, 4);
    return (((memory[i]! << 24) | (memory[i + 1]! << 16) |
      (memory[i + 2]! << 8) | memory[i + 3]!) >>> 0);
  }

  function writeWord(address: number, value: number): void {
    const i = offset(address, 4);
    memory[i] = value >>> 24;
    memory[i + 1] = value >>> 16;
    memory[i + 2] = value >>> 8;
    memory[i + 3] = value;
  }

  function snapshot(): MachineSnapshot {
    return {
      pc,
      gpr: [...gpr],
      hi: 0n,
      lo: 0n,
      memory: memory.slice(),
      retiredInstructions,
    };
  }

  function reset(): MachineSnapshot {
    memory = seedMemory.slice();
    gpr = seedGpr.slice();
    pc = startPc;
    retiredInstructions = 0;
    return snapshot();
  }

  function loadWords(address: number, words: readonly number[]): void {
    // Transactional load: failed writes must not partially change the image.
    const previous = memory;
    memory = seedMemory.slice();
    try {
      words.forEach((word, index) => {
        if (!Number.isInteger(word) || word < 0 || word > 0xffffffff) {
          throw new RangeError("Instruction words must be unsigned 32-bit integers");
        }
        writeWord(address + index * 4, word);
      });
      seedMemory = memory.slice();
    } catch (error) {
      memory = previous;
      throw error;
    }
    reset();
  }

  function step(): StepResult {
    const word = readWord(pc);
    const op = word >>> 26;
    const rs = (word >>> 21) & 31;
    const rt = (word >>> 16) & 31;
    const imm = word & 0xffff;
    const events: MachineEvent[] = [];
    let mnemonic: string;
    let nextRegister: bigint | undefined;
    let pendingStore: { address: number; value: number; previous: number } | undefined;

    switch (op) {
      case 0:
        if (word !== 0) throw new MachineFault("UNSUPPORTED", "Unsupported SPECIAL instruction");
        mnemonic = "nop";
        break;
      case 0x09: // ADDIU is a 32-bit operation; immediate is signed, result sign-extended.
        mnemonic = "addiu";
        nextRegister = signExtend32(gpr[rs]! + BigInt(signed16(imm)));
        break;
      case 0x0d: // ORI zero-extends its 16-bit immediate and operates on full GPR width.
        mnemonic = "ori";
        nextRegister = BigInt.asIntN(64, gpr[rs]! | BigInt(imm));
        break;
      case 0x0f:
        mnemonic = "lui";
        nextRegister = signExtend32(BigInt(u32(imm << 16)));
        break;
      case 0x23: { // LW sign-extends the loaded word into a 64-bit GPR.
        mnemonic = "lw";
        const address = u32(Number(BigInt.asUintN(32, gpr[rs]!)) + signed16(imm));
        nextRegister = signExtend32(BigInt(readWord(address)));
        break;
      }
      case 0x2b: { // SW writes the low 32 bits in big-endian order.
        mnemonic = "sw";
        const address = u32(Number(BigInt.asUintN(32, gpr[rs]!)) + signed16(imm));
        const previous = readWord(address);
        pendingStore = { address, value: Number(BigInt.asUintN(32, gpr[rt]!)), previous };
        break;
      }
      default:
        throw new MachineFault("UNSUPPORTED", "Opcode 0x" + op.toString(16) + " not implemented in Milestone A");
    }

    // Validate everything before publishing a state change.
    events.push({ kind: "instruction", address: pc, word, mnemonic });
    if (nextRegister !== undefined && rt !== 0) {
      const next = BigInt.asIntN(64, nextRegister);
      events.push({ kind: "register-write", index: rt, previous: gpr[rt]!, value: next });
      gpr[rt] = next;
    }
    if (pendingStore !== undefined) {
      writeWord(pendingStore.address, pendingStore.value);
      events.push({ kind: "memory-write", address: pendingStore.address, width: 4,
        previous: pendingStore.previous, value: pendingStore.value });
    }
    const previousPc = pc;
    pc = u32(pc + 4);
    retiredInstructions++;
    events.push({ kind: "pc-write", previous: previousPc, value: pc });
    gpr[0] = 0n;
    return { snapshot: snapshot(), events };
  }

  return { snapshot, loadWords, readWord, step, reset };
}
