from __future__ import annotations

import hashlib
import unicodedata
from typing import Iterable

import numpy as np

from backend.core.config import Settings

# intfloat/multilingual-e5-* models require these prefixes for correct retrieval.
# Passages (stored chunks) use "passage: ", queries use "query: ".
# Without these prefixes, cosine similarity degrades significantly.
_E5_MODELS = {
    "intfloat/multilingual-e5-base",
    "intfloat/multilingual-e5-large",
    "intfloat/multilingual-e5-small",
    "intfloat/e5-base",
    "intfloat/e5-large",
    "intfloat/e5-small",
    "intfloat/e5-base-v2",
    "intfloat/e5-large-v2",
    "intfloat/e5-small-v2",
}


class EmbeddingService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._model = None
        self.dimension = 768  # multilingual-e5-base output dimension
        self._attempted_load = False

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def embed_passages(self, texts: Iterable[str]) -> np.ndarray:
        """Embed document chunks for indexing (adds 'passage: ' prefix for E5)."""
        return self._embed_with_prefix(list(texts), prefix="passage: ")

    def embed_query(self, text: str) -> np.ndarray:
        """Embed a single search query (adds 'query: ' prefix for E5)."""
        return self._embed_with_prefix([text], prefix="query: ")

    def embed(self, texts: Iterable[str]) -> np.ndarray:
        """Raw embed — no prefix. Use embed_passages / embed_query instead."""
        return self._embed_with_prefix(list(texts), prefix="")

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    def _embed_with_prefix(self, texts: list[str], prefix: str) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.dimension), dtype=np.float32)
        self._maybe_load_model()
        if self._model is not None:
            prefixed = [f"{prefix}{t}" for t in texts] if prefix and self._needs_prefix() else texts
            vectors = self._model.encode(prefixed, normalize_embeddings=True)
            return np.asarray(vectors, dtype=np.float32)
        return np.stack([self._hash_embed(text) for text in texts]).astype(np.float32)

    def _needs_prefix(self) -> bool:
        return self.settings.embedding_model.strip().lower() in _E5_MODELS

    def _maybe_load_model(self) -> None:
        if self._attempted_load or not self.settings.enable_transformer_embeddings:
            return
        self._attempted_load = True
        try:
            from sentence_transformers import SentenceTransformer

            self._model = SentenceTransformer(self.settings.embedding_model)
            sample = self._model.encode(["dimension_check"], normalize_embeddings=True)
            self.dimension = int(sample.shape[1])
        except Exception:
            self._model = None

    def _hash_embed(self, text: str) -> np.ndarray:
        vector = np.zeros(self.dimension, dtype=np.float32)
        tokens = self._unicode_hash_tokens(text)
        if not tokens:
            return vector
        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            for i in range(0, len(digest), 2):
                idx = ((digest[i] << 8) + digest[i + 1]) % self.dimension
                vector[idx] += 1.0
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector /= norm
        return vector

    @staticmethod
    def _unicode_hash_tokens(text: str) -> list[str]:
        normalized = unicodedata.normalize("NFKC", text).casefold().strip()
        if not normalized:
            return []

        base_tokens: list[str] = []
        current: list[str] = []
        for char in normalized:
            if char.isalnum():
                current.append(char)
            else:
                if current:
                    base_tokens.append("".join(current))
                    current = []
        if current:
            base_tokens.append("".join(current))

        tokens: list[str] = []
        for token in base_tokens:
            if not token:
                continue
            tokens.append(token)
            if len(token) >= 4:
                tokens.extend(EmbeddingService._char_ngrams(token, 3))

        if tokens:
            return tokens

        compact = "".join(char for char in normalized if char.isalnum())
        if len(compact) >= 2:
            return EmbeddingService._char_ngrams(compact, 2)
        return [compact] if compact else []

    @staticmethod
    def _char_ngrams(value: str, n: int) -> list[str]:
        if n <= 0 or len(value) < n:
            return []
        return [value[index : index + n] for index in range(len(value) - n + 1)]
