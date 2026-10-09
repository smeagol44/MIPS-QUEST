# Architecture & Interfaces

## Components

- \`apps/web\`: React/Vite presentation shell. Milestone A includes a read-only stepping diagnostic, not yet a Phaser adventure.
- \`packages/mips-core\`: headless deterministic educational CPU. No web APIs or framework dependencies.
- Future: assembler/editor, mission engine, graphical adventure, progression store, ROM Forge, game adapters and emulator bridge.
- \`tools/rom-patcher\` is reserved for a later Python + armips workflow.

## Current CPU API

\`createMachine(config)\` returns a \`MipsMachine\` supporting \`loadWords\`, \`step\`, \`snapshot\`, \`readWord\` and \`reset\`. State snapshots copy memory and registers; execution emits instruction, register-write, memory-write and PC-write events. Errors use typed \`MachineFault\` codes.

## Semantics & boundaries

- The educational machine has configurable contiguous mapped RAM, represented as a big-endian byte array.
- Current PC/address surface is 32-bit while GPR contents are signed 64-bit BigInts.
- \`ADDIU\` produces 32-bit wraparound followed by sign extension to 64 bits; immediate is signed 16-bit.
- \`ORI\` zero-extends the 16-bit immediate and ORs with full 64-bit source.
- \`LUI\` forms a 32-bit value and sign-extends it to 64 bits.
- \`LW\` sign-extends a big-endian 32-bit word; \`SW\` writes the low 32 bits in big-endian order.
- \`$zero\` stays zero. Unsupported instructions throw, rather than falling through.
- Unsupported: branches, delay slots, exception semantics, TLB/virtual translation, cache behavior, MMIO, coprocessors, HI/LO mutation, interrupts, cycle timings, load hazards, real N64 ROM execution.
- \`loadWords\` replaces the previously loaded initial program image, and reset restores that image and initial registers. The API does not yet support multi-segment load operations.

## Design constraints

Instruction execution and state snapshots remain authoritative; visual animations are derived from events. The mission engine must later validate postconditions across multiple initial states. Save state schema requires explicit versioning. Real-game code must be isolated behind revision-verified adapters and never be conflated with simulated device addresses.

## Architectural decisions

See \`docs/adr/0001-foundation.md\`.
