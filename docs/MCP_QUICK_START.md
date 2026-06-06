# MCP Quick Start Guide

Get up and running with MCP (Model Context Protocol) integrations in 5 minutes!

---

## What is MCP?

MCP lets your AI workflows perform real actions:
- 📝 Create GitHub issues
- 💬 Send Slack messages
- 📄 Create Notion pages
- 📅 Schedule calendar events

**Example:**
```
Code Review Agent → GitHub Issue with review feedback
                  → Slack message to notify team
```

---

## 30-Second Overview

1. **Build Workflow:** Mix agents + MCP actions
2. **Configure:** Enter credentials (API tokens)
3. **Auto-Fill:** Previous output feeds into next step
4. **Run:** Workflow executes both agents and actions
5. **Result:** GitHub issues/Slack messages created automatically

---

## Step 1: Get API Tokens

Choose the services you want to use:

### GitHub
1. Go: https://github.com/settings/tokens
2. Click: "Generate new token (classic)"
3. Check: `repo` scope
4. Copy: The token string

### Slack
1. Go: https://api.slack.com/apps
2. Click: "Create New App"
3. Choose: "From scratch"
4. Go: "OAuth & Permissions"
5. Add scope: `chat:write`
6. Install to workspace
7. Copy: "Bot User OAuth Token" (starts with `xoxb-`)

### Notion
1. Go: https://www.notion.com/my-integrations
2. Click: "Create new integration"
3. Copy: "Internal Integration Token"
4. In Notion: Share database with integration

---

## Step 2: Create Your First Workflow

### Simplest Example: Bug Report → GitHub

1. Go to **"Build a Workflow"**
2. Enter title: `"Bug Reports to GitHub"`
3. Click **"Add first agent"** → Select "Code Reviewer" (or similar)
4. Click **"Add MCP Step (GitHub, Slack, etc.)"**

---

## Step 3: Configure GitHub MCP Step

1. **Select Server:** GitHub
2. **Paste Token:** (from Step 1)
3. Click **"Test Connection"** ← Verify it works! ✅
4. **Select Tool:** "Create Issue"
5. **Fill in parameters:**
   - Owner: `your-username`
   - Repo: `your-repo-name`
   - Title: Click **"Use Previous Output"** ← Key feature!
   - Body: Click **"Use Previous Output"** ← Chains agent output!

---

## Step 4: Save & Run

1. Click **"Save Workflow"**
2. See it in Workflow Library
3. Click the workflow
4. Click **"Run"**
5. **Enter input:**
   ```
   When I click "Login", page freezes for 5 seconds.
   Chrome 120 + Firefox 121. Safari is fine.
   Error in console: "Memory leak detected"
   ```
6. Click **"Run Workflow"**

---

## Step 5: Watch It Work!

**What happens:**

```
Step 1: Code Reviewer (Agent)
  ⏳ Running → Analyzes your bug report → ✅ Done
  Output: Structured bug analysis

Step 2: GitHub Create Issue (MCP)
  ⏳ Running → Uses agent output for title & body → ✅ Done
  Output: https://github.com/your-repo/issues/123
```

**Check GitHub:** Your issue is there! 🎉

---

## What Just Happened?

1. **You wrote:** Bug description
2. **Agent analyzed:** Extracted key info, severity, steps
3. **GitHub received:** Issue with analysis auto-filled
4. **No copy-paste:** It all happened automatically!

---

## Try More Complex Workflows

### Pattern 1: Multi-Service
```
Agent Output
    ↓
GitHub Create Issue
    ↓
Slack Notify Team
    ↓
Notion Archive
```

### Pattern 2: Multi-Agent
```
Agent 1: Research
    ↓
Agent 2: Analyze
    ↓
MCP: Create Page
```

### Pattern 3: Chain Multiple MCP Steps
```
Agent Output
    ↓
GitHub Create Issue
    ↓
MCP: Slack Message (with issue URL)
    ↓
MCP: Notion Create Page
```

---

## Common Issues & Solutions

### "Test Connection" failed
**Problem:** Can't connect to service
**Solutions:**
- Paste token completely (no extra spaces)
- Token hasn't expired
- Token has right permissions (repo, chat:write, etc.)
- Try regenerating token in service settings

### Parameter won't auto-fill
**Problem:** "Use Previous Output" button doesn't work
**Solutions:**
- Make sure previous agent step completed
- Check previous output isn't empty
- Manually enter value as fallback (always works)

### Workflow runs but MCP step fails
**Problem:** Agent output, but MCP doesn't execute
**Solutions:**
- Check error message (shows exact problem)
- Verify all required parameters filled
- Test connection again
- Check service (GitHub/Slack) isn't down

### "Missing required parameter"
**Problem:** Workflow won't run
**Solutions:**
- Fields with red `*` are required
- Fill them in (or use auto-fill)
- Try again

---

## Understanding Parameter Types

When configuring MCP steps, you'll see different input types:

| Type | Example | Notes |
|------|---------|-------|
| **text** | Username | Single line |
| **textarea** | Issue description | Multi-line, supports markdown |
| **select** | Choose state | Dropdown menu |
| **number** | Issue ID | Numbers only |

---

## Useful Workflows to Build

### Bug Reporting
```
Input: Bug description
  → Bug Analyzer Agent
  → GitHub Create Issue (auto-fill from agent)
  → Slack Notify #bugs channel
```

### Code Review Distribution
```
Input: Code to review
  → Code Reviewer Agent
  → Slack Send Message (with review feedback)
  → Notion Archive (save for reference)
```

### Research Archival
```
Input: Research topic
  → Research Agent
  → Notion Create Page (auto-fill from research)
  → Slack Notify (link to new page)
```

---

## Pro Tips

1. **Test Connection First**
   - Always click "Test Connection" before running
   - Saves time debugging

2. **Use Auto-Fill**
   - Click "Use Previous Output" for chaining
   - Reduces manual copy-paste

3. **Start Simple**
   - Begin with 1 agent + 1 MCP step
   - Verify it works
   - Add more steps gradually

4. **Reuse Workflows**
   - Once working, run it again with different input
   - Workflow Library keeps them organized
   - Share with team

5. **Save First**
   - Use "Save Workflow" not "Run Without Saving"
   - Can re-run anytime
   - Can share with team

---

## Reference

For more details, see:

- 📖 [MCP Full Documentation](./MCP_README.md)
- 🏗️ [Integration Guide (for developers)](./MCP_SERVER_INTEGRATION_GUIDE.md)
- 💡 [Example Workflows](./MCP_EXAMPLE_WORKFLOWS.md)
- ✅ [Testing Guide](./MCP_TESTING_GUIDE.md)

---

## Supported Services

### Ready to Use ✅
- **GitHub** - Create issues, comments, updates
- **Slack** - Send messages, formatted content
- **Notion** - Create pages, add content

### Coming Soon 🚀
- **Google Calendar** - Schedule events
- **Gmail** - Send emails
- **Discord** - Send messages
- **Linear** - Create issues
- **Jira** - Create tickets
- *...many more!*

---

## Next: Share Your Workflow

Once you've built something useful:

1. Save the workflow
2. Go to Workflow Library
3. Share link with team
4. They can run it too!

---

## Questions?

Check:
1. Troubleshooting in [MCP_README.md](./MCP_README.md)
2. Examples in [MCP_EXAMPLE_WORKFLOWS.md](./MCP_EXAMPLE_WORKFLOWS.md)
3. Testing details in [MCP_TESTING_GUIDE.md](./MCP_TESTING_GUIDE.md)

Happy automating! 🚀
