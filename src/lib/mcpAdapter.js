/**
 * MCP Adapter - Handle MCP (Model Context Protocol) server connections and tool execution
 * 
 * Provides a unified interface for connecting to different MCP servers and executing
 * tools, similar to how llmAdapter.js handles LLM providers.
 */

import { getMCPServer, getMCPTool } from '../data/mcpRegistry.js';

/**
 * Error messages for common MCP failures
 */
const ERROR_MESSAGES = {
  401: 'Unauthorized - Your credentials are invalid or expired.',
  403: 'Forbidden - You do not have permission to perform this action.',
  404: 'Not found - The requested resource does not exist.',
  429: 'Rate limited - Too many requests. Please wait before retrying.',
  500: 'MCP server error - The server encountered an error.',
  503: 'Service unavailable - The MCP server is temporarily down.',
};

/**
 * Handle MCP error responses
 */
function handleErrorResponse(status, detail) {
  const friendlyMessage = ERROR_MESSAGES[status] || 
    `MCP returned status ${status}. Please check your configuration.`;
  
  throw new Error(detail ? `${friendlyMessage}\n\nDetails: ${detail}` : friendlyMessage);
}

/**
 * GitHub MCP Server Implementation
 */
const GitHubMCP = {
  async createIssue({ token, owner, repo, title, body, labels, assignees }) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
    const headers = {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    };

    const bodyObj = {
      title,
      body,
      ...(labels && { labels: labels.split(',').map(l => l.trim()) }),
      ...(assignees && { assignees: assignees.split(',').map(a => a.trim()) }),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyObj),
      });

      if (!response.ok) {
        const error = await response.json();
        handleErrorResponse(response.status, error.message);
      }

      const data = await response.json();
      return {
        success: true,
        issue_url: data.html_url,
        issue_number: data.number,
        id: data.id,
      };
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Could not reach GitHub API. Check your internet connection.');
      }
      throw error;
    }
  },

  async addComment({ token, owner, repo, issue_number, body }) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}/comments`;
    const headers = {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body }),
      });

      if (!response.ok) {
        const error = await response.json();
        handleErrorResponse(response.status, error.message);
      }

      const data = await response.json();
      return {
        success: true,
        comment_url: data.html_url,
        comment_id: data.id,
      };
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Could not reach GitHub API. Check your internet connection.');
      }
      throw error;
    }
  },

  async updateIssue({ token, owner, repo, issue_number, state, labels }) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}`;
    const headers = {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    };

    const bodyObj = {
      ...(state && { state }),
      ...(labels && { labels: labels.split(',').map(l => l.trim()) }),
    };

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(bodyObj),
      });

      if (!response.ok) {
        const error = await response.json();
        handleErrorResponse(response.status, error.message);
      }

      const data = await response.json();
      return {
        success: true,
        updated_at: data.updated_at,
      };
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Could not reach GitHub API. Check your internet connection.');
      }
      throw error;
    }
  },
};

/**
 * Slack MCP Server Implementation
 */
const SlackMCP = {
  async sendMessage({ token, channel, text, thread_ts }) {
    const url = 'https://slack.com/api/chat.postMessage';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const bodyObj = {
      channel,
      text,
      ...(thread_ts && { thread_ts }),
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyObj),
      });

      if (!response.ok) {
        handleErrorResponse(response.status, 'Failed to send Slack message');
      }

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`);
      }

      return {
        success: true,
        ts: data.ts,
        channel: data.channel,
      };
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Could not reach Slack API. Check your internet connection.');
      }
      throw error;
    }
  },

  async sendBlocks({ token, channel, blocks_json }) {
    const url = 'https://slack.com/api/chat.postMessage';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    let blocks;
    try {
      blocks = JSON.parse(blocks_json);
    } catch (e) {
      throw new Error('Invalid JSON in blocks_json parameter');
    }

    const bodyObj = {
      channel,
      blocks,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyObj),
      });

      if (!response.ok) {
        handleErrorResponse(response.status, 'Failed to send Slack message');
      }

      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(`Slack API error: ${data.error}`);
      }

      return {
        success: true,
        ts: data.ts,
        channel: data.channel,
      };
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Could not reach Slack API. Check your internet connection.');
      }
      throw error;
    }
  },
};

/**
 * Notion MCP Server Implementation
 */
const NotionMCP = {
  async createPage({ token, parent_id, title, content, properties }) {
    const url = 'https://api.notion.com/v1/pages';
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };

    const bodyObj = {
      parent: {
        database_id: parent_id,
      },
      properties: {
        title: {
          title: [{ text: { content: title } }],
        },
        ...(properties && typeof properties === 'string' ? JSON.parse(properties) : properties),
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyObj),
      });

      if (!response.ok) {
        const error = await response.json();
        handleErrorResponse(response.status, error.message);
      }

      const data = await response.json();
      return {
        success: true,
        page_id: data.id,
        page_url: data.url,
      };
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Could not reach Notion API. Check your internet connection.');
      }
      throw error;
    }
  },

  async appendBlock({ token, page_id, content }) {
    const url = `https://api.notion.com/v1/blocks/${page_id}/children`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };

    const bodyObj = {
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content } }],
          },
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(bodyObj),
      });

      if (!response.ok) {
        const error = await response.json();
        handleErrorResponse(response.status, error.message);
      }

      const data = await response.json();
      return {
        success: true,
        block_ids: data.results?.map(r => r.id) || [],
      };
    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Could not reach Notion API. Check your internet connection.');
      }
      throw error;
    }
  },
};

/**
 * Get the appropriate MCP server implementation
 */
function getMCPServerImpl(serverId) {
  const impls = {
    'github': GitHubMCP,
    'slack': SlackMCP,
    'notion': NotionMCP,
  };
  
  return impls[serverId] || null;
}

/**
 * Execute an MCP tool with the provided credentials and parameters
 * 
 * @param {Object} params
 * @param {string} params.serverId - The MCP server ID (e.g., 'github')
 * @param {string} params.toolId - The tool ID (e.g., 'create-issue')
 * @param {Object} params.credentials - Authentication credentials
 * @param {Object} params.params - Tool-specific parameters
 * @returns {Promise<Object>} Tool execution result
 */
export async function executeMCPTool({ serverId, toolId, credentials, params }) {
  const server = getMCPServer(serverId);
  if (!server) {
    throw new Error(`Unknown MCP server: ${serverId}`);
  }

  const tool = getMCPTool(serverId, toolId);
  if (!tool) {
    throw new Error(`Unknown tool '${toolId}' in server '${serverId}'`);
  }

  // Validate required credentials
  for (const [credKey, credConfig] of Object.entries(server.requiredAuth)) {
    if (credConfig.required && (!credentials[credKey] || credentials[credKey].trim() === '')) {
      throw new Error(`Missing required credential: ${credConfig.label}`);
    }
  }

  // Validate required parameters
  for (const paramConfig of tool.params) {
    if (paramConfig.required && (!params[paramConfig.id] || params[paramConfig.id]?.toString().trim() === '')) {
      throw new Error(`Missing required parameter: ${paramConfig.label}`);
    }
  }

  const impl = getMCPServerImpl(serverId);
  if (!impl) {
    throw new Error(`MCP server '${serverId}' is not implemented yet`);
  }

  // Combine credentials and parameters
  const allParams = {
    ...credentials,
    ...params,
  };

  // Call the appropriate tool method
  const toolMethodName = toolId.replace(/-/g, '_');
  const toolMethod = impl[toolMethodName];

  if (!toolMethod) {
    throw new Error(`Tool method not found: ${toolId}`);
  }

  return await toolMethod.call(impl, allParams);
}

/**
 * Test MCP server connection
 * 
 * @param {string} serverId - The MCP server ID
 * @param {Object} credentials - Authentication credentials
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testMCPConnection(serverId, credentials) {
  try {
    const server = getMCPServer(serverId);
    if (!server) {
      throw new Error(`Unknown MCP server: ${serverId}`);
    }

    // Simple test: just verify we can authenticate
    switch (serverId) {
      case 'github': {
        const response = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${credentials.token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        return response.ok;
      }
      case 'slack': {
        const response = await fetch('https://slack.com/api/auth.test', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${credentials.token}`,
          },
        });
        const data = await response.json();
        return data.ok === true;
      }
      case 'notion': {
        const response = await fetch('https://api.notion.com/v1/users/me', {
          headers: {
            'Authorization': `Bearer ${credentials.token}`,
            'Notion-Version': '2022-06-28',
          },
        });
        return response.ok;
      }
      default:
        return false;
    }
  } catch (error) {
    console.error('MCP connection test failed:', error);
    return false;
  }
}

export { getMCPServer, getMCPTool };
