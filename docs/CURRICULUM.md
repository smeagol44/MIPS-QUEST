# Curriculum & Source Review

## Reference

Tarek701, *MIPS R4300i Assembly Tutorial* (38-page user-provided revision). Historical instructional inspiration, not the canonical CPU specification.

Its informal, practical learning loop is retained: introduce one concept, perform an experiment, observe an actual consequence and explain the causal chain. The tutorial covers bases, ROM/RAM, registers, loads/stores, arithmetic, branches, subroutines and a partial introduction to floating point. Later chapters are unfinished in the provided document.

## Corrections required by curriculum

- A hexadecimal nibble \`A\` is binary \`1010\`, not \`1000\`.
- Signedness and extension depend on operand width and instruction.
- R4300i GPR storage is 64-bit even if code commonly uses 32-bit operations.
- \`ORI\` is a bitwise operation on the whole source, not a general assignment.
- Loads distinguish signed versus unsigned behavior.
- MIPS I and R4300i differences, including exposed PS1 R3000A load-delay behavior, require separate profiles.
- Branch delay slots must be taught with accurate instruction ordering and dependencies.
- ROM offsets are not universally convertible to runtime virtual addresses by one subtraction; loading, DMA and overlays matter.
- Assemblers' pseudo-instructions must be distinguished from hardware operations.
- Address/hook examples from historical tutorials must be verified on a matching ROM revision before reuse.

## Concept stages

1. No prerequisite assumed: values, instructions, state changes and observations.
2. Registers and basic immediate arithmetic, introduced through powered objects.
3. Binary and hex as representations of the same bits, not rote conversion.
4. Memory and the difference between files, runtime and persistence.
5. Branches, delay slots, loops and control flow.
6. Stack frames and calling conventions.
7. Machine code, disassembly and reverse engineering.
8. Verified ROM patch workflow and emulator proof.

Every stage should contain a tangible mechanism, a different-input challenge, hints and a correctness test. The interface must not misrepresent the current read-only foundation demonstration as a completed lesson.
