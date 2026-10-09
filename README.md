# MIPS Quest

**Learn the machine. Rewrite the game.**

MIPS Quest is a proposed interactive N64 ROM-hacking adventure. It will teach assembly through a playable world connected to a verifiable CPU simulator, then bridge into safe modification of user-supplied game ROMs.

> **Current phase: Milestone A (foundation).** The web app contains a **read-only CPU diagnostic**, not yet a game or interactive programming course. See [Project Status](docs/PROJECT-STATUS.md) for the implemented boundary.

## Quick start

Requirements: Node.js 22.12+ and npm 10+.

```bash
npm install
npm run dev
```

Then open the local Vite URL. Click **STEP INSTRUCTION** to watch a tiny MIPS program execute and power a simulated beacon. **RESET** restarts it. The source is fixed intentionally: code editing and the assembler arrive in Milestone B.

```bash
npm run test       # Node-based CPU tests
npm run typecheck  # Both TS packages
npm run build      # CPU and web build
```

## Project map

- `apps/web/` — React/Vite shell with live CPU diagnostic.
- `packages/mips-core/` — headless MIPS execution engine and tests.
- `docs/PROJECT-STATUS.md` — canonical implemented capability record.
- `docs/GAME-DESIGN.md` — campaign, mechanics and first playable vertical slice.
- `docs/CURRICULUM.md` — beginner education and source corrections.
- `docs/ARCHITECTURE.md`, `docs/MIPS-SEMANTICS.md` — machine contract and supported operations.
- `docs/ROM-PATCHING.md` — research plan for later safe native ROM patching.
- `docs/ROADMAP.md`, `docs/VALIDATION.md` — next work and test evidence.

## Current limitations

Only `nop`, `addiu`, `ori`, `lui`, `lw`, and `sw` are supported. This is not a complete R4300i/N64 emulator. No assembly editor, adventure missions, backstepping, progression saves, real ROM patcher or native ROM execution are implemented yet.

## Copyright and safety

Do not commit commercial ROMs, BIOSes, or proprietary Nintendo assets. Future ROM operations will require exact revision validation, keep pristine inputs untouched, and run on files supplied locally by learners.

## Contributing

Work on dedicated branches and submit PRs with tests and updated source-of-truth docs. Never describe a planned feature as runtime-verified until its documented validation gate passes.

## Online playtesting (GitHub Pages)

Development builds are intended to publish at [the MIPS Quest Pages site](https://smeagol44.github.io/MIPS-QUEST/) from `main` using `.github/workflows/pages.yml`. This link is **not considered live** until the first Pages deployment succeeds.

To enable: Settings → Pages → Build and deployment → Source: **GitHub Actions**. After a merge or manual workflow dispatch, check the [Actions page](https://github.com/smeagol44/MIPS-QUEST/actions) for the Pages workflow, and follow its deployed environment URL.

Pages is a **public playtesting venue**, not the final 1.0 hosting decision. Work continues via branches and PRs; Pages does not publish unmerged PRs.
