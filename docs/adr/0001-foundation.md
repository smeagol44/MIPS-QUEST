# ADR-0001 — Modular web foundation with headless CPU

Status: Accepted for Milestone A proposal.

Context: A full N64 emulator is too large and game-specific to serve as the initial instructional execution engine. The user experience must remain genuinely executable, not scripted visual sleight of hand.

Decision: Build a headless, independently testable TypeScript MIPS machine and a separate web presentation shell. Use explicit semantic boundaries and event-driven visualization. Add dedicated authored-mission and native ROM patch subsystems later. Start with a read-only fixed program so debugger correctness can be validated before introducing a learner-editable assembler.

Consequences: A bounded simulator can be deterministic and testable. It must visibly disclose unsupported ISA features and cannot claim native game execution until a verified ROM and emulator bridge are added. Phase B needs a more complete execution-state design for delay slots and rewind.
