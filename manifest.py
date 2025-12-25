import json
import httpx
import os
import sys
import re
from typing import Optional, List
from bs4 import BeautifulSoup

class ManifestFetcher:
    def __init__(self, manifest_url):
        self.manifest_url = manifest_url
        self.client = httpx.Client(timeout=10.0)

    def fetch_manifest_text(self, version: Optional[str] = None):
        """Fetches the manifest as raw text, optionally for a specific version."""
        url = self.manifest_url
        if version:
            # Assuming a standard naming convention: base_url/version/manifest.json
            # or appending version as a query parameter.
            # For this implementation, we'll try to find the manifest file in a versioned subfolder.
            if url.endswith('.json'):
                base = url.rsplit('/', 1)[0]
                url = f"{base}/{version}/manifest.json"
            else:
                url = f"{url.rstrip('/')}/{version}/manifest.json"

        try:
            response = self.client.get(url)
            response.raise_for_status()
            return response.text
        except httpx.HTTPStatusError as e:
            raise Exception(f"HTTP error fetching manifest: {e.response.status_code}")
        except httpx.RequestError as e:
            raise Exception(f"Network error fetching manifest: {e}")
        except Exception as e:
            raise Exception(f"An unexpected error occurred: {e}")

    def fetch_manifest_json(self, version: Optional[str] = None):
        """Fetches and parses the manifest as a JSON object."""
        text = self.fetch_manifest_text(version)
        try:
            return json.loads(text)
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse manifest JSON: {e}")

class VersionScanner:
    """
    Scrapes index pages to find available game versions.
    """
    def __init__(self):
        self.client = httpx.Client(timeout=10.0)

    def scan_versions(self, index_url: str) -> List[str]:
        """Scans an HTML index page for version strings (3 or 4 parts)."""
        try:
            response = self.client.get(index_url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Look for version patterns like 1.xxx.xxx or 1.xxx.xxx.xxxx
            version_regex = re.compile(r'\b\d+\.\d+\.\d+(?:\.\d+)?\b')
            versions = set()

            # Check all links
            for link in soup.find_all('a'):
                text = link.get_text()
                href = link.get('href', '')
                
                match_text = version_regex.search(text)
                if match_text:
                    versions.add(match_text.group())
                
                match_href = version_regex.search(href)
                if match_href:
                    versions.add(match_href.group())

            return sorted(list(versions), reverse=True)
        except Exception as e:
            print(f"VersionScanner Error: {e}")
            return []

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
        """Resolves MediaFire download page to direct link using BeautifulSoup."""
        try:
            response = self.client.get(url)
            soup = BeautifulSoup(response.text, "html.parser")
            link = soup.find('a', {'id': 'downloadButton'})
            if link and 'href' in link.attrs:
                return link['href']
        except Exception:
            pass
        return url

    def _resolve_fitgirl_link(self, url: str) -> str:
        """Resolves FitGirl repack page using BeautifulSoup."""
        try:
            response = self.client.get(url)
            soup = BeautifulSoup(response.text, "html.parser")
            # Find a link where the text contains 'torrent'
            link = soup.find('a', string=re.compile(r'torrent', re.IGNORECASE))
            if link and 'href' in link.attrs:
                return link['href']
        except Exception:
            pass
        return url

    def _resolve_elamigos_link(self, url: str) -> str:
        """Resolves ElAmigos page to a mirror link using BeautifulSoup."""
        try:
            response = self.client.get(url)
            soup = BeautifulSoup(response.text, "html.parser")
            # Find a link whose href contains 'mediafire.com'
            link = soup.find('a', href=re.compile(r'mediafire\.com'))
            if link and 'href' in link.attrs:
                return link['href']
        except Exception:
            pass
        return url

    def _resolve_cs_rin_link(self, url: str) -> str:
        return url