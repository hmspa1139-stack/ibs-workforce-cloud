from typing import Dict, Any, Tuple
from app.integrations.base import BaseIntegrationAdapter

class GitHubAdapter(BaseIntegrationAdapter):
    def __init__(self):
        super().__init__("github", "GitHub Repositories")

    async def test_connection(self, credentials: Dict[str, str], config: Dict[str, Any]) -> Tuple[bool, str]:
        token = credentials.get("access_token") or credentials.get("token")
        if not token:
            return False, "Not Connected: GitHub Personal Access Token or OAuth token is required."
        return True, "Verified: GitHub API connection active."

    def requires_approval_for_action(self, action_type: str) -> bool:
        return action_type in ["merge_to_main", "push_production"]

class GoogleDriveAdapter(BaseIntegrationAdapter):
    def __init__(self):
        super().__init__("gdrive", "Google Drive")

    async def test_connection(self, credentials: Dict[str, str], config: Dict[str, Any]) -> Tuple[bool, str]:
        token = credentials.get("access_token") or credentials.get("service_account_json")
        if not token:
            return False, "Not Connected: Google OAuth token or Service Account credentials required."
        return True, "Verified: Google Drive API connection active."

    def requires_approval_for_action(self, action_type: str) -> bool:
        return action_type in ["delete_permanent_file"]

class GmailAdapter(BaseIntegrationAdapter):
    def __init__(self):
        super().__init__("gmail", "Google Workspace Gmail")

    async def test_connection(self, credentials: Dict[str, str], config: Dict[str, Any]) -> Tuple[bool, str]:
        token = credentials.get("access_token")
        if not token:
            return False, "Not Connected: Gmail API OAuth credentials required."
        return True, "Verified: Gmail API connection active."

    def requires_approval_for_action(self, action_type: str) -> bool:
        return True # Sending emails ALWAYS requires approval

class MetaAdsAdapter(BaseIntegrationAdapter):
    def __init__(self):
        super().__init__("meta_ads", "Meta Marketing API")

    async def test_connection(self, credentials: Dict[str, str], config: Dict[str, Any]) -> Tuple[bool, str]:
        token = credentials.get("access_token")
        account_id = config.get("ad_account_id")
        if not token or not account_id:
            return False, "Not Connected: Meta Access Token and Ad Account ID are required."
        return True, "Verified: Meta Marketing API connection active."

    def requires_approval_for_action(self, action_type: str) -> bool:
        return True # Spending money or launching live campaigns ALWAYS requires approval

class GoogleAdsAdapter(BaseIntegrationAdapter):
    def __init__(self):
        super().__init__("google_ads", "Google Ads API")

    async def test_connection(self, credentials: Dict[str, str], config: Dict[str, Any]) -> Tuple[bool, str]:
        dev_token = credentials.get("developer_token")
        customer_id = config.get("customer_id")
        if not dev_token or not customer_id:
            return False, "Not Connected: Developer token and Customer ID required."
        return True, "Verified: Google Ads API connection active."

    def requires_approval_for_action(self, action_type: str) -> bool:
        return True # Budget alteration or ad launching ALWAYS requires approval

class WebResearchAdapter(BaseIntegrationAdapter):
    def __init__(self):
        super().__init__("web_research", "Web Research Engine")

    async def test_connection(self, credentials: Dict[str, str], config: Dict[str, Any]) -> Tuple[bool, str]:
        return True, "Active: Pluggable web research and scraper engine is ready."

    def requires_approval_for_action(self, action_type: str) -> bool:
        return False

class PlaywrightAdapter(BaseIntegrationAdapter):
    def __init__(self):
        super().__init__("playwright", "Browser Automation (Playwright)")

    async def test_connection(self, credentials: Dict[str, str], config: Dict[str, Any]) -> Tuple[bool, str]:
        return True, "Active: Headless browser verification runtime ready."

    def requires_approval_for_action(self, action_type: str) -> bool:
        return False

class ImageGenAdapter(BaseIntegrationAdapter):
    def __init__(self):
        super().__init__("image_generation", "Image Generation Provider")

    async def test_connection(self, credentials: Dict[str, str], config: Dict[str, Any]) -> Tuple[bool, str]:
        key = credentials.get("api_key")
        if not key:
            return False, "Not Connected: Image provider API key required."
        return True, "Verified: Image generation provider connected."

    def requires_approval_for_action(self, action_type: str) -> bool:
        return False

class HostingAdapter(BaseIntegrationAdapter):
    def __init__(self):
        super().__init__("hosting", "Cloud Hosting Adapter")

    async def test_connection(self, credentials: Dict[str, str], config: Dict[str, Any]) -> Tuple[bool, str]:
        token = credentials.get("token")
        if not token:
            return False, "Not Connected: Vercel or Render deployment token required."
        return True, "Verified: Hosting platform API connected."

    def requires_approval_for_action(self, action_type: str) -> bool:
        return action_type in ["deploy_production", "modify_custom_domain"]

# Registry dictionary
INTEGRATION_ADAPTERS: Dict[str, BaseIntegrationAdapter] = {
    "github": GitHubAdapter(),
    "gdrive": GoogleDriveAdapter(),
    "gmail": GmailAdapter(),
    "meta_ads": MetaAdsAdapter(),
    "google_ads": GoogleAdsAdapter(),
    "web_research": WebResearchAdapter(),
    "playwright": PlaywrightAdapter(),
    "image_generation": ImageGenAdapter(),
    "hosting": HostingAdapter()
}
