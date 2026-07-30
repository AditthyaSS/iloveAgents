from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock database
agents_db = {
    "123e4567-e89b-12d3-a456-426614174000": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Research Agent"
    }
}

# Pre-populate some history
agent_versions_db = [
    {
        "id": str(uuid.uuid4()),
        "agent_id": "123e4567-e89b-12d3-a456-426614174000",
        "version_number": 1,
        "config_snapshot": {"temperature": 0.7, "model": "gpt-3.5", "instructions": "You are a research agent."},
        "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2)).isoformat(),
        "created_by": "alice@example.com",
        "change_summary": "Initial config"
    },
    {
        "id": str(uuid.uuid4()),
        "agent_id": "123e4567-e89b-12d3-a456-426614174000",
        "version_number": 2,
        "config_snapshot": {"temperature": 0.5, "model": "gpt-4", "instructions": "You are an expert research agent. Do not hallucinate."},
        "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1)).isoformat(),
        "created_by": "bob@example.com",
        "change_summary": "Upgraded model to gpt-4 and decreased temperature"
    }
]

class SaveAgentRequest(BaseModel):
    agent_id: str
    config_snapshot: Dict[str, Any]
    created_by: str
    change_summary: Optional[str] = "Updated configuration"

@app.get("/agents")
def get_agents():
    return list(agents_db.values())

@app.get("/agents/{agent_id}/versions")
def get_agent_versions(agent_id: str):
    versions = [v for v in agent_versions_db if v["agent_id"] == agent_id]
    versions.sort(key=lambda x: x["version_number"], reverse=True)
    return versions[:20]  # Last 20 versions

@app.post("/agents/{agent_id}/versions")
def save_agent_version(agent_id: str, req: SaveAgentRequest):
    versions = [v for v in agent_versions_db if v["agent_id"] == agent_id]
    next_version = max([v["version_number"] for v in versions]) + 1 if versions else 1
    
    new_version = {
        "id": str(uuid.uuid4()),
        "agent_id": agent_id,
        "version_number": next_version,
        "config_snapshot": req.config_snapshot,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "created_by": req.created_by,
        "change_summary": req.change_summary
    }
    agent_versions_db.append(new_version)
    return new_version

@app.post("/agents/{agent_id}/rollback/{version_id}")
def rollback_agent_version(agent_id: str, version_id: str, req: SaveAgentRequest):
    # Find the target version
    target_version = next((v for v in agent_versions_db if v["id"] == version_id and v["agent_id"] == agent_id), None)
    if not target_version:
        raise HTTPException(status_code=404, detail="Version not found")
        
    versions = [v for v in agent_versions_db if v["agent_id"] == agent_id]
    next_version = max([v["version_number"] for v in versions]) + 1 if versions else 1
    
    new_version = {
        "id": str(uuid.uuid4()),
        "agent_id": agent_id,
        "version_number": next_version,
        "config_snapshot": target_version["config_snapshot"],
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "created_by": req.created_by,
        "change_summary": f"Restored version {target_version['version_number']}"
    }
    agent_versions_db.append(new_version)
    return new_version
