# Project Status

**Owner:** This file is the canonical record of implemented and verified capabilities.

## Current phase

Milestone A — foundational application and MIPS core contracts, under review on branch \`milestone-a/foundation\`.

## Implemented in this milestone

- npm workspace monorepo with React/Vite shell and standalone TypeScript CPU package.
- Executable narrow MIPS subset: NOP, ADDIU, ORI, LUI, LW, SW.
- Deterministic CPU state, 64-bit general-purpose registers, big-endian mapped sandbox RAM, event stream, snapshots and reset.
- Read-only instruction-stepping demonstration with animated beacon feedback and register displays.
- Node test harness and GitHub Actions CI specification.
- Architecture, curriculum, ROM policy, roadmap and validation records.

## Explicitly not implemented

Playable missions, learner code editing/assembly, branches and delay slots, stack and subroutines, reverse execution, world navigation, progression saves, real ROM patching, browser emulator integration and PS1 support.

## Verification boundary

GitHub Actions CI run #1 (37885038097) passed on commit `5d7af0f6`: dependency install, automated tests, TypeScript typecheck and production build. A local graphical/browser interaction test has not been performed; the running app remains an unreviewed diagnostic.

## Next milestone

Milestone B: extend simulator correctness, add assembler and editor, branch/delay semantics, rewind or reversible events, and richer visualization before introducing authored missions.
