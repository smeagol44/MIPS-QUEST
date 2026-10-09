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

Authored test suite; execution and CI confirmation pending. A published workflow is not a CI pass. In the first milestone, browser gameplay and emulator runtime validation are not claimed.

## Future gates

Semantic differential fixtures, instruction assembly/disassembly identity tests, reversible execution tests, deterministic multi-seed mission validation, accessibility, end-to-end gameplay and bounded real-ROM emulator proofs.
