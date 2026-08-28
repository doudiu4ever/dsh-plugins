/**
* dsh-subagent-commands — `/codex` and `/claudecode` slash commands.
*
* Each command takes a task, hands it to the model as a fresh user turn, and
* instructs the model to run the matching subagent tool (`subagent_codex` /
* `subagent_claude`). This mirrors the proven `dsh-plan-mode` pattern of a
* command scheduling model-visible work through the receiving Agent, and it
* reuses the subagent tool you already configured (via
* @deepseek-ai/dsh-subagent-codex / @deepseek-ai/dsh-subagent-claude-code
* plus the matching dsh-tool-subagent row) instead of calling the provider
* seam directly.
*
* The command's own result text is rendered in the UI only and never enters the
* model request (per the dsh-commands contract); the only model-visible input
* is the followup message we inject here.
* @module dsh-subagent-commands
*/

import { createUserMessage } from "@deepseek-ai/dsh-llm";

/** Cordis plugin identity. */
const name = "subagent-commands";
/** Services the plugin needs on `ctx`. */
const inject = ["commands"];

/** Default tool names this bundle targets. */
const TARGETS = {
	codex: { toolName: "subagent_codex", displayName: "Codex" },
	claudecode: { toolName: "subagent_claude", displayName: "Claude Code" },
};

/**
* Queue one task as the agent's next user turn, telling it to run the target
* subagent tool. `agent.followup` appends to the next-turn FIFO and wakes the
* driver, so `/codex <task>` behaves like typing a fresh directive.
* @param agent - the receiving Agent from the command invocation.
* @param toolName - the model-facing subagent tool name to call.
* @param displayName - human label for the subagent.
* @param task - the self-contained task text.
*/
function delegate(agent, toolName, displayName, task) {
	agent.followup(createUserMessage({
		content: [{
			type: "text",
			text: `请使用 \`${toolName}\` 工具处理下面的任务，并把该子代理的最终答案作为你的回复。\n\n${task}`,
		}],
		source: {
			kind: "plugin",
			plugin: "subagent-commands",
			form: "notice",
			summary: `Delegated to ${displayName} subagent`,
		},
	}));
}

/** Build one command registration for a target. */
function registerCommand(ctx, kind) {
	const { toolName, displayName } = TARGETS[kind];
	ctx.commands.register({
		name: kind,
		description: `delegate a task to the ${displayName} subagent`,
		input: { hint: "<task>" },
		handler: ({ agent, rawInput }) => {
			const task = (rawInput ?? "").trim();
			if (task === "") {
				return {
					kind: "error",
					text: `Usage: /${kind} <task> — pass a self-contained task for ${displayName}.`,
				};
			}
			delegate(agent, toolName, displayName, task);
			return {
				kind: "success",
				text: `已把任务交给 ${displayName} 子代理处理，结果稍后返回。`,
			};
		},
	});
}

/** Register both commands for every composed command adapter. */
function apply(ctx) {
	registerCommand(ctx, "codex");
	registerCommand(ctx, "claudecode");
}

export { apply, inject, name };
