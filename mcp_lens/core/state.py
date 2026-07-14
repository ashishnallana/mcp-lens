from typing import List, Dict, Any

class AppState:
    def __init__(self):
        self.server_info: Dict[str, Any] = {
            "name": "MCP Server",
            "version": "0.1.0",
            "transport": "stdio",
            "status": "running"
        }
        self.tools: List[Dict[str, Any]] = []
        self.resources: List[Dict[str, Any]] = []
        self.prompts: List[Dict[str, Any]] = []
        self.active_connections: List[Any] = []
        self.mcp_app = None

    async def broadcast(self, message: dict):
        """Broadcast an event to all connected UI clients."""
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                dead_connections.append(connection)
        
        for dead in dead_connections:
            self.active_connections.remove(dead)

# Global in-memory state
app_state = AppState()
