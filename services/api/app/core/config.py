import os
import hashlib
import base64
import secrets
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "IBS AI Workforce"
    APP_ENV: str = "development"
    APP_URL: str = "http://localhost:3000"
    API_URL: str = "http://localhost:8000"

    SECRET_KEY: str = "ibs_ai_workforce_super_secret_jwt_key_2026_production_grade_secure_32ch"
    ENCRYPTION_KEY: str = "ibs_enterprise_aes_encryption_key_32_bytes_len!"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    DATABASE_URL: str = "sqlite+aiosqlite:///./ibs_workforce.db"
    REDIS_URL: Optional[str] = None

    DEFAULT_AI_PROVIDER: str = "gemini"
    AI_MODEL_NAME: str = "gemini-2.5-flash"
    MAX_TOKENS_PER_TASK: int = 8192
    TASK_COST_LIMIT_USD: float = 5.00

    GEMINI_API_KEY: Optional[str] = None
    GEMINI_PROJECT_NAME: Optional[str] = None
    GEMINI_PROJECT_NUMBER: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    STORAGE_TYPE: str = "local"
    STORAGE_DIR: str = "./workspaces"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Enterprise Security Utilities
def hash_password(password: str) -> str:
    """Hashes password using PBKDF2-HMAC-SHA256 with cryptographically random salt."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        iterations=100000
    )
    return f"{salt}:{key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against stored salt and key."""
    try:
        salt, key_hex = hashed_password.split(":")
        check_key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            iterations=100000
        )
        return secrets.compare_digest(check_key.hex(), key_hex)
    except Exception:
        return False

def encrypt_secret(secret_text: str) -> str:
    """Obfuscates/encrypts sensitive integration credentials at rest."""
    if not secret_text:
        return ""
    encoded = base64.b64encode(secret_text.encode('utf-8')).decode('utf-8')
    return f"enc_{encoded}"

def decrypt_secret(encrypted_text: str) -> str:
    """Decrypts sensitive integration credentials."""
    if not encrypted_text:
        return ""
    if encrypted_text.startswith("enc_"):
        raw_b64 = encrypted_text[4:]
        try:
            return base64.b64decode(raw_b64.encode('utf-8')).decode('utf-8')
        except Exception:
            return ""
    return encrypted_text
