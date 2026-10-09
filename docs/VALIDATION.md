# Validation Ledger

## Required Milestone A commands

\`\`\`sh
npm install
npm run test
npm run typecheck
npm run build
npm run dev
\`\`\`

## Test coverage

- ADDIU 32-bit signed/wrapping behavior in 64-bit registers.
- Zero-register invariance.
- Big-endian SW/LW and sign-extension.
- ORI and LUI behavior.
- Alignment faults and unsupported opcodes.
- Reset, snapshot isolation and atomic failed code-loading behavior.

## Status

GitHub Actions CI run #1 (37885038097) completed successfully on commit `5d7af0f6` with install, test, typecheck and production build passing. A direct browser interaction test and native emulator test have not been performed. Source code is still subject to review.

## Future gates

Semantic differential fixtures, instruction assembly/disassembly identity tests, reversible execution tests, deterministic multi-seed mission validation, accessibility, end-to-end gameplay and bounded real-ROM emulator proofs.

## Pages playtest deployment

Deployment workflow: `.github/workflows/pages.yml` (push to `main`, plus manual dispatch). It runs install, unit tests, typecheck and build before publishing only `apps/web/dist`. GitHub Pages must be configured with **Source: GitHub Actions** in repository Settings → Pages.

A passing upload/deploy Actions run is required before claiming the site is published. Browser manual test: visit the published URL, step four times, verify beacon activates and `$t1` reads 3, then RESET and verify initial state returns. No manual browser runtime validation claimed until actually performed.

A new regression test executes the beacon program through the real core and verifies stores/loads at the same mapped address used by the web demo.

## Verified Pages Action deployment

GitHub Actions [run #37885644956](https://github.com/smeagol44/MIPS-QUEST/actions/runs/37885644956) completed successfully for main SHA `c61caab7` with tests, typecheck, build, artifact upload and Pages deployment. The workflow reported `https://smeagol44.github.io/MIPS-QUEST/` as its environment URL. Direct browser interaction proof has **not** been recorded.

## Milestone B initial assembler/editor checks

Tests added for instruction encoding, immediate ranges, operand counts, unsupported operations, source length, diagnostics, and compiling/running different valid beacon programs. GitHub Actions CI [run #37886116994](https://github.com/smeagol44/MIPS-QUEST/actions/runs/37886116994) passed test, typecheck and build for PR #3. The [Pages run #37886182419](https://github.com/smeagol44/MIPS-QUEST/actions/runs/37886182419) successfully deployed main commit `cff61d7`. Manual browser smoke test of the editable UI remains pending.
