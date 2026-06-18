from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import subprocess
import logging

REPO_ROOT = Path("/home/alecred/Desktop/projects/saint-veyre-chronicle/")
logger = logging.getLogger(__name__)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chatgpt.com"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

class DeployRequest(BaseModel):
    path: str       # relative to REPO_ROOT, e.g. "docs/topic/page.md"
    content: str
    action: str     # "create" or "update"

def convert_linebreaks(content: str) -> str:
    """Replace line breaks with <br> tags, preserving paragraph breaks."""
    content = content.replace('\n\n', '<br><br>')
    content = content.replace('\n', '<br>')
    return content

def validate_path(path: str) -> Path:
    """Validate that the path is within the repo root."""
    target = (REPO_ROOT / path).resolve()
    if not str(target).startswith(str(REPO_ROOT.resolve())):
        raise HTTPException(status_code=400, detail="Invalid path: outside repo root")
    return target

def run_git_command(cmd: list, cwd: Path) -> str:
    """Execute a git command and return output."""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            check=True,
            capture_output=True,
            text=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        logger.error(f"Git command failed: {' '.join(cmd)}\n{e.stderr}")
        raise HTTPException(status_code=500, detail=f"Git operation failed: {e.stderr}")

@app.post("/deploy")
def deploy(req: DeployRequest):
    # Validate action
    if req.action not in ("create", "update"):
        raise HTTPException(status_code=400, detail="action must be 'create' or 'update'")
    
    # Validate and resolve path
    target = validate_path(req.path)
    
    # Convert line breaks
    converted_content = convert_linebreaks(req.content)
    
    # Create parent directories if needed
    target.parent.mkdir(parents=True, exist_ok=True)
    
    # Write file
    try:
        target.write_text(converted_content, encoding="utf-8")
    except IOError as e:
        logger.error(f"Failed to write file {target}: {e}")
        raise HTTPException(status_code=500, detail="Failed to write file")
    
    # Git operations
    run_git_command(["git", "add", str(target)], REPO_ROOT)
    run_git_command(
        ["git", "commit", "-m", f"{req.action}: {target.name}"],
        REPO_ROOT
    )
    run_git_command(["git", "push"], REPO_ROOT)
    
    # Get commit hash
    commit = run_git_command(["git", "rev-parse", "--short", "HEAD"], REPO_ROOT)
    
    return {
        "status": "ok",
        "action": req.action,
        "path": req.path,
        "commit": commit
    }
