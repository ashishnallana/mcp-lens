import asyncio
from fastmcp import FastMCP

app = FastMCP("Test")

@app.prompt()
def pack_for_trip(location_name: str) -> str:
    return f"Trip to {location_name}"

async def main():
    print("Without arg:")
    try:
        print(await app.render_prompt("pack_for_trip", {}))
    except Exception as e:
        print(e)
    print("With arg:")
    print(await app.render_prompt("pack_for_trip", {"location_name": "Paris"}))

if __name__ == "__main__":
    asyncio.run(main())
