import os
import shutil
import zipfile
from typing import List, Dict, Any, Optional
from pathlib import Path
from app.core.config import settings

class WorkspaceFileSystem:
    """Manages an isolated directory workspace for a project."""

    def __init__(self, project_id: str):
        self.project_id = project_id
        base_dir = os.path.abspath(settings.STORAGE_DIR)
        self.root_path = os.path.join(base_dir, project_id)
        os.makedirs(self.root_path, exist_ok=True)

    def _resolve_safe_path(self, relative_path: str) -> str:
        """Prevents path traversal outside of the project workspace."""
        clean_rel = relative_path.lstrip("/\\")
        target_path = os.path.abspath(os.path.join(self.root_path, clean_rel))
        if not target_path.startswith(self.root_path):
            raise ValueError(f"Path traversal detected: {relative_path} is outside project workspace")
        return target_path

    def write_file(self, relative_path: str, content: str) -> str:
        safe_path = self._resolve_safe_path(relative_path)
        os.makedirs(os.path.dirname(safe_path), exist_ok=True)
        with open(safe_path, "w", encoding="utf-8") as f:
            f.write(content)
        return safe_path

    def read_file(self, relative_path: str) -> str:
        safe_path = self._resolve_safe_path(relative_path)
        if not os.path.exists(safe_path):
            raise FileNotFoundError(f"File {relative_path} does not exist in workspace")
        with open(safe_path, "r", encoding="utf-8", errors="replace") as f:
            return f.read()

    def delete_file(self, relative_path: str) -> bool:
        safe_path = self._resolve_safe_path(relative_path)
        if os.path.exists(safe_path):
            if os.path.isdir(safe_path):
                shutil.rmtree(safe_path)
            else:
                os.remove(safe_path)
            return True
        return False

    def list_files(self, relative_dir: str = "") -> List[Dict[str, Any]]:
        safe_dir = self._resolve_safe_path(relative_dir)
        results = []
        if not os.path.exists(safe_dir):
            return results

        for root, dirs, files in os.walk(safe_dir):
            for d in dirs:
                full_p = os.path.join(root, d)
                rel_p = os.path.relpath(full_p, self.root_path).replace("\\", "/")
                results.append({
                    "name": d,
                    "path": rel_p,
                    "type": "directory",
                    "size": 0
                })
            for f in files:
                full_p = os.path.join(root, f)
                rel_p = os.path.relpath(full_p, self.root_path).replace("\\", "/")
                size = os.path.getsize(full_p)
                results.append({
                    "name": f,
                    "path": rel_p,
                    "type": "file",
                    "size": size
                })
        return results

    def create_zip_archive(self) -> str:
        """Packs the entire workspace into a downloadable zip file."""
        zip_path = os.path.join(os.path.dirname(self.root_path), f"{self.project_id}_export.zip")
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(self.root_path):
                for file in files:
                    full_p = os.path.join(root, file)
                    rel_p = os.path.relpath(full_p, self.root_path)
                    zipf.write(full_p, rel_p)
        return zip_path
