from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
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
