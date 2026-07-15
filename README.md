# MCP Lens

**MCP Lens** is the Swagger UI equivalent for the **Model Context Protocol (MCP)**. It provides a beautiful, interactive, and dark-themed web interface to explore, execute, and debug your MCP servers locally.

MCP Lens automatically intercepts calls to your MCP Server (using `fastmcp`), aggregates the schema of all available tools, resources, and prompts, and instantly spins up a local web UI.

---

## 🚀 Features

- 🛠 **Tools Explorer**: View all available tools, their JSON schemas, and test them with a live form. See execution traces and server responses.
- 📚 **Resources Explorer**: Browse all standard and dynamically paginated resources exposed by your MCP servers and inspect their values instantly.
- 💬 **Prompts Explorer**: View predefined prompt templates and invoke them dynamically to see exactly how they will format for LLMs.
- 📜 **Request History**: Keep a log of all executions along with performance metrics (execution time, status codes) and effortlessly replay them.
- 🔐 **Multi-Server & Auth**: Supports instrumenting multiple MCP servers concurrently and provides an interface for Bearer token authorizations per server.

---

## 📦 Installation

To use MCP Lens in your project, simply install it via pip:

```bash
pip install mcp-lens-ui
```

*(Note: Ensure your MCP server is built using the `fastmcp` package.)*

---

## ⚡ How to Use

Using MCP Lens is incredibly easy. Just import `instrument` from `mcp_lens` and wrap your `FastMCP` app instances.

### Minimal Example (`example.py`)

Here is a full example showing how to create a basic weather MCP server and visualize it with MCP Lens.

```python
import httpx
from fastmcp import FastMCP
from mcp_lens import instrument

app = FastMCP("OpenMeteo Weather")

@app.tool()
async def get_current_weather(latitude: float, longitude: float) -> str:
    """Get the current weather for a specific latitude and longitude. Uses Open-Meteo free API."""
    url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&current_weather=true"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
        
    if "current_weather" in data:
        weather = data["current_weather"]
        return f"Current temperature is {weather['temperature']}°C with wind speed {weather['windspeed']} km/h."
    return "Weather data not available."

@app.resource("weather://about")
def about_weather_api() -> str:
    """Information about the weather data source."""
    return "This weather data is provided by Open-Meteo, a free open-source weather API!"

@app.prompt()
def pack_for_trip(location_name: str) -> str:
    """Ask an AI to help pack for a trip based on the weather."""
    return f"I am taking a trip to {location_name}. Can you check the weather forecast for that location and tell me what clothes I should pack?"

# The magic line that turns this into a Swagger UI!
instrument(app, ui=True, ui_port=8000)

if __name__ == "__main__":
    print("Starting Open-Meteo Weather MCP Server...")
    app.run()
```

When you run this script (`python example.py`), it will start your standard MCP server on `stdio` while launching the **MCP Lens UI** in the background on `http://localhost:8000/mcp`. Open that URL in your browser to start exploring!

---

## 🧠 Architecture

MCP Lens operates uniquely to coexist with your production `stdio` MCP server without interfering with how LLM clients communicate with it.

1. **Instrumentation layer**: The `instrument(app)` function reaches into the internal FastAPI router of the `FastMCP` app.
2. **Metadata Aggregation**: It queries `/tools/list`, `/resources/list`, and `/prompts/list` endpoints to build an internal state (`AppState`) of your MCP endpoints.
3. **Background UI Server**: It spawns an independent FastAPI application running a Uvicorn ASGI server in a separate daemon thread on a specified port (default `8000`).
4. **Vite React Frontend**: The web UI (built with React + Tailwind + Vite) is bundled and served statically by the background FastAPI server. It communicates with the UI backend to dispatch simulated MCP requests dynamically.

Because the UI server runs on a completely distinct port/thread, your LLM client continues communicating natively over `stdio` undisturbed.

---

## 🤝 Contributing

Contributions are heavily welcomed! Whether it's fixing bugs, adding new features, or improving the frontend aesthetic.

1. Fork the repository
2. Create a feature branch
3. Submit a Pull Request

## 📄 License
MIT License
