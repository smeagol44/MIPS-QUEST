/** A deliberately bounded assembler for the Milestone B educational CPU subset. */
export interface AssembledInstruction {
  readonly line: number;
  readonly source: string;
  readonly word: number;
}
export interface AssembledProgram {
  readonly words: readonly number[];
  readonly instructions: readonly AssembledInstruction[];
}

export class AssemblyError extends Error {
  constructor(public readonly line: number, message: string) {
    super(line > 0 ? "Line " + line + ": " + message : message);
    this.name = "AssemblyError";
  }
}

const registerNames = [
  "zero", "at", "v0", "v1", "a0", "a1", "a2", "a3",
  "t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7",
  "s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7",
  "t8", "t9", "k0", "k1", "gp", "sp", "s8", "ra",
] as const;
const registerAliases = new Map<string, number>(registerNames.map((name, index) => [name, index]));
registerAliases.set("fp", 30);

function parseRegister(text: string, line: number): number {
  const token = text.trim().toLowerCase().replace(/^\$/, "");
  const alias = registerAliases.get(token);
  if (alias !== undefined) return alias;
  if (/^(?:r)?(?:[0-9]|[12][0-9]|3[01])$/.test(token)) return Number(token.replace(/^r/, ""));
  throw new AssemblyError(line, "Unknown register '" + text.trim() + "'. Try $t0, $s0, or $zero.");
}

function parseImmediate(text: string, line: number, signed: boolean): number {
  const token = text.trim();
  if (!/^[+-]?(?:0x[0-9a-f]+|[0-9]+)$/i.test(token)) {
    throw new AssemblyError(line, "Invalid number '" + token + "'. Use decimal (3, -2) or hexadecimal (0xFF).");
  }
  const negative = token.startsWith("-");
  const unsignedText = token.replace(/^[+-]/, "");
  const value = BigInt(unsignedText) * (negative ? -1n : 1n);
  const positiveHex = /^(\+)?0x/i.test(token);
  const minimum = signed ? -32768n : 0n;
  const maximum = signed && !positiveHex ? 32767n : 65535n;
  if (value < minimum || value > maximum) {
    throw new AssemblyError(line, "Immediate must fit the " + (signed ? "signed" : "unsigned") + " 16-bit instruction field.");
  }
  return Number(BigInt.asUintN(16, value));
}

function encodeI(opcode: number, rs: number, rt: number, imm: number): number {
  return (((opcode << 26) | (rs << 21) | (rt << 16) | imm) >>> 0);
}

function assertCount(op: string, operands: readonly string[], expected: number, line: number) {
  if (operands.length !== expected || operands.some(s => s.length === 0)) {
    throw new AssemblyError(line, op.toUpperCase() + " requires " + expected + " operand" + (expected === 1 ? "" : "s") + ".");
  }
}

function assembleInstruction(op: string, operands: string[], line: number): number {
  const upper = op.toUpperCase();
  if (upper === "NOP") {
    assertCount(upper, operands, 0, line);
    return 0;
  }
  if (upper === "ADDIU" || upper === "ORI") {
    assertCount(upper, operands, 3, line);
    const rt = parseRegister(operands[0]!, line);
    const rs = parseRegister(operands[1]!, line);
    const imm = parseImmediate(operands[2]!, line, upper === "ADDIU");
    return encodeI(upper === "ADDIU" ? 0x09 : 0x0d, rs, rt, imm);
  }
  if (upper === "LUI") {
    assertCount(upper, operands, 2, line);
    return encodeI(0x0f, 0, parseRegister(operands[0]!, line),
      parseImmediate(operands[1]!, line, false));
  }
  if (upper === "LW" || upper === "SW") {
    assertCount(upper, operands, 2, line);
    const rt = parseRegister(operands[0]!, line);
    const address = /^(.+)\(\s*(\$?[a-z0-9]+)\s*\)$/i.exec(operands[1]!);
    if (!address) throw new AssemblyError(line, "Use memory syntax like 0($s0) or -4($sp).");
    const imm = parseImmediate(address[1]!, line, true);
    const rs = parseRegister(address[2]!, line);
    return encodeI(upper === "LW" ? 0x23 : 0x2b, rs, rt, imm);
  }
  throw new AssemblyError(line, "Unsupported instruction '" + op + "'. Available: NOP, ADDIU, ORI, LUI, LW, SW.");
}

/**
 * Parses only documented native instructions. No labels, macros, pseudo-
 * instructions, include directives, disk IO, or dynamically executed code.
 */
export function assemble(source: string, options: { maxInstructions?: number } = {}): AssembledProgram {
  const maxInstructions = options.maxInstructions ?? 32;
  if (!Number.isInteger(maxInstructions) || maxInstructions < 1 || maxInstructions > 256) {
    throw new RangeError("Instruction limit must be between 1 and 256");
  }
  if (source.length > 16384) throw new AssemblyError(0, "Program source exceeds 16 KiB.");
  const instructions: AssembledInstruction[] = [];
  const lines = source.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    const content = lines[index]!.replace(/(?:\/\/|;).*$/, "").trim();
    if (!content) continue;
    if (instructions.length >= maxInstructions) throw new AssemblyError(index + 1, "Program exceeds the " + maxInstructions + "-instruction sandbox limit.");
    const match = /^([a-z][a-z0-9]*)\b\s*(.*?)$/i.exec(content);
    if (!match) throw new AssemblyError(index + 1, "Expected an instruction name.");
    const op = match[1]!;
    const args = match[2]?.trim() ? match[2].split(",").map(s => s.trim()) : [];
    const word = assembleInstruction(op, args, index + 1);
    instructions.push({ line: index + 1, source: content, word });
  }
  if (instructions.length === 0) throw new AssemblyError(0, "Write at least one MIPS instruction.");
  return { instructions, words: instructions.map(x => x.word) };
}
