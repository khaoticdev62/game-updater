import json
import httpx
import os
import sys
import re
from typing import Optional

class ManifestFetcher:
    def __init__(self, manifest_url):
        self.manifest_url = manifest_url
        self.client = httpx.Client(timeout=10.0)

    def fetch_manifest_text(self):
        """Fetches the manifest as raw text."""
        try:
            response = self.client.get(self.manifest_url)
            response.raise_for_status()
            return response.text
        except httpx.HTTPStatusError as e:
            raise Exception(f"HTTP error fetching manifest: {e.response.status_code}")
        except httpx.RequestError as e:
            raise Exception(f"Network error fetching manifest: {e}")
        except Exception as e:
            raise Exception(f"An unexpected error occurred: {e}")

    def fetch_manifest_json(self):
        """Fetches and parses the manifest as a JSON object."""
        text = self.fetch_manifest_text()
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse manifest JSON: {e}")

class URLResolver:
    def __init__(self):
        self.client = httpx.Client(timeout=10.0, follow_redirects=False)

    def resolve_url(self, url: str, depth: int = 0) -> str:
        """
        Resolves a URL dynamically, handling redirectors and direct links.
        Recursive up to 3 levels to handle chained redirectors.
        """
        if depth > 3:
            return url

        # 1. Check for known redirector patterns
        resolved = url
        if "mediafire.com" in url and ("/file/" in url or "/view/" in url):
            resolved = self._resolve_mediafire_link(url)
        elif "fitgirl-repacks.site" in url:
            resolved = self._resolve_fitgirl_link(url)
        elif "elamigos.site" in url:
            resolved = self._resolve_elamigos_link(url)
        elif "cs.rin.ru" in url:
            resolved = self._resolve_cs_rin_link(url)

        if resolved != url:
            return self.resolve_url(resolved, depth + 1)

        # 2. Default behavior: follow redirects manually
        if any(url.lower().endswith(ext) for ext in [".torrent", ".zip", ".rar", ".7z", ".exe"]):
            return url

        try:
            response = self.client.head(url)
            if response.status_code in [301, 302, 303, 307, 308]:
                redirect_url = response.headers.get("Location")
                if redirect_url:
                    if redirect_url.startswith("/"):
                        from urllib.parse import urljoin
                        redirect_url = urljoin(url, redirect_url)
                    return self.resolve_url(redirect_url, depth + 1)
            
            return str(response.url)
        except Exception:
            return url

    def _resolve_mediafire_link(self, url: str) -> str:
        """Resolves MediaFire download page to direct link."""
        try:
            response = self.client.get(url)
            # More flexible MediaFire regex
            match = re.search(r'href="(https?://download[^"]+mediafire\.com/[^"]+)"', response.text)
            if match:
                return match.group(1)
        except Exception:
            pass
        return url

    def _resolve_fitgirl_link(self, url: str) -> str:
        """Resolves FitGirl repack page to a preferred download link (e.g. Torrent)."""
        try:
            response = self.client.get(url)
            match = re.search(r'href="([^"]+\.torrent)"', response.text)
            if match:
                return match.group(1)
        except Exception:
            pass
        return url

    def _resolve_elamigos_link(self, url: str) -> str:
        """Resolves ElAmigos page to a mirror link."""
        try:
            response = self.client.get(url)
            # Match any mediafire link on the page
            match = re.search(r'href="(https?://[^"]*mediafire\.com/[^"]+)"', response.text)
            if match:
                return match.group(1)
        except Exception:
            pass
        return url

    def _resolve_cs_rin_link(self, url: str) -> str:
        return url
