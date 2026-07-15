from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import os
from .api import router
from ..storage.database import init_db

# Initialize database schema
init_db()

app = FastAPI(title="MCP Lens", description="Developer Dashboard for Model Context Protocol")
app.include_router(router)

# Mount static files if they exist (for when the React app is built)
static_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
if os.path.exists(static_dir):
    app.mount("/mcp/assets", StaticFiles(directory=os.path.join(static_dir, "assets")), name="assets")

    @app.get("/mcp", response_class=HTMLResponse)
    @app.get("/mcp/{full_path:path}", response_class=HTMLResponse)
    async def serve_ui():
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            with open(index_path, "r") as f:
                return f.read()
        return "UI not built yet."
else:
    @app.get("/mcp")
    async def ui_not_found():
        return {"error": "UI static files not found. Run the frontend build process."}

from fastapi.responses import RedirectResponse
@app.get("/")
async def redirect_to_mcp():
    return RedirectResponse(url="/mcp")

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
