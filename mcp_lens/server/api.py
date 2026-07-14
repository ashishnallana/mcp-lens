from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
import time
import asyncio
from ..storage.database import SessionLocal, RequestHistory
from ..core.state import app_state

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
def get_history(limit: int = 50, offset: int = 0, db: Session = Depends(get_db)):
    history = db.query(RequestHistory).order_by(RequestHistory.timestamp.desc()).offset(offset).limit(limit).all()
    return {"history": history}

@router.get("/api/metrics")
def get_metrics(db: Session = Depends(get_db)):
    total = db.query(RequestHistory).count()
    avg_latency = db.query(func.avg(RequestHistory.duration_ms)).scalar() or 0.0
    
    success_count = db.query(RequestHistory).filter(RequestHistory.status == "success").count()
    error_count = db.query(RequestHistory).filter(RequestHistory.status == "error").count()
    
    return {
        "total_requests": total,
        "average_latency": round(avg_latency, 2),
        "success_rate": round(success_count / total * 100, 2) if total > 0 else 100.0,
        "error_rate": round(error_count / total * 100, 2) if total > 0 else 0.0,
    }

class InvokeRequest(BaseModel):
    tool_name: str
    arguments: dict

@router.post("/api/invoke")
async def invoke_tool(req: InvokeRequest):
    if not app_state.mcp_app:
        return {"error": "MCP App not connected"}
        
    start_time = time.time()
    
    # Broadcast start
    asyncio.create_task(app_state.broadcast({
        "event_type": "ToolStarted",
        "tool_name": req.tool_name,
        "arguments": req.arguments,
        "client_id": "MCP Lens UI"
    }))
    
    try:
        # Call the tool directly
        if hasattr(app_state.mcp_app, "call_tool"):
            result = await app_state.mcp_app.call_tool(req.tool_name, req.arguments)
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
            # FastMCP tools often return lists of TextContent
            resp_dict = {"content": [r.model_dump() if hasattr(r, "model_dump") else str(r) for r in result]}
        else:
            resp_dict = {"output": str(result)}
            
        # Log to DB
        db = SessionLocal()
        record = RequestHistory(
            tool_name=req.tool_name,
            arguments=req.arguments,
            response=resp_dict,
            duration_ms=duration_ms,
            status="success",
            client_id="MCP Lens UI"
        )
        db.add(record)
        db.commit()
        db.close()
        
        # Broadcast completion
        asyncio.create_task(app_state.broadcast({
            "event_type": "ToolCompleted",
            "tool_name": req.tool_name,
            "duration_ms": duration_ms
        }))
        
        return resp_dict
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        db = SessionLocal()
        record = RequestHistory(
            tool_name=req.tool_name,
            arguments=req.arguments,
            error=str(e),
            duration_ms=duration_ms,
            status="error",
            client_id="MCP Lens UI"
        )
        db.add(record)
        db.commit()
        db.close()
        
        asyncio.create_task(app_state.broadcast({
            "event_type": "ToolFailed",
            "tool_name": req.tool_name,
            "error": str(e),
            "duration_ms": duration_ms
        }))
        
        return {"error": str(e)}

@router.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    app_state.active_connections.append(websocket)
    try:
        while True:
            # We don't expect much from the client, just keep connection open
            _ = await websocket.receive_text()
    except WebSocketDisconnect:
        if websocket in app_state.active_connections:
            app_state.active_connections.remove(websocket)
