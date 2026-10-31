import json
import logging
from typing import Dict, Any, Tuple, Optional, List
import httpx
from app.core.config import settings
from app.integrations.base import BaseIntegrationAdapter

logger = logging.getLogger("ibs.ai.gemini")

CANDIDATE_MODELS = ["gemini-3.8-flash", "gemini-2.5-pro", "gemini-flash-latest"]

class GeminiProviderAdapter(BaseIntegrationAdapter):
    def __init__(self):
        super().__init__("gemini", "Google Gemini API")
        self.api_key = settings.GEMINI_API_KEY
        self.model = settings.AI_MODEL_NAME or "gemini-3.8-flash"

    async def test_connection(self, credentials: Dict[str, str], config: Dict[str, Any]) -> Tuple[bool, str]:
        key = credentials.get("api_key") or self.api_key
        if not key:
            return False, "Missing Gemini API key. Please configure GEMINI_API_KEY."
        
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models?key={key}"
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    return True, f"Connected to Gemini API. Available models: {len(models)}"
                return False, f"Gemini API returned HTTP {res.status_code}: {res.text[:150]}"
        except Exception as e:
            return False, f"Connection failed: {str(e)}"

    def requires_approval_for_action(self, action_type: str) -> bool:
        return False

    async def generate_content(
        self,
        system_instruction: str,
        user_prompt: str,
        response_schema: Optional[Dict[str, Any]] = None,
        max_output_tokens: int = 4096
    ) -> Dict[str, Any]:
        """Calls Google Gemini with fast fallback across candidate models."""
        if not self.api_key:
            return {"text": "", "tokens_in": 0, "tokens_out": 0, "success": False, "error": "No API key"}

        models_to_try = [self.model] + [m for m in CANDIDATE_MODELS if m != self.model]

        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.api_key}"
            payload: Dict[str, Any] = {
                "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
                "generationConfig": {"temperature": 0.4, "maxOutputTokens": max_output_tokens}
            }

            if system_instruction:
                payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}
            if response_schema:
                payload["generationConfig"]["responseMimeType"] = "application/json"

            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    res = await client.post(url, json=payload, headers={"Content-Type": "application/json"})
                    if res.status_code == 200:
                        data = res.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            text_content = "".join([p.get("text", "") for p in parts])
                            usage = data.get("usageMetadata", {})
                            tokens_in = usage.get("promptTokenCount", len(user_prompt) // 4)
                            tokens_out = usage.get("candidatesTokenCount", len(text_content) // 4)
                            return {
                                "text": text_content,
                                "tokens_in": tokens_in,
                                "tokens_out": tokens_out,
                                "success": True,
                                "error": None
                            }
                    logger.info(f"Gemini {model_name} HTTP {res.status_code}. Trying next candidate if available...")
            except Exception as e:
                logger.info(f"Gemini {model_name} timed out or failed: {e}. Trying next candidate...")

        return {
            "text": "",
            "tokens_in": 0,
            "tokens_out": 0,
            "success": False,
            "error": "All Gemini candidate models unavailable or busy."
        }
