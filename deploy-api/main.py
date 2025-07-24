"""
Main entry point for PUO Memo Platform API
Serves both the API and static landing page
"""
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Import the auth-enabled API
from src.api.auth_server import app as api_app

# Mount static files
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    api_app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Override root to serve landing page
@api_app.get("/", include_in_schema=False)
async def serve_landing_page():
    """Serve the landing page instead of API root"""
    index_file = static_dir / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    else:
        # Fallback to API info if no landing page
        return {
            "name": "PUO Memo Platform API",
            "version": "2.0.0",
            "status": "operational",
            "documentation": "/docs",
            "signup": "POST /auth/register"
        }

# Export the app for Railway/Uvicorn
app = api_app

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)