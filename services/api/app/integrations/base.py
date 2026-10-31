from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple

class BaseIntegrationAdapter(ABC):
    def __init__(self, provider_key: str, name: str):
        self.provider_key = provider_key
        self.name = name

    @abstractmethod
    async def test_connection(self, credentials: Dict[str, str], config: Dict[str, Any]) -> Tuple[bool, str]:
        """Tests live connection with the provider using provided credentials."""
        pass

    @abstractmethod
    def requires_approval_for_action(self, action_type: str) -> bool:
        """Determines if the action requires owner approval before execution."""
        pass
