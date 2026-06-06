# MCP Server Integration Guide

This guide explains how to add new MCP (Model Context Protocol) servers to iloveAgents, and provides detailed documentation of the currently integrated servers.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Currently Integrated Servers](#currently-integrated-servers)
3. [How to Add a New MCP Server](#how-to-add-a-new-mcp-server)
4. [Server Implementation Examples](#server-implementation-examples)
5. [Testing Your Integration](#testing-your-integration)

---

## Architecture Overview

The MCP system is built on three core files:

### 1. **mcpRegistry.js** - Server Configuration
Defines all supported MCP servers and their tools. Each server specifies:
- Server ID, name, description, icon, category
- Authentication type (token, oauth)
- Required authentication fields
- List of available tools with their parameters

### 2. **mcpAdapter.js** - Implementation & Execution
Implements the actual API calls for each server. Contains:
- Server-specific implementations (GitHubMCP, SlackMCP, NotionMCP, etc.)
- `executeMCPTool()` - Main function to run any MCP tool
- `testMCPConnection()` - Verify authentication credentials
- Error handling and response parsing

### 3. **MCPStepCard.jsx** - UI Component
Provides the user interface for:
- Selecting MCP servers
- Managing credentials
- Configuring tool parameters
- Testing connections

---

## Currently Integrated Servers

### GitHub
**Server ID:** `github`
**Auth Type:** Token (Personal Access Token)
**Base URL:** `https://api.github.com`

**Tools:**
- `create-issue`: Create a new GitHub issue
- `add-comment`: Add a comment to an existing issue/PR
- `update-issue`: Update issue status, labels, or assignees

**Example Use Case:**
```
Bug Report Generator → GitHub Create Issue
  - Input: Bug description from agent
  - Output: Issue URL
```

**Required Token Scopes:**
- `repo` (full control of private repositories)
- `public_repo` (if only working with public repos)

---

### Slack
**Server ID:** `slack`
**Auth Type:** Token (Bot Token)
**Base URL:** `https://slack.com/api`

**Tools:**
- `send-message`: Send a plain text message to a channel
- `send-blocks`: Send a rich formatted message using Block Kit

**Example Use Case:**
```
Code Analysis → Slack Send Message
  - Input: Analysis results from agent
  - Output: Message timestamp
```

**Required Token Scopes:**
- `chat:write` (send messages)
- `channels:read` (read channel info)
- `groups:read` (read private channels)

---

### Notion
**Server ID:** `notion`
**Auth Type:** Token (Internal Integration Token)
**Base URL:** `https://api.notion.com/v1`

**Tools:**
- `create-page`: Create a new page in a Notion database
- `append-block`: Add content blocks to an existing page

**Example Use Case:**
```
Research Agent → Notion Create Page
  - Input: Research results from agent
  - Output: Page ID and URL
```

**Required Capabilities:**
- Database read access
- Page create access
- Content insert access

---

### Google Calendar *(Partially Implemented)*
**Server ID:** `google-calendar`
**Auth Type:** OAuth
**Base URL:** `https://www.googleapis.com/calendar/v3`

**Tools:**
- `create-event`: Schedule a calendar event

**Example Use Case:**
```
Interview Scheduler → Google Calendar Create Event
  - Input: Interview details from agent
  - Output: Event ID
```

---

### Gmail *(Partially Implemented)*
**Server ID:** `gmail`
**Auth Type:** OAuth
**Base URL:** `https://www.googleapis.com/gmail/v1`

**Tools:**
- `send-email`: Send an email message

**Example Use Case:**
```
Email Composer → Gmail Send Email
  - Input: Email body from agent
  - Output: Message ID
```

---

## How to Add a New MCP Server

Follow these 3 steps to integrate a new MCP server:

### Step 1: Add Server Configuration to `mcpRegistry.js`

```javascript
// In src/data/mcpRegistry.js, add to MCP_SERVERS object:

your_server: {
  id: 'your-server',                    // kebab-case ID
  name: 'Your Server',                  // Display name
  description: 'What this does',        // Short description
  icon: 'IconName',                     // Lucide icon name (see lucide-react)
  category: 'Category Name',            // For grouping in UI
  authType: 'token',                    // 'token' or 'oauth'
  requiredAuth: {
    token: {                            // Match authType
      label: 'API Key/Token',
      type: 'password',                 // 'password', 'text', etc.
      required: true,
    },
  },
  tools: [
    {
      id: 'action-name',                // kebab-case tool ID
      name: 'Human Readable Name',
      description: 'What this tool does',
      params: [
        {
          id: 'param_name',             // snake_case or camelCase
          label: 'Parameter Label',
          type: 'text',                 // 'text', 'textarea', 'select', 'number'
          required: true,
          autoFill: false,              // true to fill from previous output
          options: [],                  // for 'select' type
        },
      ],
    },
    // ... more tools
  ],
},
```

**Icon Names Available:**
All [Lucide React icons](https://lucide.dev/) are available. Common ones:
- `Github`, `Mail`, `MessageSquare`, `Calendar`, `Settings`, `Database`, `Cloud`, etc.

---

### Step 2: Implement Server Methods in `mcpAdapter.js`

Add a new server implementation object:

```javascript
// At the top of mcpAdapter.js, after other server implementations:

const YourServerMCP = {
  async action_name({ token, param1, param2 }) {
    const url = 'https://api.yourserver.com/endpoint'
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
    
    const body = {
      field1: param1,
      field2: param2,
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      
      if (!response.ok) {
        const error = await response.json()
        handleErrorResponse(response.status, error.message)
      }
      
      const data = await response.json()
      return {
        success: true,
        // ... return relevant data
        result_id: data.id,
        result_url: data.url,
      }
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Could not reach your server API. Check your internet connection.')
      }
      throw error
    }
  },
  
  // ... add more tool methods
}
```

**Method Naming Rules:**
- Tool ID: `create-issue` → Method: `create_issue`
- Tool ID: `send-message` → Method: `send_message`
- Replace hyphens with underscores

**Parameter Flow:**
All parameters (credentials + tool params) are merged and passed:
```javascript
const allParams = {
  token: credentials.token,    // from requiredAuth
  param1: params.param1,       // from tool.params
  param2: params.param2,
}
```

---

### Step 3: Register Server Implementation in `mcpAdapter.js`

Update the `getMCPServerImpl()` function:

```javascript
function getMCPServerImpl(serverId) {
  const impls = {
    'github': GitHubMCP,
    'slack': SlackMCP,
    'notion': NotionMCP,
    'your-server': YourServerMCP,    // Add this line
  }
  
  return impls[serverId] || null
}
```

---

## Server Implementation Examples

### Example 1: GitHub Create Issue

```javascript
const GitHubMCP = {
  async create_issue({ token, owner, repo, title, body, labels, assignees }) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues`
    const headers = {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    }

    const bodyObj = {
      title,
      body,
      ...(labels && { labels: labels.split(',').map(l => l.trim()) }),
      ...(assignees && { assignees: assignees.split(',').map(a => a.trim()) }),
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyObj),
      })

      if (!response.ok) {
        const error = await response.json()
        handleErrorResponse(response.status, error.message)
      }

      const data = await response.json()
      return {
        success: true,
        issue_url: data.html_url,
        issue_number: data.number,
        id: data.id,
      }
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Could not reach GitHub API. Check your internet connection.')
      }
      throw error
    }
  },
}
```

**Key Points:**
- Always check `response.ok` before parsing JSON
- Use `handleErrorResponse()` for consistent error messages
- Return object with `success: true` and relevant data
- Catch network errors separately with helpful messages

---

### Example 2: Adding Parameter Auto-Fill

To allow previous workflow output to auto-fill a parameter:

```javascript
// In mcpRegistry.js:
params: [
  {
    id: 'title',
    label: 'Issue Title',
    type: 'text',
    required: true,
    autoFill: true,              // ← Set this to true
  },
  {
    id: 'description',
    label: 'Description',
    type: 'textarea',
    required: false,
    autoFill: true,              // ← Can also be true
  },
]
```

In the UI, users will see a "Use Previous Output" button, and in WorkflowRunner, auto-fill params are populated with previous step's output.

---

## Testing Your Integration

### Manual Testing Checklist

1. **Configuration Check**
   - [ ] Server appears in "Add MCP Step" dropdown
   - [ ] Server name, icon, and description are correct
   - [ ] Tools list shows all available tools

2. **Credential Test**
   - [ ] Can enter authentication credentials
   - [ ] "Test Connection" button works
   - [ ] Shows success/failure status clearly
   - [ ] Errors are user-friendly

3. **Tool Configuration**
   - [ ] Can select tool from dropdown
   - [ ] All parameters display with correct types
   - [ ] Required parameters show asterisk (*)
   - [ ] Optional parameters are clearly marked

4. **Workflow Execution**
   - [ ] Can add MCP step to workflow
   - [ ] Step displays correct status (waiting → running → done/failed)
   - [ ] Previous output flows into auto-fill parameters
   - [ ] Tool executes and returns result
   - [ ] Errors are caught and displayed
   - [ ] Subsequent steps receive the MCP output

5. **Error Handling**
   - [ ] Invalid credentials show clear error
   - [ ] Missing required params show error
   - [ ] API errors are descriptive
   - [ ] Network errors have helpful messages

### Automated Testing Example

```javascript
// Test in browser console or add to test file:

import { executeMCPTool, testMCPConnection } from './lib/mcpAdapter'

// Test connection
const connected = await testMCPConnection('github', {
  token: 'your_token_here'
})
console.log('Connection test:', connected)

// Test tool execution
const result = await executeMCPTool({
  serverId: 'github',
  toolId: 'create-issue',
  credentials: { token: 'your_token_here' },
  params: {
    owner: 'your-username',
    repo: 'test-repo',
    title: 'Test Issue',
    body: 'This is a test',
  },
})
console.log('Result:', result)
```

---

## Best Practices

### 1. Credential Security
- Never log credentials
- Use `sessionStorage` for temporary storage (handled by useApiKey hook)
- Always use HTTPS for API calls
- Validate tokens before executing tools

### 2. Error Messages
- Be specific: "Invalid GitHub token" not just "Error"
- Include actionable suggestions: "Check your token has 'repo' scope"
- Log technical details but show friendly messages to users

### 3. Parameter Design
- Use appropriate types: `select` for limited choices, `textarea` for long text
- Mark common params with `autoFill: true` to chain outputs
- Provide helpful labels and descriptions
- Group related parameters together in UI

### 4. Rate Limiting
- Add delays between requests if needed
- Inform users: "GitHub API limits: 60 req/hour unauthenticated"
- Cache responses when possible
- Return clear error: "Rate limit exceeded. Try again in 1 hour"

### 5. Documentation
- Document required API scopes/permissions in registry comments
- Explain what credentials users need to obtain
- Link to official API documentation
- Provide example workflows

---

## Troubleshooting

### "MCP server is not implemented yet"
- Check that server is added to `getMCPServerImpl()` in mcpAdapter.js
- Verify server ID matches exactly (case-sensitive)

### Tool methods not found
- Check method name (convert hyphens to underscores)
- Verify method is defined in server implementation object
- Tool ID `send-message` should be method `send_message`

### Parameters not showing
- Check `tool.params` array is not empty
- Verify parameter IDs match your method's destructured arguments
- Ensure required params have `required: true`

### Credentials not validating
- Check `testMCPConnection()` implementation for your server
- Verify API endpoint is correct
- Test credentials manually in Postman/curl first

---

## Next Steps

1. **Test your implementation** thoroughly before deploying
2. **Create example workflows** showing your server in action
3. **Update documentation** with your server's specific setup instructions
4. **Request review** from maintainers before merging

For questions or issues, please open an issue on GitHub with:
- Server name and ID
- What you're trying to do
- Error messages (redact credentials)
- Your test steps
