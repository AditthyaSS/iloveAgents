# MCP Integration Example Workflows

This document provides real-world example workflows combining agents with MCP actions. These demonstrate the full power of iloveAgents with automated integrations.

## Table of Contents
1. [Setup Requirements](#setup-requirements)
2. [Workflow 1: Bug Report → GitHub Issue](#workflow-1-bug-report--github-issue)
3. [Workflow 2: Code Analysis → Slack Notification](#workflow-2-code-analysis--slack-notification)
4. [Workflow 3: Research → Notion Page](#workflow-3-research--notion-page)
5. [Workflow 4: Complex: Multi-Step + MCP Chain](#workflow-4-complex-multi-step--mcp-chain)

---

## Setup Requirements

### Before You Start

You'll need API credentials for the services you want to use:

**GitHub:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (or `public_repo` for public repos only)
4. Copy the token

**Slack:**
1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Give it a name and select your workspace
4. Go to "OAuth & Permissions"
5. Add scope: `chat:write`
6. Install app to workspace
7. Copy "Bot User OAuth Token" (starts with `xoxb-`)

**Notion:**
1. Go to https://www.notion.com/my-integrations
2. Click "Create new integration"
3. Give it a name and select capabilities
4. Copy the "Internal Integration Token"
5. Share your database with the integration

---

## Workflow 1: Bug Report → GitHub Issue

**Scenario:** Automatically turn bug descriptions into GitHub issues

### Workflow Setup

**Steps:**
1. **Agent: Bug Report Analyzer** (analyzes bug report text)
2. **MCP: GitHub Create Issue** (creates issue from analysis)

### Step-by-Step Instructions

#### 1. Create the Workflow

1. Go to iloveAgents → "Build a Workflow"
2. Set title: "Bug Reporter"
3. Set description: "Turn bug reports into GitHub issues"

#### 2. Add Agent Step

1. Click "Add first agent"
2. Search for "Bug Report Analyzer" or similar code review agent
3. The agent will analyze the bug and provide structured output

#### 3. Add MCP Step

1. Click "Add MCP Step (GitHub, Slack, etc.)"
2. **Select Server:** GitHub
3. **Enter GitHub Token:**
   - Get from https://github.com/settings/tokens
   - Needs `repo` scope
4. **Select Tool:** Create Issue
5. **Configure Parameters:**
   - **Owner:** Your GitHub username
   - **Repo:** Repository name
   - **Issue Title:** Click "Use Previous Output" ← Auto-fills from agent analysis
   - **Issue Body:** Click "Use Previous Output" ← Auto-fills from agent analysis
   - **Labels:** (optional) bug, reported
   - **Assignees:** (optional) Your GitHub username

#### 4. Save & Run

1. Click "Save Workflow" or "Run Without Saving"
2. Enter bug report in input field:
   ```
   When I click the login button, the page freezes for 5 seconds.
   This happens on Chrome 120 and Firefox 121. Not in Safari.
   Started after the latest deploy. Error in console: "Memory leak detected"
   ```
3. Click "Run Workflow"
4. Watch as agent analyzes bug, then GitHub issue is created
5. Check your GitHub repo for the new issue!

### Expected Output

The agent might output something like:
```
## Bug Analysis

**Severity:** High  
**Priority:** P1

### Summary
Critical browser freezing on login button click

### Environment
- Chrome 120, Firefox 121 (Not Safari)
- Post-latest-deploy regression

### Technical Details
Memory leak detected in browser console

### Reproduction
1. Navigate to login page
2. Click login button
3. Observe 5-second freeze

### Root Cause
Likely memory leak introduced in latest deployment
```

Then the GitHub issue is created with this content!

---

## Workflow 2: Code Analysis → Slack Notification

**Scenario:** Analyze code and automatically notify team on Slack

### Workflow Setup

**Steps:**
1. **Agent: Code Reviewer** (reviews code quality)
2. **MCP: Slack Send Message** (notifies team)

### Step-by-Step Instructions

#### 1. Create Workflow

1. Title: "Code Review Notifier"
2. Description: "Analyze code and notify team on Slack"

#### 2. Add Code Review Agent

1. Click "Add first agent"
2. Select "Code Reviewer" agent
3. This agent will analyze code and provide feedback

#### 3. Add Slack MCP Step

1. Click "Add MCP Step"
2. **Select Server:** Slack
3. **Enter Bot Token:**
   - Get from https://api.slack.com/apps
   - Create app with `chat:write` scope
4. **Select Tool:** Send Message
5. **Configure Parameters:**
   - **Channel:** #engineering or @your-name
   - **Message:** Click "Use Previous Output" ← Code review feedback

#### 4. Test & Deploy

1. Save workflow
2. Run with sample code:
   ```javascript
   function processUser(user) {
     let data = user.data;
     data.processed = true;
     return data;
   }
   ```
3. Agent reviews code, outputs feedback
4. Slack receives the review as message!

### Advanced: Formatted Slack Messages

For richer formatting, use "Send Formatted Message" tool:

```json
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Code Review Results*\n_from iloveAgents_"
      }
    },
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Previous output goes here"
      }
    }
  ]
}
```

---

## Workflow 3: Research → Notion Page

**Scenario:** Perform research and automatically save to Notion

### Workflow Setup

**Steps:**
1. **Agent: Research Agent** (researches topic)
2. **MCP: Notion Create Page** (saves to database)

### Step-by-Step Instructions

#### 1. Create Workflow

1. Title: "Research Archiver"
2. Description: "Research topics and save to Notion"

#### 2. Add Research Agent

1. Click "Add first agent"
2. Select "Research Agent" or "Web Researcher"
3. This agent will research your topic

#### 3. Add Notion MCP Step

1. Click "Add MCP Step"
2. **Select Server:** Notion
3. **Enter Notion Token:**
   - From https://www.notion.com/my-integrations
   - Create integration, copy token
4. **Select Tool:** Create Page
5. **Configure Parameters:**
   - **Database ID:** Your Notion database ID (see below)
   - **Page Title:** Click "Use Previous Output" ← Auto-fill
   - **Content:** Click "Use Previous Output" ← Auto-fill research

#### 4. Get Your Notion Database ID

1. Open database in Notion
2. Copy URL: `https://www.notion.so/workspace/DATABASE_ID?v=`
3. Extract the long string - that's your Database ID
4. Share database with your integration

#### 5. Run Research

1. Save and run workflow
2. Input: "Latest AI developments in 2026"
3. Agent researches, outputs findings
4. Notion page automatically created with research!

---

## Workflow 4: Complex Multi-Step + MCP Chain

**Scenario:** Content → Analysis → GitHub Issue + Slack Notification + Notion Archive

### Workflow Overview

```
Input
  ↓
Agent 1: Content Analyzer
  ↓ (output)
Agent 2: Sentiment Analysis
  ↓ (output)
MCP 1: GitHub Create Issue (from sentiment data)
  ↓ (issue URL)
MCP 2: Slack Send Message (notify team)
  ↓ (done)
MCP 3: Notion Create Page (archive the content)
  ↓ (done)
Workflow Complete
```

### Setup This Workflow

#### 1. Title & Description
- Title: "Content Analysis + Distribution"
- Description: "Analyze content and distribute to GitHub, Slack, Notion"

#### 2. Step 1: Content Analyzer Agent
- Analyzes content quality
- Outputs: quality metrics, recommendations

#### 3. Step 2: Sentiment Analysis Agent
- Takes analyzer's output
- Outputs: sentiment score, topic tags

#### 4. Step 3: GitHub Create Issue
- **Title Parameter:** `auto-fill` (from sentiment analysis)
- **Body Parameter:** `auto-fill` (recommendations)
- **Labels Parameter:** `sentiment,analysis` + auto-filled topic
- Creates issue with analysis results

#### 5. Step 4: Slack Message
- **Channel:** #content-team
- **Message:** `auto-fill` (summary of analysis)
- Notifies team with findings

#### 6. Step 5: Notion Create Page
- **Database:** Content Archive DB
- **Title:** `auto-fill` (original content)
- **Content:** `auto-fill` (full analysis)
- Archives for future reference

### Running the Complex Workflow

**Input:**
```
Title: "New Product Launch Strategy"
Content: "Our new AI product addresses the gap in automated 
code review. Target market is startups. Launch date: Q2 2026."
```

**Flow:**
1. Content Analyzer evaluates product description
2. Sentiment Analyzer determines market reception potential
3. GitHub Issue created with recommendations
4. Slack notifies #content-team with summary
5. Notion page saved with full analysis
6. All outputs linked together

---

## Tips & Best Practices

### Auto-Fill Strategy

The power of MCP comes from chaining outputs. Key strategies:

**1. Start with Detailed Agent Output**
- Use agents that output structured data
- Code Reviewer outputs: severity, line, recommendation
- Bug Analyzer outputs: type, impact, reproduction

**2. Use Auto-Fill for Key Parameters**
- Titles/headlines: Agent output → Issue title
- Descriptions: Agent reasoning → Detailed content
- Tags: Agent classification → Labels/categories

**3. Manual Override When Needed**
- Don't mark every param as auto-fill
- Allow users to customize sensitive fields
- Leave room for human decision-making

### Error Handling

If a step fails:
- **Agent fails:** Workflow stops with error message
- **MCP fails:** Workflow stops, shows error detail
- **Credentials invalid:** Fails at "Test Connection" stage
- **Required param missing:** Shows validation error before running

Always test with "Test Connection" button before running!

### Performance

- Simple workflows (2-3 steps): 10-30 seconds
- Complex workflows (5+ steps): 30-120 seconds
- Depends on agent model and MCP API response times
- Can configure agent timeouts in settings (future feature)

### Security

- Credentials are stored in `sessionStorage` only (not sent to server)
- Never share your tokens in saved workflows
- GitHub tokens can be rotated in settings
- Slack tokens can be revoked in workspace apps
- Always use minimal required scopes

---

## Troubleshooting Workflows

### "MCP step failed: Missing required credential"
- Click "Test Connection" on MCP step
- Re-enter credentials
- Verify token hasn't expired
- Check scopes are correct

### "Previous output didn't auto-fill"
- Check parameter has `autoFill: true` setting
- Verify previous step completed successfully
- Check output isn't empty
- Manual entry is fallback

### "GitHub issue created but content is wrong"
- The agent might need better instructions
- Edit agent system prompt for clarity
- Test agent separately first
- Run workflow again with different input

### "Slack message didn't send"
- Verify bot is invited to channel
- Check channel name format (#channel-name)
- Test connection with simple message first
- Check Slack app permissions in workspace

---

## Next: Create Your Own Workflow

1. Identify your use case
2. Find suitable agents for analysis
3. Pick MCP actions for automation
4. Map outputs to inputs
5. Test thoroughly before deployment
6. Share your workflow with team!

See [MCP_SERVER_INTEGRATION_GUIDE.md](./MCP_SERVER_INTEGRATION_GUIDE.md) for technical details on building new integrations.
