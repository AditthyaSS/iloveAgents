# backend/services/agent_runner.py

import asyncio
import os
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class AgentMaxRoundsError(Exception):
    """Raised when an agent exceeds the maximum allowed tool rounds."""
    pass

class AgentResult:
    def __init__(self, status: str, output: Optional[str] = None, error: Optional[str] = None, partial_output: Optional[Dict[str, Any]] = None):
        self.status = status # 'success' | 'timeout' | 'error' | 'max_rounds_exceeded'
        self.output = output
        self.error = error
        self.partial_output = partial_output or {}

class AgentRunner:
    def __init__(self, agent_config: Dict[Any, Any]):
        self.agent_config = agent_config
        # Fallback to global env variable or default 300 seconds (5 minutes)
        global_default_timeout = int(os.getenv("AGENT_DEFAULT_TIMEOUT_SECONDS", 300))
        self.max_execution_seconds = agent_config.get("max_execution_seconds", global_default_timeout)
        self.max_tool_rounds = agent_config.get("max_tool_rounds", 20)
        self.tool_timeout_seconds = agent_config.get("tool_timeout_seconds", 30)
        
        self.tool_rounds = 0
        self._partial_state: Dict[Any, Any] = {"steps_completed": []}

    async def run(self, task: str) -> AgentResult:
        try:
            return await asyncio.wait_for(
                self._execute_agent_loop(task),
                timeout=self.max_execution_seconds
            )
        except asyncio.TimeoutError:
            logger.warning(f"[AgentRunner] Agent execution exceeded limit of {self.max_execution_seconds}s")
            return AgentResult(
                status="timeout",
                error=f"Agent execution exceeded {self.max_execution_seconds}s limit",
                partial_output=self._get_partial_output()
            )
        except AgentMaxRoundsError as e:
            logger.warning(f"[AgentRunner] Agent exceeded max tool rounds: {e}")
            return AgentResult(
                status="max_rounds_exceeded",
                error=str(e),
                partial_output=self._get_partial_output()
            )
        except Exception as err:
            logger.error(f"[AgentRunner] Unexpected error during agent execution: {err}", exc_info=True)
            return AgentResult(
                status="error",
                error=str(err),
                partial_output=self._get_partial_output()
            )

    async def _execute_agent_loop(self, task: str) -> AgentResult:
        # Simulate ReAct agent planning and tool execution loop
        while True:
            if self.tool_rounds >= self.max_tool_rounds:
                raise AgentMaxRoundsError(f"Agent exceeded {self.max_tool_rounds} maximum tool rounds")

            # Simulate LLM thought / action generation
            action = await self._mock_llm_reasoning(task)
            
            if action.get("finished"):
                return AgentResult(status="success", output=action.get("result"))

            self.tool_rounds += 1
            tool_name = action.get("tool")
            tool_args = action.get("args", {})

            # Execute tool with per-tool timeout
            tool_output = await self._execute_tool_with_timeout(tool_name, tool_args)
            self._partial_state["steps_completed"].append({
                "round": self.tool_rounds,
                "tool": tool_name,
                "output": tool_output
            })

    async def _execute_tool_with_timeout(self, tool_name: str, args: Dict[Any, Any]) -> Any:
        try:
            return await asyncio.wait_for(
                self._call_external_tool(tool_name, args),
                timeout=self.tool_timeout_seconds
            )
        except asyncio.TimeoutError:
            return f"Error: Tool '{tool_name}' timed out after {self.tool_timeout_seconds}s"

    async def _call_external_tool(self, tool_name: str, args: Dict[Any, Any]) -> Any:
        # Placeholder for actual tool dispatch logic
        await asyncio.sleep(0.1)
        return f"Result from {tool_name}"

    async def _mock_llm_reasoning(self, task: str) -> Dict[Any, Any]:
        await asyncio.sleep(0.05)
        if self.tool_rounds < 3:
            return {"finished": False, "tool": "search_tool", "args": {"query": task}}
        return {"finished": True, "result": "Task completed successfully"}

    def _get_partial_output(self) -> Dict[Any, Any]:
        return {
            "rounds_executed": self.tool_rounds,
            "partial_state": self._partial_state
        }
