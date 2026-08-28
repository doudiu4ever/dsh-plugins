# dsh-subagent-commands

DSH bundle adding two slash commands that delegate a task to the configured
Codex / Claude Code subagents:

| Command | Delegates to | Tool it drives |
|---|---|---|
| `/codex <task>` | Codex subagent | `subagent_codex` |
| `/claudecode <task>` | Claude Code subagent | `subagent_claude` |

Each command takes the task text, hands it to the model as a fresh user turn,
and tells the model to run the matching subagent tool. It reuses the subagent
provider/tool wiring you already configure (it does **not** bundle or start a
Codex / Claude Code process itself).

## Prerequisites

A DSH profile with the two official subagent bundles **installed, wired, and
exposing the tool names this bundle targets**:

```sh
dsh plugin --profile web add @deepseek-ai/dsh-subagent-codex
dsh plugin --profile web add @deepseek-ai/dsh-subagent-claude-code
```

Then ensure the provider instances and `dsh-tool-subagent` tool rows are
present in the profile's `cordis.patch.yml`, with `toolName: subagent_codex`
and `toolName: subagent_claude`. The tools must be visible, so use a fresh
session after installing.

## Install

```sh
dsh plugin --profile web add <path-or-package>
dsh web        # restart the profile
```

Then open a **new session** (tool catalogs are bound at session creation) and
type:

```text
/codex 审查仓库 src 并返回摘要
/claudecode 查一下这个报错的成因
```

The command result is shown in the UI immediately; the delegated answer comes
back from the subagent in the next model turn.

## Note on permissions

The default subagent instances are read-only (`never` / `dontAsk`), so these
commands work well for review, scan, and planning. For file-editing tasks,
configure an `acceptEdits` / `approve-for-me` instance (or a bypass instance)
and point another command/tool at it.

## Files

- `lib/index.js` — the Cordis plugin registering both commands
- `cordis.patch.yml` — the bundle patch (inserts the plugin)
- `package.json` — declares `dsh.bundle.patch`

MIT.
