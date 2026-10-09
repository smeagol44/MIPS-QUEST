# Project Status

**Owner:** This file is the canonical record of implemented and verified capabilities.

## Current phase

Milestone A was merged in PR #1. GitHub Pages playtesting was merged in PR #2 and deployed successfully. The first Milestone B assembler/editor increment is under review.

## Implemented in Milestone A

- npm workspace monorepo with React/Vite shell and standalone TypeScript CPU package.
- Executable narrow MIPS subset: NOP, ADDIU, ORI, LUI, LW, SW.
- Deterministic CPU state, 64-bit general-purpose registers, big-endian mapped sandbox RAM, event stream, snapshots and reset.
- Instruction-stepping demonstration with animated beacon feedback and register displays (Milestone A).
- Node test harness and GitHub Actions CI specification.
- Architecture, curriculum, ROM policy, roadmap and validation records.

## Explicitly not implemented

Playable missions, branches and delay slots, stack and subroutines, reverse execution, world navigation, progression saves, real ROM patching, browser emulator integration and PS1 support. The initial limited learner code editor and assembler have been added in Milestone B; labels, macros and control flow remain unsupported.

## Verification boundary

GitHub Actions CI run #1 (37885038097) passed on commit `5d7af0f6`: dependency install, automated tests, TypeScript typecheck and production build. A local graphical/browser interaction test has not been performed; the running app remains an unreviewed diagnostic.

## Next milestone

Milestone B: extend simulator correctness, add assembler and editor, branch/delay semantics, rewind or reversible events, and richer visualization before introducing authored missions.

## GitHub Pages playtesting

Deployment via GitHub Actions was merged in PR #2. The Pages [run #37885644956](https://github.com/smeagol44/MIPS-QUEST/actions/runs/37885644956) reports **success** and produced https://smeagol44.github.io/MIPS-QUEST/ as its environment URL. Independent HTTP/browser verification remains pending. Future web experiences publish only from reviewed changes to `main`. Pages is a public playtest build, **not** the version-1.0 production environment.

The initial diagnostic beacon machine code has been corrected to address `0($s0)` with `$s0 = 0x80000100` instead of mistakenly storing to `0x100($s0)`. A full beacon-execution regression is added to CPU tests.

## Milestone B first increment (review branch)

A bounded educational assembler translates learner-written NOP, ADDIU, ORI, LUI, LW, and SW into actual machine words. The page exposes editable source, Assemble & Load, Step, bounded Run, Reset, line-aware errors and resulting CPU/register/beacon feedback. Assembler and compiler-to-machine integration tests cover alternative correct programs. This is a **diagnostic sandbox**, not a full mission, native ROM assembler or console emulator.
