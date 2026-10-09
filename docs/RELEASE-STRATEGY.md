# Release Strategy and Environments

## GitHub Pages: public development playtest

GitHub Pages serves **the latest reviewed `main` build**, deployed through GitHub Actions. This is an easy-access public testing URL, *not* a promise that the game is at release quality. It must not store ROMs, server-side account secrets or copyrighted assets. For now, there are no third-party accounts or backend APIs.

PRs build and test without automatically altering the public Pages version; successful, reviewed merges make the next public test version available. CI passing is necessary but insufficient: the maintainer should manually test key interactions and record findings.

## Future version 1.0: a complete beginner-to-ROM-hacking experience

A meaningful 1.0 should provide a real adventure with the full foundational progression, finished world art/UI/sound, explanatory guidance for beginners, useful missions and boss challenges, persistent save/unlock state, robust verified MIPS instruction behavior, and a complete **safe Super Mario 64 ROM patch expedition** using a user-supplied verified ROM and demonstrated emulator effects.

**Target (subject to review):** Worlds 0–7 at a cohesive quality level plus a substantial first Super Mario 64 practical campaign. Game-specific expansions (Mario Kart 64, Zelda OOT, Banjo-Kazooie, Star Fox 64) and a PS1 campaign are meaningful follow-ons, not automatically blocking if they would compromise polish or verification. The owner may choose additional scope before declaring 1.0. Prioritize experiential completeness over raw lesson count.

### 1.0 quality gates

- A beginner can move from the first interaction through verified MIPS reasoning without unexplained prerequisites.
- Missions validate the *resulting machine behavior*, including alternate implementations and multiple inputs, not fixed answer strings.
- CPU semantics, branch delay behavior, memory and assembly encodings are tested against authoritative specifications and known-good fixtures.
- The game is accessible by keyboard, does not rely only on color or motion, and has clear recovery from user errors.
- Saves are versioned, support export/import, and survive page reloads and normal upgrades.
- Any ROM patch uses a verified revision and original-bytes manifest, never overwrites original input, and is checked through both static tests and an emulator proof.
- Copyrighted game ROMs, BIOSes and game assets are not redistributed.
- Browser functionality receives manual smoke tests before promotion in addition to CI.
- The distinct production URL and hosting are chosen near release readiness and deployed from an explicit release workflow.

## Version / documentation discipline

Never mark a feature as complete only because code was merged. Use `docs/PROJECT-STATUS.md` for implemented/verified truth, `docs/VALIDATION.md` for evidence, `docs/ROADMAP.md` for pending work, and an ADR for architectural decisions. Maintain experimental, validated and released as separate states.

## First deployment evidence

GitHub Actions Pages run #37885644956 succeeded for main commit `c61caab7` on October 9, 2026, reporting `https://smeagol44.github.io/MIPS-QUEST/`. Manual browser smoke testing remains outstanding. Reviewed `main` merges publish to the playtesting environment; a separate site will host the eventual 1.0 release.
