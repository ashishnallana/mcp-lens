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

def instrument(apps, ui: bool = True, ui_port: int = 8000, history: bool = True, metrics: bool = True):
    """
    Instrument one or multiple MCP applications.
    This wraps the apps to capture events and optionally starts the UI server.
    """
    if not isinstance(apps, list):
        apps = [apps]
        
    for mcp_app in apps:
        app_name = getattr(mcp_app, 'name', f"App_{id(mcp_app)}")
        print(f"Instrumenting {app_name} with MCP Lens...")
        
        app_state.servers[app_name] = mcp_app
        app_state.tools[app_name] = []
        app_state.resources[app_name] = []
        app_state.prompts[app_name] = []
        
    # Pre-populate state for all apps
    def _populate_state():
        async def _run():
            for app_name, mcp_app in app_state.servers.items():
                try:
                    if hasattr(mcp_app, "list_tools"):
                        tools = await mcp_app.list_tools()
                        tools_data = []
                        # list_tools might return a ListToolsResult or just a list
                        iterable = tools.tools if hasattr(tools, "tools") else tools
                        for t in iterable:
                            input_schema = {}
                            if hasattr(t, "to_mcp_tool"):
                                mcp_tool = t.to_mcp_tool()
                                input_schema = getattr(mcp_tool, "inputSchema", {})
                            elif hasattr(t, "inputSchema"):
                                input_schema = t.inputSchema
                            elif hasattr(t, "parameters"):
                                input_schema = t.parameters
                            elif isinstance(t, dict):
                                input_schema = t.get("inputSchema", {})
                                
                            name = getattr(t, "name", t.get("name") if isinstance(t, dict) else "unknown")
                            desc = getattr(t, "description", t.get("description") if isinstance(t, dict) else "")
                                
                            tools_data.append({
                                "name": name,
                                "description": desc,
                                "inputSchema": input_schema
                            })
                        app_state.tools[app_name] = tools_data
                        
                    if hasattr(mcp_app, "list_resources"):
                        resources = await mcp_app.list_resources()
                        iterable = resources.resources if hasattr(resources, "resources") else resources
                        resources_data = []
                        for r in iterable:
                            resources_data.append({
                                "uri": str(getattr(r, "uri", "")),
                                "name": getattr(r, "name", ""),
                                "description": getattr(r, "description", ""),
                                "mimeType": getattr(r, "mimeType", "")
                            })
                        app_state.resources[app_name] = resources_data
                        
                    if hasattr(mcp_app, "list_prompts"):
                        prompts = await mcp_app.list_prompts()
                        iterable = prompts.prompts if hasattr(prompts, "prompts") else prompts
                        prompts_data = []
                        for p in iterable:
                            args = getattr(p, "arguments", [])
                            prompts_data.append({
                                "name": getattr(p, "name", "unknown"),
                                "description": getattr(p, "description", ""),
                                "arguments": [{"name": getattr(a, "name", ""), "description": getattr(a, "description", ""), "required": getattr(a, "required", False)} for a in args] if args else []
                            })
                        app_state.prompts[app_name] = prompts_data
                except Exception as e:
                    print(f"Error populating state for {app_name}: {e}")
        try:
            asyncio.run(_run())
        except Exception:
            pass
            
    threading.Thread(target=_populate_state, daemon=True).start()
    
    # Intercept handlers if using fastmcp internal servers
    for app_name, mcp_app in app_state.servers.items():
        if hasattr(mcp_app, "_mcp_server") and hasattr(mcp_app._mcp_server, "request_handlers"):
            try:
                import mcp.types
                
                # 1. Intercept ListTools
                if mcp.types.ListToolsRequest in mcp_app._mcp_server.request_handlers:
                    orig_list = mcp_app._mcp_server.request_handlers[mcp.types.ListToolsRequest]
                    
                    @wraps(orig_list)
                    async def wrapped_list(*args, _app_name=app_name, _orig=orig_list, **kwargs):
                        result = await _orig(*args, **kwargs)
                        if hasattr(result, "tools"):
                            tools_data = []
                            for t in result.tools:
                                tools_data.append({
                                    "name": getattr(t, "name", "unknown"),
                                    "description": getattr(t, "description", ""),
                                    "inputSchema": getattr(t, "inputSchema", {})
                                })
                            app_state.tools[_app_name] = tools_data
                        return result
                        
                    mcp_app._mcp_server.request_handlers[mcp.types.ListToolsRequest] = wrapped_list
    
                # 2. Intercept CallTool
                if mcp.types.CallToolRequest in mcp_app._mcp_server.request_handlers:
                    orig_call = mcp_app._mcp_server.request_handlers[mcp.types.CallToolRequest]
                    
                    @wraps(orig_call)
                    async def wrapped_call(*args, _app_name=app_name, _orig=orig_call, **kwargs):
                        req = args[0] if args else kwargs.get("request")
                        tool_name = req.params.name if hasattr(req, "params") and hasattr(req.params, "name") else "unknown"
                        arguments = req.params.arguments if hasattr(req, "params") and hasattr(req.params, "arguments") else {}
                        
                        start_time = time.time()
                        
                        try:
                            result = await _orig(*args, **kwargs)
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
                                server_name=_app_name,
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
                                server_name=_app_name,
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
        thread = threading.Thread(target=start_server, args=(ui_port,), daemon=True)
        thread.start()
        print(f"MCP Lens UI available at http://localhost:{ui_port}/mcp")
        
    # Return the first app for backward compatibility if it's not a list natively
    return apps[0] if len(apps) == 1 else apps
