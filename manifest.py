import json
import httpx
import os
import sys

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
