from __future__ import annotations

import io
from dataclasses import dataclass

from structlog import get_logger

from backend.core.config import Settings

logger = get_logger(__name__)


@dataclass(slots=True)
class R2StorageService:
    settings: Settings
    _client: object = None  # boto3 S3 client, lazy-initialised

    def is_available(self) -> bool:
        return bool(
            self.settings.r2_access_key_id
            and self.settings.r2_secret_access_key
            and self.settings.r2_bucket_name
            and (self.settings.r2_endpoint_url or self.settings.r2_account_id)
        )

    def _endpoint_url(self) -> str:
        if self.settings.r2_endpoint_url:
            return self.settings.r2_endpoint_url.rstrip("/")
        return f"https://{self.settings.r2_account_id}.r2.cloudflarestorage.com"

    def _get_client(self):
        if self._client is None:
            import boto3
            self._client = boto3.client(
                "s3",
                endpoint_url=self._endpoint_url(),
                aws_access_key_id=self.settings.r2_access_key_id,
                aws_secret_access_key=self.settings.r2_secret_access_key,
                region_name="auto",
            )
        return self._client

    def upload_bytes(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> None:
        client = self._get_client()
        client.put_object(
            Bucket=self.settings.r2_bucket_name,
            Key=key,
            Body=io.BytesIO(data),
            ContentType=content_type,
        )
        logger.info("r2_upload_complete", key=key, size=len(data))

    def generate_presigned_download_url(self, key: str, expires_in: int = 3600) -> str:
        if self.settings.r2_public_domain:
            domain = self.settings.r2_public_domain.rstrip("/")
            return f"{domain}/{key}"
        client = self._get_client()
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.settings.r2_bucket_name, "Key": key},
            ExpiresIn=expires_in,
        )
        return url

    def delete_object(self, key: str) -> None:
        try:
            client = self._get_client()
            client.delete_object(Bucket=self.settings.r2_bucket_name, Key=key)
            logger.info("r2_delete_complete", key=key)
        except Exception as exc:
            logger.warning("r2_delete_failed", key=key, error=str(exc))
