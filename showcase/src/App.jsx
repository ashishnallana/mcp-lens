import React, { useEffect, useState } from 'react';
import { 
  Terminal, Search, Play, Settings, Database, 
  ChevronRight, Package, Copy, Check
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import './index.css';
import heroImg from './assets/img1.png';

const Github = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

// Component: Navbar
const Navbar = () => (
  <nav style={{
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    background: 'rgba(11, 15, 20, 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--color-border)',
    padding: '16px 0'
  }}>
    <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/logo.png" alt="MCP Lens Logo" style={{ height: '32px', borderRadius: '8px' }} />
      </div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <a href="https://github.com/ashishnallana/mcp-lens" target="_blank" rel="noreferrer" style={{ color: 'var(--color-text-secondary)', transition: 'color 0.2s' }}>
          <Github size={24} />
        </a>
        <a href="https://pypi.org/project/mcp-lens-ui/" target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '14px' }}>
          <Package size={18} /> PyPI
        </a>
      </div>
    </div>
  </nav>
);

// Component: Hero
const Hero = () => (
  <section className="section hero-section">
    <div className="ambient-glow" style={{ top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px' }} />
    
    <div className="container">
      <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--color-border)', color: 'var(--color-highlight)', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}>
        ✨ v0.1.5 is now live on PyPI
      </div>
      
      <h1 className="hero-title">
        The <span className="text-gradient">Swagger UI</span> for<br/>Model Context Protocol
      </h1>
      
      <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
        Instantly generate a beautiful, interactive testing dashboard for your MCP servers. No frontend code required. Plug and play in one line of code.
      </p>
      
      <div className="hero-buttons">
        <a href="#quickstart" className="btn-primary">
          Get Started <ChevronRight size={18} />
        </a>
        <a href="https://github.com/ashishnallana/mcp-lens" target="_blank" rel="noreferrer" className="btn-secondary">
          <Github size={18} /> View Source
        </a>
      </div>
      
      {/* UI Mockup */}
      <div style={{ position: 'relative', margin: '0 auto', maxWidth: '1000px', animation: 'float 6s ease-in-out infinite' }}>
        <div style={{ position: 'absolute', inset: -20, background: 'linear-gradient(180deg, var(--color-primary), transparent)', filter: 'blur(40px)', opacity: 0.2, borderRadius: '24px', zIndex: 0 }} />
        <img 
          src={heroImg} 
          alt="MCP Lens Dashboard" 
          style={{ position: 'relative', zIndex: 1, width: '100%', borderRadius: '12px', border: '1px solid var(--color-border)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} 
        />
      </div>
    </div>
  </section>
);

// Component: Features
const Features = () => (
  <section id="features" className="section" style={{ background: 'rgba(245, 158, 11, 0.02)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
    <div className="container">
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 className="section-title">Everything you need to debug MCP</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Stop testing your agents blindly. Get a visual dashboard instantly.</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Settings size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Auto-Generated Forms</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>MCP Lens automatically parses your Pydantic schemas and generates beautiful, type-safe forms to execute your tools.</p>
        </div>
        
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Play size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Interactive Prompts</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Test your dynamically generated LLM prompts directly in the browser by passing arguments and viewing the raw payload.</p>
        </div>
        
        <div className="glass-panel" style={{ padding: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Database size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '12px' }}>Live Execution History</h3>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>Monitor a live-updating ledger of every request and response made by your agents against your MCP server.</p>
        </div>
      </div>
    </div>
  </section>
);

// Component: CodeBlock
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="code-window" style={{ position: 'relative', margin: '20px 0' }}>
      <div className="code-header">
        <div className="code-dot red" />
        <div className="code-dot yellow" />
        <div className="code-dot green" />
        <button 
          onClick={copy}
          style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
          <span style={{ fontSize: '12px' }}>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="code-body">
        {code}
      </div>
    </div>
  );
};

// Component: Quickstart
const Quickstart = () => (
  <section id="quickstart" className="section">
    <div className="container">
      <div className="grid-2">
        <div>
          <h2 className="section-title">Plug and play.</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: '32px', lineHeight: 1.6 }}>
            MCP Lens is designed to be invisible when you don't need it, and incredibly powerful when you do. Just wrap your <code>FastMCP</code> instance.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>1. Install the package</h4>
              <CodeBlock code="pip install mcp-lens-ui" />
            </div>
            <div>
              <h4 style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>2. Instrument your app</h4>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '12px' }}>Simply import <code>instrument</code> and wrap your app. Here is a complete working example of a weather agent server:</p>
            </div>
          </div>
        </div>
        
        <div style={{ position: 'relative' }}>
          <div className="ambient-glow" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(217, 119, 6, 0.2) 0%, transparent 70%)' }} />
          <CodeBlock code={`import httpx
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

# Your UI is now live at http://localhost:8000/mcp`} />
        </div>
      </div>
    </div>
  </section>
);

// Component: Footer
const Footer = () => (
  <footer style={{ borderTop: '1px solid var(--color-border)', padding: '40px 0', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
    <div className="container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
        <img src="/logo.png" alt="MCP Lens Logo" style={{ height: '24px', borderRadius: '6px' }} />
      </div>
      <p style={{ fontSize: '14px', marginBottom: '24px' }}>Built for the modern AI developer. Open source under the MIT License.</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
        <a href="https://github.com/ashishnallana/mcp-lens" target="_blank" rel="noreferrer" style={{ transition: 'color 0.2s' }}>GitHub</a>
        <a href="https://pypi.org/project/mcp-lens-ui/" target="_blank" rel="noreferrer" style={{ transition: 'color 0.2s' }}>PyPI</a>
      </div>
    </div>
  </footer>
);

export default function App() {
  useEffect(() => {
    // Reveal animation logic
    const handleScroll = () => {
      // Very basic reveal logic could go here if we added ref classes
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Helmet>
        <title>MCP Lens - The Swagger UI for Model Context Protocol</title>
        <meta name="description" content="Instantly generate a beautiful, interactive testing dashboard for your MCP servers. No frontend code required. Plug and play in one line of code." />
        <meta name="keywords" content="MCP, Model Context Protocol, Swagger UI, LLM tools, agent testing, fastmcp, python, developer tools, dashboard" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="MCP Lens - The Swagger UI for Model Context Protocol" />
        <meta property="og:description" content="Instantly generate a beautiful, interactive testing dashboard for your MCP servers. No frontend code required." />
        <meta property="og:image" content="https://ashishnallana.github.io/mcp-lens/icon.png" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="MCP Lens - The Swagger UI for Model Context Protocol" />
        <meta property="twitter:description" content="Instantly generate a beautiful, interactive testing dashboard for your MCP servers. No frontend code required." />
        <meta property="twitter:image" content="https://ashishnallana.github.io/mcp-lens/icon.png" />
        
        <link rel="canonical" href="https://ashishnallana.github.io/mcp-lens/" />
      </Helmet>
      <Navbar />
      <Hero />
      <Features />
      <Quickstart />
      <Footer />
    </>
  );
}
