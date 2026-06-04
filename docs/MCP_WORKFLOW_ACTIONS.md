# MCP workflow actions

Workflow Builder supports lightweight MCP-style action steps alongside normal agent steps. An MCP step receives the previous step output and returns text that can feed the next step.

## Current action

| Server | Action | Behavior |
| --- | --- | --- |
| GitHub | Create issue | Builds a GitHub issue payload from the previous step output. In live mode, it can call the GitHub Issues API when a token is supplied. |

The default GitHub action is safe for demos: it prepares a payload and does not call GitHub unless `mode: "live"` and a token are provided in the step config.

## Add a new MCP action

1. Add a server/tool entry in `src/data/mcpRegistry.js`.
2. Add the action implementation in `src/lib/mcpAdapter.js`.
3. Keep tool fields explicit and validated. Required fields should be marked with `required: true`.
4. Return a clear text result because workflow output is passed to the next step.
5. Throw a short error when an action cannot run. The workflow runner stops gracefully and shows the failed step.

Example registry shape:

```js
{
  id: 'notion',
  label: 'Notion',
  description: 'Create pages from workflow output.',
  tools: [
    {
      id: 'create_page',
      label: 'Create page',
      description: 'Turns the previous output into a Notion page.',
      fields: [
        { id: 'parentId', label: 'Parent page/database ID', required: true },
      ],
    },
  ],
}
```

## Step IDs

MCP steps are stored as string IDs such as:

```text
mcp:github:create_issue:%7B%22repo%22%3A%22owner%2Frepo%22%7D
```

That keeps existing workflow storage compatible with normal agent IDs while preserving each action's config.
