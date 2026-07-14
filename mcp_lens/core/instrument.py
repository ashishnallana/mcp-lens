import threading
import uvicorn
from ..server.app import app

def start_server(port: int):
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="error")

def instrument(mcp_app, ui: bool = True, ui_port: int = 8000, history: bool = True, metrics: bool = True):
    """
    Instrument an MCP application.
    This wraps the app to capture events and optionally starts the UI server.
    """
    print(f"Instrumenting {getattr(mcp_app, 'name', 'MCP App')} with MCP Lens...")
    
    if ui:
        # Start UI backend in a background thread
        thread = threading.Thread(target=start_server, args=(ui_port,), daemon=True)
        thread.start()
        print(f"MCP Lens UI available at http://localhost:{ui_port}/mcp")
        
    # TODO: Wrap tools and transports in mcp_app to capture events.
    return mcp_app
