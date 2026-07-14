from fastmcp import FastMCP
from mcp_lens import instrument

app = FastMCP("Calculator")

@app.tool()
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b

@app.tool()
def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b

# Instrument the app (which will start the UI server at port 8000)
instrument(app, ui=True, ui_port=8000)

if __name__ == "__main__":
    app.run()
