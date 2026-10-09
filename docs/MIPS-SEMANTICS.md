# CPU Semantics Owner

The CPU implementation is a bounded, educational R4300i-inspired machine, **not** a full console emulator. Its instruction subset follows the corresponding 64-bit R4300i arithmetic/register and big-endian load/store behavior.

| Opcode | Behavior | Status |
| --- | --- | --- |
| \`NOP\` (\`0x00000000\`) | No state change except PC/retired count | Implemented |
| \`ADDIU\` | Signed 16-bit imm, 32-bit arithmetic wrap, sign-extended register result | Implemented |
| \`ORI\` | Zero-extended 16-bit imm; bitwise OR in 64-bit register | Implemented |
| \`LUI\` | Immediate shifted 16, sign-extended 32-bit result | Implemented |
| \`LW\` | Aligned big-endian 32-bit read, sign extended to 64-bit | Implemented |
| \`SW\` | Aligned big-endian 32-bit store from low register word | Implemented |
| \`BEQ\`, \`BNE\`, \`J\`, \`JAL\`, \`JR\` | Delay-slot aware control flow | Future |
| \`LD\`, \`SD\`, LL/SC, FPU, COP0, TLB, cache, exceptions | Detailed architecture | Future |

## Validation priorities

(1) Signedness/overflow edges; (2) zero-register invariance; (3) memory alignment and boundary faults; (4) invalid opcodes must leave state intact; (5) PC movement, delay-slot ordering when added; (6) stack/return semantics; (7) cross-check with established ISA references or emulator traces.

An instruction decoder test pass is not proof of physical N64 compatibility.
