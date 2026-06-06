/**
 * MCP Registry - Configuration for supported MCP (Model Context Protocol) servers
 * 
 * Each MCP server is defined with its capabilities, authentication requirements,
 * and supported tools/actions that can be performed.
 */

export const MCP_SERVERS = {
  github: {
    id: 'github',
    name: 'GitHub',
    description: 'Create issues, add comments, manage repositories',
    icon: 'Github',
    category: 'Developer Tools',
    authType: 'token', // 'token' or 'oauth'
    requiredAuth: {
      token: { label: 'GitHub Token', type: 'password', required: true },
    },
    tools: [
      {
        id: 'create-issue',
        name: 'Create Issue',
        description: 'Create a new GitHub issue from agent output',
        params: [
          { id: 'owner', label: 'Repository Owner', type: 'text', required: true },
          { id: 'repo', label: 'Repository Name', type: 'text', required: true },
          { id: 'title', label: 'Issue Title', type: 'text', required: true, autoFill: true },
          { id: 'body', label: 'Issue Body', type: 'textarea', required: true, autoFill: true },
          { id: 'labels', label: 'Labels (comma-separated)', type: 'text', required: false },
          { id: 'assignees', label: 'Assignees (comma-separated)', type: 'text', required: false },
        ],
      },
      {
        id: 'add-comment',
        name: 'Add Comment',
        description: 'Add a comment to an existing GitHub issue or PR',
        params: [
          { id: 'owner', label: 'Repository Owner', type: 'text', required: true },
          { id: 'repo', label: 'Repository Name', type: 'text', required: true },
          { id: 'issue_number', label: 'Issue/PR Number', type: 'number', required: true },
          { id: 'body', label: 'Comment', type: 'textarea', required: true, autoFill: true },
        ],
      },
      {
        id: 'update-issue',
        name: 'Update Issue',
        description: 'Update issue status, labels, or assignees',
        params: [
          { id: 'owner', label: 'Repository Owner', type: 'text', required: true },
          { id: 'repo', label: 'Repository Name', type: 'text', required: true },
          { id: 'issue_number', label: 'Issue Number', type: 'number', required: true },
          { id: 'state', label: 'State', type: 'select', options: ['open', 'closed'], required: false },
          { id: 'labels', label: 'Labels (comma-separated)', type: 'text', required: false },
        ],
      },
    ],
  },

  slack: {
    id: 'slack',
    name: 'Slack',
    description: 'Send messages to Slack channels and direct messages',
    icon: 'MessageSquare',
    category: 'Communication',
    authType: 'token',
    requiredAuth: {
      token: { label: 'Slack Bot Token', type: 'password', required: true },
    },
    tools: [
      {
        id: 'send-message',
        name: 'Send Message',
        description: 'Send a message to a Slack channel or user',
        params: [
          { id: 'channel', label: 'Channel ID or @username', type: 'text', required: true },
          { id: 'text', label: 'Message', type: 'textarea', required: true, autoFill: true },
          { id: 'thread_ts', label: 'Thread Timestamp (optional)', type: 'text', required: false },
        ],
      },
      {
        id: 'send-blocks',
        name: 'Send Formatted Message',
        description: 'Send a rich formatted message with blocks',
        params: [
          { id: 'channel', label: 'Channel ID or @username', type: 'text', required: true },
          { id: 'blocks_json', label: 'Blocks JSON', type: 'textarea', required: true },
        ],
      },
    ],
  },

  notion: {
    id: 'notion',
    name: 'Notion',
    description: 'Create pages, databases, and content in Notion',
    icon: 'BookOpen',
    category: 'Productivity',
    authType: 'token',
    requiredAuth: {
      token: { label: 'Notion API Key', type: 'password', required: true },
    },
    tools: [
      {
        id: 'create-page',
        name: 'Create Page',
        description: 'Create a new page in a Notion database',
        params: [
          { id: 'parent_id', label: 'Database ID', type: 'text', required: true },
          { id: 'title', label: 'Page Title', type: 'text', required: true, autoFill: true },
          { id: 'content', label: 'Content (Markdown)', type: 'textarea', required: false, autoFill: true },
          { id: 'properties', label: 'Additional Properties (JSON)', type: 'textarea', required: false },
        ],
      },
      {
        id: 'append-block',
        name: 'Add Content to Page',
        description: 'Add content blocks to an existing Notion page',
        params: [
          { id: 'page_id', label: 'Page ID', type: 'text', required: true },
          { id: 'content', label: 'Content to Add', type: 'textarea', required: true, autoFill: true },
        ],
      },
    ],
  },

  google_calendar: {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Create and manage calendar events',
    icon: 'Calendar',
    category: 'Productivity',
    authType: 'oauth',
    requiredAuth: {
      oauth_token: { label: 'Google OAuth Token', type: 'password', required: true },
    },
    tools: [
      {
        id: 'create-event',
        name: 'Create Event',
        description: 'Create a new calendar event',
        params: [
          { id: 'calendar_id', label: 'Calendar ID', type: 'text', required: false },
          { id: 'title', label: 'Event Title', type: 'text', required: true, autoFill: true },
          { id: 'description', label: 'Description', type: 'textarea', required: false, autoFill: true },
          { id: 'start_time', label: 'Start Time (ISO 8601)', type: 'text', required: true },
          { id: 'end_time', label: 'End Time (ISO 8601)', type: 'text', required: true },
          { id: 'attendees', label: 'Attendees (comma-separated emails)', type: 'text', required: false },
        ],
      },
    ],
  },

  gmail: {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send emails via Gmail',
    icon: 'Mail',
    category: 'Communication',
    authType: 'oauth',
    requiredAuth: {
      oauth_token: { label: 'Google OAuth Token', type: 'password', required: true },
    },
    tools: [
      {
        id: 'send-email',
        name: 'Send Email',
        description: 'Send an email message',
        params: [
          { id: 'to', label: 'To (comma-separated)', type: 'text', required: true },
          { id: 'subject', label: 'Subject', type: 'text', required: true, autoFill: true },
          { id: 'body', label: 'Email Body', type: 'textarea', required: true, autoFill: true },
          { id: 'cc', label: 'CC (comma-separated)', type: 'text', required: false },
          { id: 'bcc', label: 'BCC (comma-separated)', type: 'text', required: false },
        ],
      },
    ],
  },
};

/**
 * Get MCP server config by ID
 */
export function getMCPServer(serverId) {
  return MCP_SERVERS[serverId] || null;
}

/**
 * Get tool config from a server
 */
export function getMCPTool(serverId, toolId) {
  const server = getMCPServer(serverId);
  if (!server) return null;
  return server.tools.find(t => t.id === toolId) || null;
}

/**
 * List all available MCP servers
 */
export function listMCPServers() {
  return Object.values(MCP_SERVERS);
}

/**
 * List servers by category
 */
export function getMCPServersByCategory(category) {
  return Object.values(MCP_SERVERS).filter(s => s.category === category);
}

/**
 * Get unique categories
 */
export function getMCPCategories() {
  const categories = new Set();
  Object.values(MCP_SERVERS).forEach(server => {
    categories.add(server.category);
  });
  return Array.from(categories).sort();
}
