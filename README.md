# Bend for Zed

Syntax highlighting for [Bend](https://github.com/bendlang/bend) in [Zed](https://zed.dev).

This is Bend 2 (`.bend` files with `def` / `type` / `law`). It is a new language; Bend 1 highlighting does not apply.

## Install

In Zed: `zed: extensions` → **Install Dev Extension** → this directory.

To use the published listing later, the extension id is `bend`. That slot is currently occupied by a stale Bend 1 extension. Publishing means a PR to [zed-industries/extensions](https://github.com/zed-industries/extensions) that retargets `extensions/bend` here.

## Grammar

Zed highlighting is Tree-sitter. The grammar lives in this repo (`grammar.js`, `src/parser.c`). Token classes follow `bend2/docs/bend.sublime-syntax` in the Bend repo. Structure follows the SYNTAX block in `bend2/bend.ts`.

```
pnpm install
pnpm generate
pnpm test
```

## Status

The four files in `examples/` parse without error nodes. About three quarters of the Bend 2 test suite parses cleanly. Remaining failures are odd corners (the grammar is for highlighting, not a second compiler).
