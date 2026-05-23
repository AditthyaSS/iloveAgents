# MCP Integration Testing Guide

This guide provides step-by-step instructions to test the MCP integrations end-to-end.

## Testing Checklist

- [ ] Phase 1: Foundation (mcpRegistry, mcpAdapter, MCPStepCard) ✅
- [ ] Phase 2: Integration (WorkflowBuilder, WorkflowRunner) ✅
- [ ] Phase 3a: GitHub Integration (this document)
- [ ] Phase 3b: Slack Integration
- [ ] Phase 3c: Notion Integration

---

## Phase 3a: GitHub Integration Testing

### Prerequisites

1. **GitHub Account** with at least one test repository
2. **GitHub Personal Access Token** (PAT)
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scope: `repo` (full control)
   - Copy the token and save it safely

3. **Test Repository** (can be a fresh one)
   - Create: https://github.com/new
   - Name: `test-mcp-integration` or similar
   - Make it public or private (your choice)
   - Clone locally for reference

### Test 1: Connection Validation

**Goal:** Verify GitHub connection works

**Steps:**

1. Open iloveAgents → Build Workflow
2. Don't add an agent yet, just set up MCP
3. Click "Add MCP Step (GitHub, Slack, etc.)"
4. **Select Server:** GitHub
5. **Enter Token:**
   - Paste your GitHub PAT
   - Don't include `ghp_` part if copied with it
   - Should be just the token string
6. Click **"Test Connection"**

**Expected Result:**
- ✅ Green checkmark appears
- ✅ Message: "Connected!"
- ✅ Can proceed to next steps

**If it fails:**
- ❌ Red X appears
- ❌ Message: "Connection failed"
- Check:
  - Token is pasted correctly (no extra spaces)
  - Token hasn't expired
  - Token has `repo` scope
  - Try regenerating token

---

### Test 2: Create Issue (No Agent)

**Goal:** Test GitHub issue creation with manual input

**Steps:**

1. Continue from Test 1
2. **Select Tool:** Create Issue
3. **Configure Parameters:**
   - **Owner:** Your GitHub username
   - **Repo:** Your test repo name
   - **Title:** `Test Issue from MCP`
   - **Body:** `This is a test of the MCP integration`
   - **Labels:** (leave empty)
   - **Assignees:** (leave empty)
4. Click **"Save Workflow"** (not "Run Without Saving")
   - Title: "GitHub MCP Test"
5. The workflow saves successfully

**Expected Result:**
- ✅ Workflow created
- ✅ Can see it in Workflow Library

---

### Test 3: Run the Workflow

**Goal:** Execute the GitHub MCP step

**Steps:**

1. Go to Workflow Library
2. Find "GitHub MCP Test"
3. Click to view details
4. Click "Run Workflow"
5. In the input field, enter anything (it's ignored for manual params)
6. Select your LLM provider and enter API key (even though agent step doesn't exist)
7. Click "Run Workflow"

**Expected Result:**
- ✅ MCP step shows "Running..."
- ✅ After completion: "Success"
- ✅ Can see the output (success: true, etc.)
- ✅ Check your GitHub repo - new issue created!

**In GitHub:**
- New issue appears in your repository
- Title: "Test Issue from MCP"
- Body: "This is a test of the MCP integration"

---

### Test 4: Create Issue with Agent Output (Auto-Fill)

**Goal:** Test parameter auto-fill from agent

**Steps:**

1. Create new workflow: "Bug Analysis to GitHub"
2. **Step 1 - Add Agent:**
   - Click "Add first agent"
   - Select "Code Reviewer" or "Bug Analyzer"
3. **Step 2 - Add MCP:**
   - Click "Add MCP Step"
   - Select GitHub
   - Enter your token (already tested, should work)
   - Select "Create Issue" tool
4. **Configure Parameters for Auto-Fill:**
   - **Owner:** your-username
   - **Repo:** test repo
   - **Title:** Click "Use Previous Output" ← Auto-fill from agent
   - **Body:** Click "Use Previous Output" ← Auto-fill from agent
   - **Labels:** `auto-generated` (manual)
5. Save workflow: "Code Analysis to GitHub"

---

### Test 5: Run Auto-Fill Workflow

**Steps:**

1. Go to Workflow Library
2. Find "Code Analysis to GitHub"
3. Click "Run"
4. **In input field, enter code to analyze:**
   ```javascript
   function getUserData(id) {
     const url = "https://api.example.com/users/" + id
     const response = fetch(url)
     return response
   }
   ```
5. Select LLM provider and API key
6. Click "Run Workflow"

**Expected Flow:**

1. Step 1 (Agent): Code Reviewer analyzes the code
   - Status: Running → Done
   - Output: Code review feedback
2. Step 2 (MCP): GitHub Create Issue
   - Status: Waiting → Running → Done
   - Title auto-filled from review
   - Body auto-filled from review
   - Output: success: true, issue_url: "...", issue_number: 123

**In GitHub:**
- New issue created automatically
- Title: Something from the code review
- Body: Full code review feedback from agent

---

### Test 6: Error Handling - Invalid Credentials

**Goal:** Test error handling for bad credentials

**Steps:**

1. Create new workflow
2. Add "Code Review" agent
3. Add GitHub MCP step
4. **Enter a fake token:** `ghp_invalid12345token`
5. Click "Test Connection"

**Expected Result:**
- ❌ Red X appears
- ❌ Message: "Connection failed" or similar
- Cannot proceed with fake token

---

### Test 7: Error Handling - Missing Required Params

**Goal:** Test validation of required parameters

**Steps:**

1. Create workflow with GitHub MCP step
2. **Leave some required fields empty:**
   - Owner: (empty)
   - Repo: test-repo
   - Title: (empty)
   - Body: Some text
3. Try to run

**Expected Result:**
- ❌ Error message before execution
- Message: "Missing required parameter: ..." or similar
- Workflow doesn't run

---

### Test 8: Multiple Issues in Sequence

**Goal:** Test creating multiple issues from one workflow

**Steps:**

1. Create workflow: "Multiple Bug Reports"
2. Add agent that can output multiple sections
3. Add GitHub MCP step to create issue
4. Run with input that generates multiple bug items
5. Run again with different input

**Expected Result:**
- ✅ First issue created
- ✅ Second issue created
- Both appear in GitHub repo with different content

---

## Phase 3b: Slack Integration Testing

### Prerequisites

1. **Slack Workspace** with admin access
2. **Slack Bot Token**
   - Go to https://api.slack.com/apps
   - Create app or select existing
   - Go to OAuth & Permissions
   - Add scope: `chat:write`
   - Install to workspace
   - Copy "Bot User OAuth Token" (starts with `xoxb-`)

### Test 1: Connection to Slack

**Steps:**

1. Create workflow
2. Add MCP step
3. **Select Server:** Slack
4. **Enter Bot Token:** Paste `xoxb-...` token
5. Click "Test Connection"

**Expected Result:**
- ✅ Green checkmark
- ✅ Message: "Connected!"

---

### Test 2: Send Message to Channel

**Steps:**

1. Continue from Test 1
2. **Select Tool:** Send Message
3. **Configure:**
   - **Channel:** `#general` or `#test-channel`
   - **Message:** `Hello from MCP integration!`
4. Save and run workflow
5. Enter any input and run

**Expected Result:**
- ✅ MCP step completes
- ✅ Bot sends message to Slack channel
- ✅ Message appears in channel timeline

---

### Test 3: Send to DM

**Steps:**

1. Setup like Test 2
2. **Channel:** `@your-username` (your own DM)
3. Run workflow

**Expected Result:**
- ✅ Bot sends DM to you
- ✅ Message appears in DM thread

---

### Test 4: Agent Output to Slack

**Steps:**

1. Create workflow with:
   - Agent: Code Reviewer
   - MCP: Slack Send Message
2. **Configure auto-fill:**
   - Message: "Use Previous Output"
3. Run with code sample

**Expected Result:**
- ✅ Agent reviews code
- ✅ Slack receives review as message
- ✅ Readable formatting in Slack

---

## Phase 3c: Notion Integration Testing

### Prerequisites

1. **Notion Account** with workspace
2. **Notion Database**
   - Create new database with properties: Title, Status, Date
3. **Notion Integration Token**
   - Go to https://www.notion.com/my-integrations
   - Create new integration
   - Copy "Internal Integration Token"
4. **Share Database with Integration**
   - Open database in Notion
   - Click "..." → Share
   - Add your integration

### Test 1: Connection to Notion

**Steps:**

1. Create workflow
2. Add MCP step → Notion
3. Enter your integration token
4. Click "Test Connection"

**Expected Result:**
- ✅ Green checkmark
- ✅ Message: "Connected!"

---

### Test 2: Create Page

**Steps:**

1. Continue from Test 1
2. **Select Tool:** Create Page
3. **Get Database ID:**
   - Open your database in Notion
   - Copy URL: `https://www.notion.so/WORKSPACE/DATABASE_ID?v=...`
   - Extract `DATABASE_ID` (long hex string)
4. **Configure:**
   - **Database ID:** Paste your ID
   - **Title:** `Test Page from MCP`
   - **Content:** `This is a test page`
5. Save and run

**Expected Result:**
- ✅ Page created in Notion database
- ✅ Can open page in Notion
- ✅ Shows title and content

---

### Test 3: Agent Output to Notion

**Steps:**

1. Create workflow with:
   - Agent: Research Agent (or similar)
   - MCP: Notion Create Page
2. **Configure auto-fill:**
   - Title: "Use Previous Output"
   - Content: "Use Previous Output"
3. Run with research topic

**Expected Result:**
- ✅ Agent researches topic
- ✅ Notion page created with research
- ✅ Can view in Notion database

---

## Performance Testing

### Test Load: Simple Workflow

**Steps:**

1. Create workflow: Agent → GitHub MCP
2. Run 5 times with different inputs
3. Time each run

**Expected Result:**
- 🟢 Each run: 10-30 seconds
- 🟢 No timeouts
- 🟢 All GitHub issues created

---

### Test Load: Complex Workflow

**Steps:**

1. Create workflow: Agent → GitHub → Slack → Notion
2. Run 3 times

**Expected Result:**
- 🟢 Each run: 30-120 seconds (depends on agent speed)
- 🟢 All steps complete
- 🟢 Issues, messages, pages all created

---

## Acceptance Testing Checklist

Use this to verify Phase 3 is complete:

### Functionality ✅
- [ ] GitHub: Can create issues from agent output
- [ ] Slack: Can send messages from agent output
- [ ] Notion: Can create pages from agent output
- [ ] Auto-fill works correctly
- [ ] Connection testing works

### Error Handling ✅
- [ ] Invalid credentials caught
- [ ] Missing parameters caught
- [ ] Network errors handled gracefully
- [ ] Workflow stops on error
- [ ] Clear error messages

### Integration ✅
- [ ] MCP steps work in Workflow Builder UI
- [ ] Steps execute in WorkflowRunner
- [ ] Output chains properly
- [ ] Backward compatible (old workflows still work)

### Documentation ✅
- [ ] MCP_README.md written
- [ ] MCP_SERVER_INTEGRATION_GUIDE.md written
- [ ] MCP_EXAMPLE_WORKFLOWS.md written
- [ ] This testing guide written

### No Regressions ✅
- [ ] Existing workflows still work
- [ ] Agent-only workflows unaffected
- [ ] UI remains responsive
- [ ] No console errors

---

## Test Results Summary

After running all tests, fill in:

**Tested by:** ________________
**Date:** ________________

| Component | Status | Notes |
|-----------|--------|-------|
| GitHub Create Issue | ✅/❌ | |
| GitHub Add Comment | ✅/❌ | |
| GitHub Update Issue | ✅/❌ | |
| Slack Send Message | ✅/❌ | |
| Slack Send Blocks | ✅/❌ | |
| Notion Create Page | ✅/❌ | |
| Notion Append Block | ✅/❌ | |
| Auto-Fill | ✅/❌ | |
| Error Handling | ✅/❌ | |
| Workflow Chaining | ✅/❌ | |

---

## Known Issues / Limitations

- Google Calendar & Gmail: OAuth flow not yet implemented (tokens defined)
- Rate limiting: No built-in rate limit handling yet
- Webhooks: Cannot trigger workflows from external events
- Scheduling: Cannot schedule workflows for later execution
- Parallel steps: All steps execute sequentially

---

## Next Steps if All Tests Pass

1. ✅ Create PR with all code
2. ✅ Request code review
3. ✅ Update main README
4. ✅ Tag release version
5. ✅ Announce feature to users
6. ✅ Plan Phase 4 enhancements

---

## Support

If tests fail:
1. Check error message carefully
2. Review relevant section in [MCP_SERVER_INTEGRATION_GUIDE.md](./MCP_SERVER_INTEGRATION_GUIDE.md)
3. Verify credentials are valid in service (GitHub/Slack/Notion)
4. Check network connectivity
5. Clear browser cache and restart dev server
6. Open issue with detailed error information
