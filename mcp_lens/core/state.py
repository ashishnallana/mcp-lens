from typing import List, Dict, Any

class AppState:
    def __init__(self):
        self.server_info: Dict[str, Any] = {
            "name": "MCP Lens",
            "version": "0.2.0",
            "status": "running"
        }
        self.servers: Dict[str, Any] = {}
        self.tools: Dict[str, List[Dict[str, Any]]] = {}
        self.resources: Dict[str, List[Dict[str, Any]]] = {}
        self.prompts: Dict[str, List[Dict[str, Any]]] = {}
        self.active_connections: List[Any] = []

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
