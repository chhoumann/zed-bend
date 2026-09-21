# Bend for Zed

Syntax highlighting for [Bend](https://github.com/bendlang/bend) in [Zed](https://zed.dev).

This is Bend 2 (`.bend` files with `def` / `type` / `law`). It is a new language; Bend 1 highlighting does not apply.

## Install

Zed compiles the grammar to WASM, so Rust has to come from [rustup](https://rustup.rs) (Homebrew rustc will fail).

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
git clone https://github.com/chhoumann/zed-bend.git
```

If the store listing named **Bend** is installed, uninstall it first (that one is Bend 1). Then in Zed:

1. `cmd-shift-x` (or `zed: extensions`)
2. **Install Dev Extension**
3. Select the `zed-bend` clone

Open `examples/hello.bend` to check highlighting. If it fails, `zed: open log`.

The extension id is `bend`. Publishing to the store means a PR that retargets [zed-industries/extensions](https://github.com/zed-industries/extensions) `extensions/bend` at this repo.

## Grammar

Zed highlighting is Tree-sitter. The grammar lives in this repo (`grammar.js`, `src/parser.c`). Token classes follow `bend2/docs/bend.sublime-syntax` in the Bend repo. Structure follows the SYNTAX block in `bend2/bend.ts`.

```
pnpm install
pnpm generate
pnpm test
```

## Status

The four files in `examples/` parse without error nodes. About three quarters of the Bend 2 test suite parses cleanly. Remaining failures are odd corners (the grammar is for highlighting, not a second compiler).
