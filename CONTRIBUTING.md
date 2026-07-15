# Contributing to MCP Lens

First off, thank you for considering contributing to MCP Lens! It's people like you that make it such a great developer tool for the community.

## 🏗️ Project Structure

The repository is divided into three main directories:
1. **`mcp_lens/`**: The core Python package (FastAPI server wrapper for FastMCP).
2. **`ui/`**: The React frontend application (this is the actual interactive Swagger-like dashboard that gets bundled and served by the Python package).
3. **`showcase/`**: The promotional Vite/React showcase website (hosted on GitHub Pages).

## 🚀 Development Setup

### 1. Setting up the Python Package
To test changes to the backend API or core library logic:

```bash
# Clone the repository
git clone https://github.com/ashishnallana/mcp-lens.git
cd mcp-lens

# Install the package in editable mode
pip install -e .

# Run the example weather server to test your backend changes
python example.py
```

### 2. Setting up the Dashboard UI
To make changes to the interactive dashboard UI itself:

```bash
cd ui
npm install
npm run dev
```
*Note: When you are finished making changes to the UI, you **must** run `npm run build` in the `ui` directory so the Python backend can serve your newly compiled static assets.*

### 3. Setting up the Showcase Website
To make changes to the promotional landing page:

```bash
cd showcase
npm install
npm run dev
```

## 📜 Contribution Rules

1. **Keep it Beautiful**: Aesthetics are a core feature of MCP Lens. If you are modifying the React UI or Showcase, ensure your design choices match the existing dark-mode, glassmorphic aesthetic (e.g., matching border radiuses, gradients, and hover animations).
2. **Backward Compatibility**: MCP Lens is designed to be a frictionless drop-in wrapper. Please do not introduce breaking changes to the `instrument()` signature or require complex configuration steps without prior discussion in an Issue.
3. **Commit Messages**: Write clear, concise commit messages. (e.g., `fix: resolve component routing issue` or `feat: add support for new schema type`).
4. **Manual Testing**: Please manually test your changes thoroughly using the `example.py` server before submitting a Pull Request.

## 🤝 Submitting a Pull Request

1. Fork the repository and create your feature branch from `master`.
2. Make your changes following the rules above.
3. If you modified the `ui/`, ensure you ran `npm run build` and committed the updated `mcp_lens/static` files.
4. Push to your fork and submit a Pull Request.
5. Describe your changes in detail in the PR description. **If you made visual changes, please include screenshots or a GIF in your PR.**

## 🐛 Found a Bug or Have a Feature Request?

Please open an Issue on GitHub! If you are reporting a bug, please include:
- A clear description of the problem.
- Steps to reproduce.
- Your OS, Python version, and Browser.
- Any relevant logs or screenshots.

Thank you for contributing! 🚀
