# Bend for Zed

Syntax highlighting and language-server features for [Bend](https://github.com/bendlang/bend) in [Zed](https://zed.dev).

This is Bend 2 (`.bend` files with `def` / `type` / `law`). Bend 1 does not apply.

Highlighting is Tree-sitter in this repo. Hover, go-to-definition, diagnostics, completion, references, and rename come from [`bolt lsp`](https://github.com/Emerging-Patterns/bolt).

## Install

Zed compiles the extension to WASM, so Rust has to come from [rustup](https://rustup.rs) (Homebrew rustc will fail).

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
git clone https://github.com/chhoumann/zed-bend.git
```

If the store listing named **Bend** is installed, uninstall it first (that one is Bend 1). Then in Zed:

1. `cmd-shift-x` (or `zed: extensions`)
2. **Install Dev Extension**
3. Select the `zed-bend` clone

Open `examples/hello.bend` to check highlighting. Rebuild the dev extension after `git pull`. If it fails, `zed: open log`.

### Hover and the rest

Install [bolt](https://github.com/Emerging-Patterns/bolt) so `bolt` is on your PATH (Zed also looks in `~/.local/bin`, `~/.bend/bin`, `~/.bun/bin`, `~/.nix-profile/bin`, and `bin/bolt.bin` in the project):

```
nix profile install github:Emerging-Patterns/bolt
```

or, from a bolt checkout:

```
bend bolt/main.bend -o bin/bolt.bin
```

Then restart the language server. To pin a binary:

```json
{
  "lsp": {
    "bolt": {
      "binary": {
        "path": "/Users/you/.local/bin/bolt",
        "arguments": ["lsp"]
      }
    }
  }
}
```

The extension id is `bend`. Publishing to the store means a PR that retargets [zed-industries/extensions](https://github.com/zed-industries/extensions) `extensions/bend` at this repo.

## Grammar

```
pnpm install
pnpm generate
pnpm test
```
