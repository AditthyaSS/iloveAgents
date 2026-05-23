/**
 * MCPStepCard - MCP (Model Context Protocol) step configuration UI
 * 
 * Allows users to:
 * - Select an MCP server
 * - Choose a tool/action from that server
 * - Configure tool parameters
 * - Map previous agent output to parameters (autoFill)
 */

import { useState } from 'react';
import { X, ChevronDown, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { getMCPServer, listMCPServers, getMCPTool } from '../data/mcpRegistry.js';
import { testMCPConnection } from '../lib/mcpAdapter.js';

export default function MCPStepCard({ 
  step,
  onUpdate,
  onRemove,
  previousOutput,
  isRunning,
  error,
  result,
}) {
  const [selectedServer, setSelectedServer] = useState(step?.serverId || '');
  const [selectedTool, setSelectedTool] = useState(step?.toolId || '');
  const [credentials, setCredentials] = useState(step?.credentials || {});
  const [toolParams, setToolParams] = useState(step?.params || {});
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [expandedSection, setExpandedSection] = useState('server');

  const server = selectedServer ? getMCPServer(selectedServer) : null;
  const tool = selectedServer && selectedTool ? getMCPTool(selectedServer, selectedTool) : null;

  const handleServerChange = (serverId) => {
    setSelectedServer(serverId);
    setSelectedTool('');
    setToolParams({});
    setConnectionStatus(null);
  };

  const handleToolChange = (toolId) => {
    setSelectedTool(toolId);
    setToolParams({});
  };

  const handleCredentialChange = (key, value) => {
    const newCredentials = { ...credentials, [key]: value };
    setCredentials(newCredentials);
    onUpdate({
      serverId: selectedServer,
      toolId: selectedTool,
      credentials: newCredentials,
      params: toolParams,
    });
  };

  const handleParamChange = (paramId, value) => {
    const newParams = { ...toolParams, [paramId]: value };
    setToolParams(newParams);
    onUpdate({
      serverId: selectedServer,
      toolId: selectedTool,
      credentials,
      params: newParams,
    });
  };

  const handleTestConnection = async () => {
    if (!selectedServer) {
      alert('Please select an MCP server first');
      return;
    }

    setTestingConnection(true);
    try {
      const success = await testMCPConnection(selectedServer, credentials);
      setConnectionStatus(success ? 'success' : 'failed');
      if (!success) {
        alert('Connection failed. Please check your credentials.');
      }
    } catch (err) {
      setConnectionStatus('failed');
      alert(`Connection error: ${err.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const autoFillParam = (paramId) => {
    if (previousOutput && typeof previousOutput === 'string') {
      handleParamChange(paramId, previousOutput);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
            ⚙️
          </div>
          <h3 className="font-semibold text-gray-900">MCP Step</h3>
        </div>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-gray-100 rounded transition"
          title="Remove this step"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Server Selection */}
      <div className="mb-4">
        <button
          onClick={() => setExpandedSection(expandedSection === 'server' ? null : 'server')}
          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition"
        >
          <span className="font-medium text-gray-700">
            {selectedServer ? getMCPServer(selectedServer)?.name : 'Select MCP Server'}
          </span>
          <ChevronDown 
            size={16} 
            className={`text-gray-500 transition ${expandedSection === 'server' ? 'rotate-180' : ''}`}
          />
        </button>

        {expandedSection === 'server' && (
          <div className="mt-2 space-y-2">
            {listMCPServers().map(srv => (
              <button
                key={srv.id}
                onClick={() => handleServerChange(srv.id)}
                className={`w-full text-left p-3 rounded border transition ${
                  selectedServer === srv.id
                    ? 'bg-purple-50 border-purple-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{srv.name}</div>
                <div className="text-sm text-gray-600">{srv.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Credentials */}
      {server && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-gray-700">Authentication</label>
            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 disabled:opacity-50 transition"
            >
              {testingConnection ? (
                <Loader size={14} className="inline animate-spin mr-1" />
              ) : null}
              Test Connection
            </button>
          </div>

          {connectionStatus && (
            <div className={`mb-2 p-2 rounded text-sm flex items-center gap-2 ${
              connectionStatus === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}>
              {connectionStatus === 'success' ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {connectionStatus === 'success' ? 'Connected!' : 'Connection failed'}
            </div>
          )}

          <div className="space-y-2">
            {Object.entries(server.requiredAuth).map(([key, config]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {config.label}
                  {config.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  type={config.type}
                  value={credentials[key] || ''}
                  onChange={(e) => handleCredentialChange(key, e.target.value)}
                  placeholder={`Enter ${config.label.toLowerCase()}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool Selection */}
      {server && (
        <div className="mb-4">
          <button
            onClick={() => setExpandedSection(expandedSection === 'tool' ? null : 'tool')}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition"
          >
            <span className="font-medium text-gray-700">
              {selectedTool && tool ? tool.name : 'Select Action'}
            </span>
            <ChevronDown 
              size={16} 
              className={`text-gray-500 transition ${expandedSection === 'tool' ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedSection === 'tool' && (
            <div className="mt-2 space-y-2">
              {server.tools.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleToolChange(t.id)}
                  className={`w-full text-left p-3 rounded border transition ${
                    selectedTool === t.id
                      ? 'bg-purple-50 border-purple-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{t.name}</div>
                  <div className="text-sm text-gray-600">{t.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tool Parameters */}
      {tool && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-3">Configure Action</h4>
          <div className="space-y-3">
            {tool.params.map(param => (
              <div key={param.id}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    {param.label}
                    {param.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {param.autoFill && previousOutput && (
                    <button
                      onClick={() => autoFillParam(param.id)}
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
                      title="Use previous agent output"
                    >
                      Use Previous Output
                    </button>
                  )}
                </div>

                {param.type === 'textarea' ? (
                  <textarea
                    value={toolParams[param.id] || ''}
                    onChange={(e) => handleParamChange(param.id, e.target.value)}
                    placeholder={param.autoFill ? 'Will auto-fill from previous output' : `Enter ${param.label.toLowerCase()}`}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                ) : param.type === 'select' ? (
                  <select
                    value={toolParams[param.id] || ''}
                    onChange={(e) => handleParamChange(param.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select {param.label.toLowerCase()}</option>
                    {param.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : param.type === 'number' ? (
                  <input
                    type="number"
                    value={toolParams[param.id] || ''}
                    onChange={(e) => handleParamChange(param.id, e.target.value)}
                    placeholder={`Enter ${param.label.toLowerCase()}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={toolParams[param.id] || ''}
                    onChange={(e) => handleParamChange(param.id, e.target.value)}
                    placeholder={param.autoFill ? 'Will auto-fill from previous output' : `Enter ${param.label.toLowerCase()}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status / Results */}
      {isRunning && (
        <div className="p-3 bg-blue-50 rounded border border-blue-200 flex items-center gap-2 text-blue-700 text-sm">
          <Loader size={16} className="animate-spin" />
          Executing MCP tool...
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 rounded border border-red-200 flex items-start gap-2 text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Error</div>
            <div className="text-red-600">{error}</div>
          </div>
        </div>
      )}

      {result && (
        <div className="p-3 bg-green-50 rounded border border-green-200">
          <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-2">
            <CheckCircle size={16} />
            Success
          </div>
          <div className="bg-white rounded p-2 text-sm text-gray-700 font-mono overflow-auto max-h-32">
            {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
}
