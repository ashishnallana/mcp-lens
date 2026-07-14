# MCP Lens

Swagger UI & Developer Tools for the Model Context Protocol.

## Installation

```bash
pip install mcp-lens
```

## Usage

```python
from fastmcp import FastMCP
from mcp_lens import instrument

app = FastMCP("Calculator")

instrument(app, ui=True)

app.run()
```
