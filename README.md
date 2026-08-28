# dsh-plugins

A home for my DeepSeek Harness (DSH) plugins. Each subdirectory is a standalone
DSH profile bundle: it declares `dsh.bundle.patch` in its `package.json` and is
installed into a profile with:

```sh
cd <plugin-dir> && pnpm install
dsh plugin --profile <name> add <plugin-dir>
```

## Bundles

- [`dsh-subagent-commands`](dsh-subagent-commands) — `/codex` and `/claudecode`
  slash commands that delegate a task to the configured Codex / Claude Code
  subagent providers.
