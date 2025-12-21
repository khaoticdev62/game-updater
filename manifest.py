import json
import httpx
import os
import sys
import re

# Optional: Add curl_cffi for impersonation if needed based on research
# from curl_cffi import requests as curl_requests 

class ManifestFetcher:
    def __init__(self, manifest_url):
        self.manifest_url = manifest_url
        # For now, we'll use httpx. If curl_cffi is strictly needed,
        # it can be integrated here, but httpx is generally easier.
        self.client = httpx.Client(timeout=10.0) # Using httpx as it's more Pythonic and modern

    def fetch_manifest_text(self):
        """Fetches the manifest as raw text."""
        try:
            response = self.client.get(self.manifest_url)
            response.raise_for_status() # Raise an exception for HTTP errors
            return response.text
        except httpx.HTTPStatusError as e:
            raise Exception(f"HTTP error fetching manifest: {e.response.status_code} - {e.response.text}")
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
        self.client = httpx.Client(timeout=10.0, follow_redirects=True)

    def resolve_url(self, url):
        """Resolves a URL, following redirects and attempting to get a direct link."""
        try:
            # Special handling for MediaFire as observed in original tool research
            if "mediafire.com" in url:
                return self._resolve_mediafire_link(url)
            
            # Default behavior: just follow redirects
            response = self.client.head(url) # Use HEAD to avoid downloading large files
            response.raise_for_status()
            return str(response.url) # Final URL after redirects
        except httpx.HTTPStatusError as e:
            raise Exception(f"HTTP error resolving URL: {e.response.status_code} - {e.response.text}")
        except httpx.RequestError as e:
            raise Exception(f"Network error resolving URL: {e}")
        except Exception as e:
            raise Exception(f"An unexpected error occurred: {e}")

    def _resolve_mediafire_link(self, url):
        """Attempts to resolve a MediaFire download page to a direct download link."""
        # This is a simplified example based on common MediaFire patterns.
        # Real-world MediaFire resolution might involve parsing HTML with BeautifulSoup.
        response = self.client.get(url)
        response.raise_for_status()
        
        # Look for direct download link in the HTML
        # This regex is a placeholder and would need to be refined based on actual MediaFire page structure
        match = re.search(r'href="(https?://.*?mediafire.com/file/.+?)"', response.text)
        if match:
            return match.group(1)
        
        # If no direct link found, return the original URL or raise an error
        return url 
