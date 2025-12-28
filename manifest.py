"""
Manifest module for fetching, parsing, and resolving manifest files and URLs.

Provides:
- ManifestFetcher: Fetches manifest JSON from configured URLs
- VersionScanner: Scans index pages to find available game versions
- URLResolver: Resolves download URLs, handling redirects and content delivery sites
"""

import json
import httpx
import os
import sys
import re
from typing import Optional, List
from bs4 import BeautifulSoup
from logging_system import get_logger

# Setup logging
logger = get_logger()

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
        """
        Scans an HTML index page for version strings (3 or 4 parts).

        Args:
            index_url: URL to index page containing version links

        Returns:
            List of discovered versions sorted in descending order (newest first)

        Raises:
            httpx.HTTPStatusError: If HTTP request fails
            httpx.RequestError: If network error occurs
            Exception: For other parsing errors
        """
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

            logger.info(f"Discovered {len(versions)} versions from {index_url}")
            return sorted(list(versions), reverse=True)
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error scanning versions from {index_url}: {e.response.status_code}")
            raise
        except httpx.RequestError as e:
            logger.error(f"Network error scanning versions from {index_url}: {e}")
            raise
        except Exception as e:
            logger.exception(f"Unexpected error scanning versions: {e}")
            raise

class URLResolver:
    def __init__(self):
        self.client = httpx.Client(timeout=10.0, follow_redirects=False)

    def resolve_url(self, url: str, depth: int = 0) -> str:
        """
        Resolves a URL dynamically, handling redirectors and direct links.

        Implements site-specific resolution for known CDN/redirector services,
        then falls back to manual redirect following for standard HTTP redirects.

        Recursion limit of 3 prevents infinite redirect loops.

        Args:
            url: URL to resolve
            depth: Current recursion depth (incremented on each redirect)

        Returns:
            Final resolved URL

        Raises:
            httpx.RequestError: If unable to reach the URL (after retries)
            Exception: For unexpected errors during resolution
        """
        if depth > 3:
            logger.warning(f"Redirect recursion limit reached for URL: {url}")
            return url

        # 1. Check for known redirector patterns
        resolved = url
        try:
            if "mediafire.com" in url and ("/file/" in url or "/view/" in url):
                resolved = self._resolve_mediafire_link(url)
            elif "fitgirl-repacks.site" in url:
                resolved = self._resolve_fitgirl_link(url)
            elif "elamigos.site" in url:
                resolved = self._resolve_elamigos_link(url)
            elif "rexagames.com" in url:
                resolved = self._resolve_rexagames_link(url)
            elif "multiup.io" in url:
                resolved = self._resolve_multiup_link(url)
            elif "cs.rin.ru" in url:
                resolved = self._resolve_cs_rin_link(url)

            if resolved != url:
                logger.debug(f"Resolved redirector URL: {url} -> {resolved}")
                return self.resolve_url(resolved, depth + 1)

            # 2. Default behavior: follow redirects manually
            if any(url.lower().endswith(ext) for ext in [".torrent", ".zip", ".rar", ".7z", ".exe"]):
                logger.debug(f"Direct download file detected: {url}")
                return url

            response = self.client.head(url)
            if response.status_code in [301, 302, 303, 307, 308]:
                redirect_url = response.headers.get("Location")
                if redirect_url:
                    if redirect_url.startswith("/"):
                        from urllib.parse import urljoin
                        redirect_url = urljoin(url, redirect_url)
                    logger.debug(f"Following HTTP redirect: {url} -> {redirect_url}")
                    return self.resolve_url(redirect_url, depth + 1)

            logger.debug(f"URL resolved to: {response.url}")
            return str(response.url)
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error resolving URL {url}: {e.response.status_code}")
            raise
        except httpx.RequestError as e:
            logger.error(f"Network error resolving URL {url}: {e}")
            return url
        except Exception as e:
            logger.exception(f"Unexpected error resolving URL {url}: {e}")
            return url

    def _resolve_mediafire_link(self, url: str) -> str:
        """
        Resolves MediaFire download page to direct link using BeautifulSoup.

        Extracts the download button href from MediaFire page HTML.

        Args:
            url: MediaFire download page URL

        Returns:
            Direct download URL if found, otherwise original URL

        Raises:
            httpx.RequestError: If unable to fetch the page (caller handles fallback)
        """
        try:
            response = self.client.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            link = soup.find('a', {'id': 'downloadButton'})
            if link and 'href' in link.attrs:
                direct_url = link['href']
                logger.info(f"Extracted MediaFire direct link from {url}")
                return direct_url
            logger.warning(f"Could not find download button on MediaFire page: {url}")
            return url
        except httpx.RequestError as e:
            logger.error(f"Failed to fetch MediaFire page {url}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error parsing MediaFire page {url}: {e}")
            return url

    def _resolve_fitgirl_link(self, url: str) -> str:
        """
        Resolves FitGirl repack page using BeautifulSoup.

        Extracts the torrent download link from FitGirl page HTML.

        Args:
            url: FitGirl repack page URL

        Returns:
            Torrent download URL if found, otherwise original URL

        Raises:
            httpx.RequestError: If unable to fetch the page (caller handles fallback)
        """
        try:
            response = self.client.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            # Find a link where the text contains 'torrent'
            link = soup.find('a', string=re.compile(r'torrent', re.IGNORECASE))
            if link and 'href' in link.attrs:
                torrent_url = link['href']
                logger.info(f"Extracted FitGirl torrent link from {url}")
                return torrent_url
            logger.warning(f"Could not find torrent link on FitGirl page: {url}")
            return url
        except httpx.RequestError as e:
            logger.error(f"Failed to fetch FitGirl page {url}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error parsing FitGirl page {url}: {e}")
            return url

    def _resolve_elamigos_link(self, url: str) -> str:
        """
        Resolves ElAmigos page to a mirror link using BeautifulSoup.

        Extracts MediaFire mirror link from ElAmigos page HTML.

        Args:
            url: ElAmigos page URL

        Returns:
            MediaFire mirror URL if found, otherwise original URL

        Raises:
            httpx.RequestError: If unable to fetch the page (caller handles fallback)
        """
        try:
            response = self.client.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            # Find a link whose href contains 'mediafire.com'
            link = soup.find('a', href=re.compile(r'mediafire\.com'))
            if link and 'href' in link.attrs:
                mirror_url = link['href']
                logger.info(f"Extracted ElAmigos mirror link from {url}")
                return mirror_url
            logger.warning(f"Could not find MediaFire mirror on ElAmigos page: {url}")
            return url
        except httpx.RequestError as e:
            logger.error(f"Failed to fetch ElAmigos page {url}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error parsing ElAmigos page {url}: {e}")
            return url

    def _resolve_rexagames_link(self, url: str) -> str:
        """
        Resolves RexaGames download page to a direct download link.

        Extracts download links from the DOWNLOAD AREA section of RexaGames forum posts.
        Prioritizes non-AD mirrors over sponsored mirrors.

        Args:
            url: RexaGames forum topic URL

        Returns:
            Download URL from one of the available mirrors, prioritizing DataVaults/Rootz

        Raises:
            httpx.RequestError: If unable to fetch the page (caller handles fallback)
        """
        try:
            response = self.client.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            # Find all download links in paragraphs containing "DataVaults", "Gofile", etc.
            # RexaGames uses simple <a> tags with link text like "DataVaults", "Gofile", etc.
            download_links = []

            # Look for links with common hosting service names
            for link in soup.find_all('a'):
                link_text = link.get_text(strip=True).lower()
                link_href = link.get('href', '')

                # Match common download hosting services
                if any(service in link_text for service in ['datavaults', 'gofile', 'akirabox', 'rootz', 'vikingfile']):
                    if link_href and (link_href.startswith('http') or link_href.startswith('/')):
                        download_links.append((link_text, link_href))

            if not download_links:
                logger.warning(f"Could not find download links on RexaGames page: {url}")
                return url

            # Prioritize non-AD mirrors: DataVaults and Rootz are primary mirrors
            priority_order = ['datavaults', 'rootz', 'gofile', 'akirabox', 'vikingfile']

            for service in priority_order:
                for link_text, link_href in download_links:
                    if service in link_text:
                        logger.info(f"Extracted RexaGames {service} link from {url}")
                        return link_href

            # Fallback to first available link
            logger.info(f"Extracted RexaGames download link from {url}")
            return download_links[0][1]

        except httpx.RequestError as e:
            logger.error(f"Failed to fetch RexaGames page {url}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error parsing RexaGames page {url}: {e}")
            return url

    def _resolve_multiup_link(self, url: str) -> str:
        """
        Resolves Multiup aggregator project page to available download mirrors.

        Extracts direct download links from the Multiup project page HTML.
        Multiup provides multiple mirror options for files, prioritizing faster/more reliable hosts.

        Args:
            url: Multiup project URL (e.g., https://multiup.io/project/ca950164572c20c9b3b8decedb6e43f1)

        Returns:
            First available download mirror URL if found, otherwise original URL

        Raises:
            httpx.RequestError: If unable to fetch the page (caller handles fallback)
        """
        try:
            response = self.client.get(url)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            # Multiup provides download buttons/links for various mirrors
            # Look for download links in common patterns: class containing "download", button elements, etc.
            download_links = []

            # Search for links that look like download buttons or mirror links
            for link in soup.find_all('a'):
                link_href = link.get('href', '')
                link_text = link.get_text(strip=True).lower()

                # Match common patterns: direct download links or mirror names
                if (link_href and
                    (link_href.startswith('http') or link_href.startswith('/')) and
                    any(term in link_text or term in link_href.lower() for term in
                        ['download', 'mirror', 'uptobox', '1fichier', 'mega', 'mediafire', 'gofile'])):
                    download_links.append((link_text, link_href))

            if download_links:
                # Prioritize certain mirrors if available
                priority_mirrors = ['uptobox', '1fichier', 'mega', 'mediafire', 'gofile']
                for mirror in priority_mirrors:
                    for link_text, link_href in download_links:
                        if mirror in link_text or mirror in link_href.lower():
                            logger.info(f"Extracted Multiup {mirror} mirror from {url}")
                            return link_href

                # Fallback to first available link
                logger.info(f"Extracted Multiup mirror from {url}")
                return download_links[0][1]

            logger.warning(f"Could not find download mirrors on Multiup page: {url}")
            return url

        except httpx.RequestError as e:
            logger.error(f"Failed to fetch Multiup page {url}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error parsing Multiup page {url}: {e}")
            return url

    def _resolve_cs_rin_link(self, url: str) -> str:
        return url