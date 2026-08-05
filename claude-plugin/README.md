# FastYoke Claude Plugin

FastYoke is an application platform for building workflow automation and data management systems. The FastYoke Claude plugin brings the power of FastYoke to Claude Code, enabling you to scaffold new apps, run them locally, and verify workflow transitions directly from your editor.

## Install

This plugin is distributed from the FastYoke monorepo as a Claude Code plugin marketplace. Add the marketplace, then install the plugin:

```
/plugin marketplace add versacomp/fastyoke2
/plugin install fastyoke@fastyoke
```

(If you have the repo checked out locally instead, point `marketplace add` at the local path, e.g. `/plugin marketplace add /path/to/fastyoke2`.)

Then run `/fy-new-app` to get started.

> **Planned convenience:** a future `fastyoke claude-setup` CLI subcommand will do the marketplace-add + install steps above for you in one command. It does not exist yet — use the `/plugin` flow above until it ships.

## Usage

Create and run a new FastYoke app in seconds:

1. Run `/fy-new-app` to scaffold a new application with a default workflow schema.
2. Claude will generate the initial FSM (Finite State Machine) structure, sample data, and a working dashboard.
3. Test your first workflow transition locally to verify the state machine works as expected.

The plugin integrates with Claude's multi-step reasoning to help you design, build, and iterate on your FastYoke applications without leaving your editor.
