# Project Status

**Owner:** This file is the canonical record of implemented and verified capabilities.

## Current phase

Milestone A — foundational application and MIPS core contracts, under review on branch \`milestone-a/foundation\`.

## Implemented in Milestone A

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

## GitHub Pages playtesting

Deployment via GitHub Actions is introduced in the `infra/github-pages-playtest` PR and remains **pending successful deployment validation** until a Pages Actions run completes and the actual public URL responds. Future web experiences publish only from reviewed changes to `main`. Pages is a public playtest build, **not** the version-1.0 production environment.

The initial diagnostic beacon machine code has been corrected to address `0($s0)` with `$s0 = 0x80000100` instead of mistakenly storing to `0x100($s0)`. A full beacon-execution regression is added to CPU tests.
