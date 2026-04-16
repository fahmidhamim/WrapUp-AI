from __future__ import annotations

import json
from pathlib import Path

import numpy as np


class FaissStore:
    def __init__(self, root_dir: Path):
        self.root_dir = root_dir
        self.root_dir.mkdir(parents=True, exist_ok=True)
        import faiss

        self.faiss = faiss

    def _index_path(self, session_id: str) -> Path:
        return self.root_dir / f"{session_id}.index"

    def _meta_path(self, session_id: str) -> Path:
        return self.root_dir / f"{session_id}.json"

    def save(self, session_id: str, vectors: np.ndarray, chunks: list[str]) -> None:
        if vectors.shape[0] != len(chunks):
            raise ValueError("vectors/chunks length mismatch")
        if vectors.shape[0] == 0:
            return
        dim = vectors.shape[1]
        index = self.faiss.IndexFlatIP(dim)
        index.add(vectors.astype(np.float32))
        self.faiss.write_index(index, str(self._index_path(session_id)))
        self._meta_path(session_id).write_text(json.dumps({"chunks": chunks}), encoding="utf-8")

    def delete_session(self, session_id: str) -> bool:
        """Delete the FAISS index and metadata for a session. Returns True if deleted."""
        deleted = False
        for path in (self._index_path(session_id), self._meta_path(session_id)):
            if path.exists():
                path.unlink()
                deleted = True
        return deleted

    def list_sessions(self) -> list[str]:
        """Return session IDs that have a FAISS index on disk."""
        return [
            p.stem
            for p in self.root_dir.glob("*.index")
        ]

    def search(self, session_id: str, query_vector: np.ndarray, top_k: int) -> list[str]:
        index_path = self._index_path(session_id)
        meta_path = self._meta_path(session_id)
        if not index_path.exists() or not meta_path.exists():
            return []
        index = self.faiss.read_index(str(index_path))
        metadata = json.loads(meta_path.read_text(encoding="utf-8"))
        chunks = metadata.get("chunks", [])
        scores, ids = index.search(query_vector.astype(np.float32), top_k)
        results: list[str] = []
        for idx in ids[0]:
            if idx < 0:
                continue
            if idx < len(chunks):
                results.append(chunks[idx])
        return results

