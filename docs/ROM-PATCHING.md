# ROM Forge — Safety & Research Plan (Future)

Not implemented in Milestone A.

## Planned pipeline

1. User supplies ROM locally. Never redistribute original copyrighted files, game textures, audio, or BIOSes.
2. Detect z64/v64/n64 byte order, normalize a temporary working copy.
3. Match SHA-1/SHA-256 plus header/size against a precise game and revision allowlist; do not guess patch-site compatibility.
4. Validate original instruction bytes, collision-free patch space, ROM/RAM loading mapping, code size, jump reach and overwritten-delay-slot behavior.
5. Feed learner code through a controlled assembler template using maintained armips, orchestrated by local Python.
6. Validate generated changes, apply game-specific resource and relocation rules, recalculate appropriate CIC-dependent N64 checksum and verify output.
7. Write a new patched copy, never overwrite the clean input. Provide manifest and rollback/diff evidence.
8. Test in an external emulator, then investigate browser-side WASM integration and debugger hooks.

Initial target: a single verified Super Mario 64 US ROM revision and a bounded reversible proof. Decompilation is a research/verification reference rather than a substitute for learning assembly. Other ROM revisions and games require independent adapter data.

No live patching of real games or ROM upload endpoint exists yet.
