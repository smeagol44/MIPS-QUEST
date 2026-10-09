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
