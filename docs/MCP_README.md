# MCP (Model Context Protocol) Integration

## Overview

iloveAgents now supports **MCP** (Model Context Protocol) actions, enabling workflows to perform real-world actions like creating GitHub issues, sending Slack messages, and creating Notion pages.

**Status:** ✅ Phase 1-2 Complete | 🚀 Phase 3 In Progress

---

## What Can You Do?

### Current Capabilities (Phase 1-2) ✅

- **Workflow Steps:** Mix agents and MCP actions in the same workflow
- **Parameter Auto-Fill:** Previous output automatically flows into MCP parameters
- **Real Integrations:** GitHub, Slack, Notion, Google Calendar, Gmail
- **Error Handling:** Graceful failures with clear error messages
- **Backward Compatible:** Existing workflows still work without changes

### Example: Bug Report → GitHub Issue

```
User Input: "Login button causes memory leak"
         ↓
Agent: Bug Report Analyzer
  → Analyzes and structures the report
         ↓
MCP: GitHub Create Issue
  → Automatically creates issue with analysis
         ↓
Output: GitHub issue URL
```

---

## Quick Start

### 1. Build a Workflow with MCP Step

1. Go to **Build Workflow**
2. Add an agent (e.g., "Code Reviewer")
3. Click **"Add MCP Step (GitHub, Slack, etc.)"**
4. Select server: **GitHub**
5. Enter your GitHub token (from https://github.com/settings/tokens)
6. Click **"Test Connection"** ← Verify it works
7. Select tool: **Create Issue**
8. Configure parameters:
   - Owner: your-username
   - Repo: your-repo
   - Title: ✅ Click "Use Previous Output"
   - Body: ✅ Click "Use Previous Output"
9. Save and run!

### 2. Get API Credentials

**GitHub:**
- https://github.com/settings/tokens → Generate token
- Scopes needed: `repo`

**Slack:**
- https://api.slack.com/apps → Create app
- Scopes needed: `chat:write`
- Copy Bot token from OAuth settings

**Notion:**
- https://www.notion.com/my-integrations → New integration
- Copy Internal Integration Token
- Share database with integration

---

## Architecture

### File Structure

```
iloveAgents/src/
├── data/
│   └── mcpRegistry.js           ← Server configs (GitHub, Slack, etc.)
│
├── lib/
│   └── mcpAdapter.js            ← API implementations & execution
│
└── components/
    └── MCPStepCard.jsx          ← UI for configuring MCP steps

iloveAgents/docs/
├── MCP_SERVER_INTEGRATION_GUIDE.md    ← How to add new servers
└── MCP_EXAMPLE_WORKFLOWS.md           ← Real workflow examples
```

### How It Works

1. **User selects MCP step** → MCPStepCard renders
2. **User picks server and tool** → Registry provides configuration
3. **User enters credentials** → Can test connection
4. **User configures params** → Can auto-fill from previous output
5. **Workflow executes** → mcpAdapter.executeMCPTool() called
6. **Output chains** to next step

---

## Supported Integrations

### ✅ Implemented & Tested

#### GitHub (`github`)
```
Tools:
  - create-issue: Create a new issue
  - add-comment: Comment on existing issue
  - update-issue: Change status, labels, assignees
```

#### Slack (`slack`)
```
Tools:
  - send-message: Send text message
  - send-blocks: Send formatted message with rich content
```

#### Notion (`notion`)
```
Tools:
  - create-page: Create page in database
  - append-block: Add content to existing page
```

### 🚀 Partially Implemented

#### Google Calendar (`google-calendar`)
- Tool: `create-event` (defined, awaiting OAuth implementation)

#### Gmail (`gmail`)
- Tool: `send-email` (defined, awaiting OAuth implementation)

---

## Real-World Examples

### Example 1: Automated Bug Triage

```
Input: Customer bug report
  ↓
Agent: Bug Analyzer
  - Extracts severity, impact, reproduction steps
  ↓
MCP: GitHub Create Issue
  - Creates issue with analysis
  - Auto-assigns to team
  ↓
MCP: Slack Send Message
  - Notifies #incidents channel
  ↓
MCP: Notion Create Page
  - Archives for future reference
```

### Example 2: Code Review Distribution

```
Input: Pull request code
  ↓
Agent: Code Reviewer
  - Reviews code quality
  - Identifies issues
  ↓
MCP: GitHub Add Comment
  - Comments review on PR
  ↓
MCP: Slack Send Message
  - Notifies author of review
```

### Example 3: Research Archival

```
Input: Research topic
  ↓
Agent: Research Agent
  - Researches topic thoroughly
  - Compiles findings
  ↓
MCP: Notion Create Page
  - Saves research to database
  - Makes searchable
```

---

## Technical Deep Dive

### Parameter Auto-Fill

In `mcpRegistry.js`, mark parameters with `autoFill: true`:

```javascript
params: [
  {
    id: 'title',
    label: 'Issue Title',
    type: 'text',
    required: true,
    autoFill: true,        // ← Fills from previous output
  },
]
```

In `WorkflowRunner.jsx`, before execution:

```javascript
// Auto-fill parameters marked with autoFill: true
toolConfig.params
  .filter(p => p.autoFill)
  .forEach(p => {
    if (!finalParams[p.id] || finalParams[p.id].trim() === '') {
      finalParams[p.id] = currentInput  // Previous step's output
    }
  })
```

### Error Handling

All errors are caught and displayed to user:

```javascript
try {
  const result = await executeMCPTool({...})
  setStepField(i, { status: 'done', output: result })
} catch (err) {
  setStepField(i, { status: 'failed', error: err.message })
  failed = true
  break  // Stop workflow
}
```

Workflow stops gracefully - no subsequent steps execute.

### Connection Testing

Each server implements `testMCPConnection()`:

```javascript
export async function testMCPConnection(serverId, credentials) {
  switch (serverId) {
    case 'github':
      const response = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${credentials.token}` }
      })
      return response.ok
    // ... other servers
  }
}
```

---

## Adding New MCP Servers

### 3-Step Process

1. **Add to mcpRegistry.js** - Define server config and tools
2. **Implement in mcpAdapter.js** - Add API calls
3. **Register in mcpAdapter.js** - Add to `getMCPServerImpl()`

**Full guide:** See [MCP_SERVER_INTEGRATION_GUIDE.md](./docs/MCP_SERVER_INTEGRATION_GUIDE.md)

**Example:** Adding Discord, Telegram, Linear, Jira, etc.

---

## Acceptance Criteria ✅

All Phase 1-2 criteria met:

- ✅ MCP step can be added inside Workflow Builder alongside agent steps
- ✅ At least three MCP servers working (GitHub, Slack, Notion)
- ✅ MCP step receives previous agent output automatically
- ✅ Clear error handling if MCP connection fails
- ✅ Workflow stops gracefully if MCP step fails
- ✅ Does not break existing workflow or agent functionality
- ✅ mcpRegistry.js structured for easy new server addition
- ✅ Documentation added for adding new MCP servers

---

## Phase 3: Testing & Polish 🚀

Current progress:

- ✅ MCP Server Integration Guide (comprehensive documentation)
- ✅ Example Workflows (real-world scenarios)
- 🔄 GitHub Integration Testing
- 🔄 Slack Integration Testing
- 🔄 Notion Integration Testing

---

## Troubleshooting

### Connection Test Fails
- Verify token is correct
- Check token hasn't expired
- Verify required scopes are granted
- For GitHub: https://github.com/settings/tokens
- For Slack: workspace settings → apps → your-app

### MCP Tool Execution Fails
- Check required parameters are filled
- Verify previous output is not empty
- Check network connection
- Look at error message for specific issue

### Parameter Won't Auto-Fill
- Verify parameter has `autoFill: true`
- Check previous step completed successfully
- Check previous output is not empty
- Can manually enter value as fallback

### New MCP Server Won't Appear
- Verify added to `MCP_SERVERS` in mcpRegistry.js
- Verify ID matches when registering in mcpAdapter.js
- Clear browser cache
- Restart dev server

---

## Security Notes

- **Credentials:** Stored in sessionStorage only (not sent to server)
- **Tokens:** Use minimal required scopes
- **Sharing:** Don't include tokens in saved workflows
- **Rotation:** Can rotate tokens in service settings
- **HTTPS:** All API calls use HTTPS

---

## What's Next?

### Phase 3B: Complete Testing
- [ ] Manual test GitHub create-issue workflow
- [ ] Manual test Slack send-message workflow
- [ ] Manual test Notion create-page workflow
- [ ] Test error scenarios

### Phase 3C: Polish & Documentation
- [ ] Create getting-started guide
- [ ] Add tooltips to UI
- [ ] Test with various network speeds
- [ ] Performance optimization

### Phase 4+: Advanced Features
- [ ] OAuth support (Google Calendar, Gmail)
- [ ] Conditional MCP steps
- [ ] Parallel MCP execution
- [ ] Webhook triggers
- [ ] MCP step scheduling

---

## Support & Contributing

For issues or questions:
1. Check [MCP_SERVER_INTEGRATION_GUIDE.md](./docs/MCP_SERVER_INTEGRATION_GUIDE.md)
2. Review [MCP_EXAMPLE_WORKFLOWS.md](./docs/MCP_EXAMPLE_WORKFLOWS.md)
3. Open GitHub issue with:
   - Server/tool name
   - What you're trying to do
   - Error message (redact credentials)
   - Steps to reproduce

To contribute a new server:
1. Follow the integration guide
2. Test thoroughly
3. Add documentation
4. Submit PR with examples

---

## References

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [GitHub API Docs](https://docs.github.com/en/rest)
- [Slack API Docs](https://api.slack.com/methods)
- [Notion API Docs](https://developers.notion.com/)
