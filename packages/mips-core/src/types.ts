/**
 * MIPS Quest R4300i educational core contract.
 * General-purpose registers are 64-bit even when executing 32-bit instructions.
 * All addresses exposed here are 32-bit virtual addresses for the current sandbox.
 */
export type RegisterIndex = number;

export interface MachineConfig {
  readonly memoryBase: number;
  readonly memorySize: number;
  readonly startPc: number;
  readonly initialRegisters?: Readonly<Record<number, bigint>>;
}

export interface MachineSnapshot {
  readonly pc: number;
  readonly gpr: readonly bigint[];
  readonly hi: bigint;
  readonly lo: bigint;
  /** Copy of mapped big-endian memory; mutating it cannot change machine state. */
  readonly memory: Uint8Array;
  readonly retiredInstructions: number;
}

export type MachineEvent =
  | { readonly kind: "instruction"; readonly address: number; readonly word: number; readonly mnemonic: string }
  | { readonly kind: "register-write"; readonly index: number; readonly previous: bigint; readonly value: bigint }
  | { readonly kind: "memory-write"; readonly address: number; readonly width: 4; readonly previous: number; readonly value: number }
  | { readonly kind: "pc-write"; readonly previous: number; readonly value: number };

export interface StepResult {
  readonly snapshot: MachineSnapshot;
  readonly events: readonly MachineEvent[];
}

export interface MipsMachine {
  snapshot(): MachineSnapshot;
  loadWords(address: number, words: readonly number[]): void;
  readWord(address: number): number;
  step(): StepResult;
  /** Restore the most recently loaded program and the initial register configuration. */
  reset(): MachineSnapshot;
}

export type MachineFaultCode = "MISALIGNED" | "UNMAPPED" | "UNSUPPORTED";

export class MachineFault extends Error {
  constructor(public readonly code: MachineFaultCode, message: string) {
    super(message);
    this.name = "MachineFault";
  }
}
