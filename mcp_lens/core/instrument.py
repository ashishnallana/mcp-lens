import threading
import uvicorn
import asyncio
import time
from functools import wraps
from ..server.app import app
from .state import app_state
from ..storage.database import SessionLocal, RequestHistory

def start_server(port: int):
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="error")

def instrument(mcp_app, ui: bool = True, ui_port: int = 8000, history: bool = True, metrics: bool = True):
    """
    Instrument an MCP application.
    This wraps the app to capture events and optionally starts the UI server.
    """
    print(f"Instrumenting {getattr(mcp_app, 'name', 'MCP App')} with MCP Lens...")
    
    app_state.server_info["name"] = getattr(mcp_app, "name", "MCP App")
    app_state.mcp_app = mcp_app
    
    # Pre-populate tools by awaiting the server's list_tools coroutine
    def _populate_state():
        async def _run():
            try:
                if hasattr(mcp_app, "list_tools"):
                    tools = await mcp_app.list_tools()
                    tools_data = []
                    for t in tools:
                        # FastMCP tools typically have a to_mcp_tool() method
                        input_schema = {}
                        if hasattr(t, "to_mcp_tool"):
                            mcp_tool = t.to_mcp_tool()
                            input_schema = getattr(mcp_tool, "inputSchema", {})
                        else:
                            input_schema = getattr(t, "inputSchema", getattr(t, "parameters", {}))
                            
                        tools_data.append({
                            "name": getattr(t, "name", "unknown"),
                            "description": getattr(t, "description", ""),
                            "inputSchema": input_schema
                        })
                    app_state.tools = tools_data
                    
                if hasattr(mcp_app, "list_resources"):
                    resources = await mcp_app.list_resources()
                    resources_data = []
                    for r in resources:
                        resources_data.append({
                            "uri": str(getattr(r, "uri", "unknown")),
                            "name": getattr(r, "name", ""),
                            "description": getattr(r, "description", ""),
                            "mimeType": getattr(r, "mimeType", "")
                        })
                    app_state.resources = resources_data
                    
                if hasattr(mcp_app, "list_prompts"):
                    prompts = await mcp_app.list_prompts()
                    prompts_data = []
                    for p in prompts:
                        args = getattr(p, "arguments", [])
                        prompts_data.append({
                            "name": getattr(p, "name", "unknown"),
                            "description": getattr(p, "description", ""),
                            "arguments": [{"name": a.name, "description": getattr(a, "description", ""), "required": getattr(a, "required", False)} for a in args] if args else []
                        })
                    app_state.prompts = prompts_data
            except Exception as e:
                print(f"Error populating state: {e}")
                pass
        try:
            asyncio.run(_run())
        except Exception:
            pass
            
    threading.Thread(target=_populate_state, daemon=True).start()
    
    if hasattr(mcp_app, "_mcp_server") and hasattr(mcp_app._mcp_server, "request_handlers"):
        try:
            import mcp.types
            
            # 1. Intercept ListTools
            if mcp.types.ListToolsRequest in mcp_app._mcp_server.request_handlers:
                orig_list = mcp_app._mcp_server.request_handlers[mcp.types.ListToolsRequest]
                
                @wraps(orig_list)
                async def wrapped_list(*args, **kwargs):
                    result = await orig_list(*args, **kwargs)
                    if hasattr(result, "tools"):
                        tools_data = []
                        for t in result.tools:
                            tools_data.append({
                                "name": getattr(t, "name", "unknown"),
                                "description": getattr(t, "description", ""),
                                "inputSchema": getattr(t, "inputSchema", {})
                            })
                        app_state.tools = tools_data
                    return result
                    
                mcp_app._mcp_server.request_handlers[mcp.types.ListToolsRequest] = wrapped_list

            # 2. Intercept CallTool
            if mcp.types.CallToolRequest in mcp_app._mcp_server.request_handlers:
                orig_call = mcp_app._mcp_server.request_handlers[mcp.types.CallToolRequest]
                
                @wraps(orig_call)
                async def wrapped_call(*args, **kwargs):
                    req = args[0] if args else kwargs.get("request")
                    tool_name = req.params.name if hasattr(req, "params") and hasattr(req.params, "name") else "unknown"
                    arguments = req.params.arguments if hasattr(req, "params") and hasattr(req.params, "arguments") else {}
                    
                    start_time = time.time()
                    
                    try:
                        result = await orig_call(*args, **kwargs)
                        duration_ms = (time.time() - start_time) * 1000
                        
                        resp_dict = {}
                        if hasattr(result, "model_dump"):
                            resp_dict = result.model_dump()
                        elif hasattr(result, "dict"):
                            resp_dict = result.dict()
                        else:
                            resp_dict = {"output": str(result)}
                            
                        db = SessionLocal()
                        record = RequestHistory(
                            tool_name=tool_name,
                            arguments=arguments,
                            response=resp_dict,
                            duration_ms=duration_ms,
                            status="success"
                        )
                        db.add(record)
                        db.commit()
                        db.close()
                        
                        return result
                    except Exception as e:
                        duration_ms = (time.time() - start_time) * 1000
                        
                        db = SessionLocal()
                        record = RequestHistory(
                            tool_name=tool_name,
                            arguments=arguments,
                            error=str(e),
                            duration_ms=duration_ms,
                            status="error"
                        )
                        db.add(record)
                        db.commit()
                        db.close()
                        raise
                        
                mcp_app._mcp_server.request_handlers[mcp.types.CallToolRequest] = wrapped_call
                
        except ImportError:
            print("Warning: mcp package not found. Instrumentation may be limited.")
            
    if ui:
        # Start UI backend in a background thread
        thread = threading.Thread(target=start_server, args=(ui_port,), daemon=True)
        thread.start()
        print(f"MCP Lens UI available at http://localhost:{ui_port}/mcp")
        
    return mcp_app
