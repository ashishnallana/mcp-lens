from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import time
import uuid
import datetime
import asyncio
from ..core.state import app_state

router = APIRouter()

@router.get("/api/server")
def get_server():
    return app_state.server_info

@router.get("/api/tools")
def get_tools():
    return {"tools": app_state.tools}

@router.get("/api/resources")
def get_resources():
    return {"resources": app_state.resources}

@router.get("/api/prompts")
def get_prompts():
    return {"prompts": app_state.prompts}

@router.get("/api/history")
def get_history(limit: int = 50, offset: int = 0):
    # In-memory history, newest first
    sorted_history = sorted(app_state.history, key=lambda x: x.get("timestamp", ""), reverse=True)
    history = sorted_history[offset:offset+limit]
    return {"history": history}

@router.get("/api/metrics")
def get_metrics():
    total = len(app_state.history)
    avg_latency = sum(r.get("duration_ms", 0) for r in app_state.history) / total if total > 0 else 0.0
    
    success_count = sum(1 for r in app_state.history if r.get("status") == "success")
    error_count = sum(1 for r in app_state.history if r.get("status") == "error")
    
    return {
        "total_requests": total,
        "average_latency": round(avg_latency, 2),
        "success_rate": round(success_count / total * 100, 2) if total > 0 else 100.0,
        "error_rate": round(error_count / total * 100, 2) if total > 0 else 0.0,
    }

class InvokeRequest(BaseModel):
    server_name: str
    tool_name: str
    arguments: dict

@router.post("/api/invoke")
async def invoke_tool(req: InvokeRequest):
    if req.server_name not in app_state.servers:
        return {"error": f"Server {req.server_name} not found or not connected"}
        
    mcp_app = app_state.servers[req.server_name]
    start_time = time.time()
    
    # Broadcast start
    asyncio.create_task(app_state.broadcast({
        "event_type": "ToolStarted",
        "server_name": req.server_name,
        "tool_name": req.tool_name,
        "arguments": req.arguments,
        "client_id": "MCP Lens UI"
    }))
    
    record = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "server_name": req.server_name,
        "tool_name": req.tool_name,
        "arguments": req.arguments,
        "client_id": "MCP Lens UI"
    }

    try:
        # Call the tool directly
        if hasattr(mcp_app, "call_tool"):
            result = await mcp_app.call_tool(req.tool_name, req.arguments)
        else:
            raise Exception("No call_tool method on the server")
            
        duration_ms = (time.time() - start_time) * 1000
        
        # Safely serialize result
        resp_dict = {}
        if hasattr(result, "model_dump"):
            resp_dict = result.model_dump()
        elif hasattr(result, "dict"):
            resp_dict = result.dict()
        elif isinstance(result, list):
            resp_dict = {"content": [r.model_dump() if hasattr(r, "model_dump") else str(r) for r in result]}
        else:
            resp_dict = {"output": str(result)}
            
        # Log to in-memory state
        record["response"] = resp_dict
        record["duration_ms"] = duration_ms
        record["status"] = "success"
        app_state.history.append(record)
        
        # Broadcast completion
        asyncio.create_task(app_state.broadcast({
            "event_type": "ToolCompleted",
            "server_name": req.server_name,
            "tool_name": req.tool_name,
            "duration_ms": duration_ms
        }))
        
        return resp_dict
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        record["error"] = str(e)
        record["duration_ms"] = duration_ms
        record["status"] = "error"
        app_state.history.append(record)
        
        asyncio.create_task(app_state.broadcast({
            "event_type": "ToolFailed",
            "server_name": req.server_name,
            "tool_name": req.tool_name,
            "error": str(e),
            "duration_ms": duration_ms
        }))
        
        return {"error": str(e)}

class ReadResourceRequest(BaseModel):
    server_name: str
    uri: str

@router.post("/api/resource/read")
async def read_resource(req: ReadResourceRequest):
    if req.server_name not in app_state.servers:
        return {"error": "Server not found"}
    mcp_app = app_state.servers[req.server_name]
    try:
        if hasattr(mcp_app, "read_resource"):
            result = await mcp_app.read_resource(req.uri)
            # Serialize result
            if isinstance(result, str) or isinstance(result, bytes):
                return {"result": str(result)}
            elif hasattr(result, "model_dump"):
                return {"result": result.model_dump()}
            elif hasattr(result, "dict"):
                return {"result": result.dict()}
            return {"result": str(result)}
        else:
            return {"error": "Server does not support reading resources"}
    except Exception as e:
        return {"error": str(e)}

class GetPromptRequest(BaseModel):
    server_name: str
    prompt_name: str
    arguments: dict

@router.post("/api/prompt/get")
async def get_prompt(req: GetPromptRequest):
    if req.server_name not in app_state.servers:
        return {"error": "Server not found"}
    mcp_app = app_state.servers[req.server_name]
    try:
        if hasattr(mcp_app, "get_prompt"):
            result = await mcp_app.get_prompt(req.prompt_name, req.arguments)
            if hasattr(result, "model_dump"):
                return {"result": result.model_dump()}
            elif hasattr(result, "dict"):
                return {"result": result.dict()}
            return {"result": str(result)}
        else:
            return {"error": "Server does not support getting prompts"}
    except Exception as e:
        return {"error": str(e)}

@router.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    app_state.active_connections.append(websocket)
    try:
        while True:
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in app_state.active_connections:
            app_state.active_connections.remove(websocket)
