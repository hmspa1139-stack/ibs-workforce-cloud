import logging
from typing import Dict, Any, Tuple, Optional
import httpx
from app.core.config import settings
from app.integrations.base import BaseIntegrationAdapter

logger = logging.getLogger("ibs.ai.openai")

class OpenAIProviderAdapter(BaseIntegrationAdapter):
    def __init__(self):
        super().__init__("openai", "OpenAI Platform")
        self.api_key = settings.OPENAI_API_KEY
        self.model = "gpt-4o"

    async def test_connection(self, credentials: Dict[str, str], config: Dict[str, Any]) -> Tuple[bool, str]:
        key = credentials.get("api_key") or self.api_key
        if not key:
            return False, "Missing OpenAI API key. Configure OPENAI_API_KEY in environment or admin settings."
        
        try:
            url = "https://api.openai.com/v1/models"
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url, headers={"Authorization": f"Bearer {key}"})
                if res.status_code == 200:
                    return True, "Successfully connected to OpenAI API."
                return False, f"OpenAI returned HTTP {res.status_code}: {res.text[:200]}"
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
        if not self.api_key:
            return {
                "text": "",
                "tokens_in": 0,
                "tokens_out": 0,
                "success": False,
                "error": "OpenAI API key not configured"
            }

        url = "https://api.openai.com/v1/chat/completions"
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ],
            "max_tokens": max_output_tokens
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                res = await client.post(
                    url,
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
                )
                if res.status_code != 200:
                    return {
                        "text": "",
                        "tokens_in": 0,
                        "tokens_out": 0,
                        "success": False,
                        "error": f"OpenAI HTTP {res.status_code}: {res.text[:200]}"
                    }
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                usage = data.get("usage", {})
                return {
                    "text": content,
                    "tokens_in": usage.get("prompt_tokens", 0),
                    "tokens_out": usage.get("completion_tokens", 0),
                    "success": True,
                    "error": None
                }
        except Exception as e:
            return {
                "text": "",
                "tokens_in": 0,
                "tokens_out": 0,
                "success": False,
                "error": str(e)
            }
