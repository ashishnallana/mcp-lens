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
