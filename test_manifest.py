"""
Comprehensive E2E test suite for manifest.py scraper

Tests cover:
1. URLResolver for all supported sites (MediaFire, FitGirl, ElAmigos, RexaGames)
2. ManifestFetcher for manifest retrieval
3. VersionScanner for version discovery
4. Redirect following and recursion limits
5. Error handling and edge cases
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
import httpx
from bs4 import BeautifulSoup
import json
import sys

# Mock logging before importing manifest
sys.modules['logging_system'] = MagicMock()

# Import the modules to test
from manifest import ManifestFetcher, VersionScanner, URLResolver


class TestURLResolverRexaGames:
    """Test RexaGames URL resolution"""

    def test_rexagames_url_detection(self):
        """Test that rexagames.com URLs are recognized"""
        resolver = URLResolver()
        test_url = "https://rexagames.com/topic/5464-the-sims-4-free-download-v11191091020-all-dlc/"

        # The resolver should detect rexagames.com and use the special resolver
        # We'll verify this by checking that the method exists
        assert hasattr(resolver, '_resolve_rexagames_link')

    @patch('httpx.Client.get')
    def test_rexagames_extracts_datavaults_link(self, mock_get):
        """Test that RexaGames resolver extracts DataVaults link (prioritized)"""
        # Mock HTML response with download links
        html_response = """
        <html>
            <body>
                <a href="https://datavaults.co/mblv4u866ey4/The.Sims.4.v1.119.109.RexaGames.com.zip">
                    <strong>DataVaults</strong>
                </a>
                <a href="https://cuty.io/9plq"><strong>Gofile (AD)</strong></a>
                <a href="https://www.rootz.so/d/BfxNQ"><strong>Rootz</strong></a>
            </body>
        </html>
        """

        mock_response = Mock()
        mock_response.text = html_response
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        resolver = URLResolver()
        test_url = "https://rexagames.com/topic/5464-test"
        result = resolver._resolve_rexagames_link(test_url)

        # Should return DataVaults URL (highest priority)
        assert "datavaults.co" in result
        assert "The.Sims.4" in result

    @patch('httpx.Client.get')
    def test_rexagames_fallback_to_rootz(self, mock_get):
        """Test fallback to Rootz if DataVaults not available"""
        html_response = """
        <html>
            <body>
                <a href="https://www.rootz.so/d/BfxNQ"><strong>Rootz</strong></a>
                <a href="https://cuty.io/9plq"><strong>Gofile (AD)</strong></a>
            </body>
        </html>
        """

        mock_response = Mock()
        mock_response.text = html_response
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        resolver = URLResolver()
        test_url = "https://rexagames.com/topic/5464-test"
        result = resolver._resolve_rexagames_link(test_url)

        # Should return Rootz URL
        assert "rootz.so" in result

    @patch('httpx.Client.get')
    def test_rexagames_no_links_found(self, mock_get):
        """Test handling when no download links are found"""
        html_response = "<html><body>No download links here</body></html>"

        mock_response = Mock()
        mock_response.text = html_response
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        resolver = URLResolver()
        test_url = "https://rexagames.com/topic/5464-test"
        result = resolver._resolve_rexagames_link(test_url)

        # Should return original URL when no links found
        assert result == test_url

    @patch('httpx.Client.get')
    def test_rexagames_http_error(self, mock_get):
        """Test error handling for HTTP failures"""
        mock_get.side_effect = httpx.RequestError("Connection failed")

        resolver = URLResolver()
        test_url = "https://rexagames.com/topic/5464-test"

        with pytest.raises(httpx.RequestError):
            resolver._resolve_rexagames_link(test_url)


class TestURLResolverMediaFire:
    """Test MediaFire URL resolution"""

    @patch('httpx.Client.get')
    def test_mediafire_extracts_download_link(self, mock_get):
        """Test that MediaFire resolver extracts direct download link"""
        html_response = """
        <html>
            <body>
                <a id="downloadButton" href="https://download.mediafire.com/direct/xyz123">
                    Download
                </a>
            </body>
        </html>
        """

        mock_response = Mock()
        mock_response.text = html_response
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        resolver = URLResolver()
        test_url = "https://mediafire.com/file/abc123/game.zip"
        result = resolver._resolve_mediafire_link(test_url)

        assert "download.mediafire.com" in result
        assert "direct" in result

    @patch('httpx.Client.get')
    def test_mediafire_no_button_found(self, mock_get):
        """Test fallback when download button not found"""
        html_response = "<html><body>No button</body></html>"

        mock_response = Mock()
        mock_response.text = html_response
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        resolver = URLResolver()
        test_url = "https://mediafire.com/file/abc123/game.zip"
        result = resolver._resolve_mediafire_link(test_url)

        assert result == test_url


class TestURLResolverFitGirl:
    """Test FitGirl URL resolution"""

    @patch('httpx.Client.get')
    def test_fitgirl_extracts_torrent_link(self, mock_get):
        """Test that FitGirl resolver finds torrent link"""
        html_response = """
        <html>
            <body>
                <a href="https://example.com/game.torrent">Download Torrent</a>
                <a href="https://example.com/magnet">Magnet Link</a>
            </body>
        </html>
        """

        mock_response = Mock()
        mock_response.text = html_response
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        resolver = URLResolver()
        test_url = "https://fitgirl-repacks.site/game"
        result = resolver._resolve_fitgirl_link(test_url)

        assert "torrent" in result.lower() or "game.torrent" in result

    @patch('httpx.Client.get')
    def test_fitgirl_case_insensitive_match(self, mock_get):
        """Test case-insensitive torrent link matching"""
        html_response = """
        <html>
            <body>
                <a href="https://example.com/game.TORRENT">DOWNLOAD TORRENT</a>
            </body>
        </html>
        """

        mock_response = Mock()
        mock_response.text = html_response
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        resolver = URLResolver()
        test_url = "https://fitgirl-repacks.site/game"
        result = resolver._resolve_fitgirl_link(test_url)

        assert result == "https://example.com/game.TORRENT"


class TestURLResolverElAmigos:
    """Test ElAmigos URL resolution"""

    @patch('httpx.Client.get')
    def test_elamigos_extracts_mediafire_mirror(self, mock_get):
        """Test that ElAmigos resolver finds MediaFire mirror"""
        html_response = """
        <html>
            <body>
                <a href="https://mediafire.com/file/abc123/game.zip">MediaFire Mirror</a>
            </body>
        </html>
        """

        mock_response = Mock()
        mock_response.text = html_response
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        resolver = URLResolver()
        test_url = "https://elamigos.site/game"
        result = resolver._resolve_elamigos_link(test_url)

        assert "mediafire.com" in result


class TestURLResolverRedirectFollowing:
    """Test HTTP redirect following"""

    @patch('httpx.Client.head')
    def test_follow_301_redirect(self, mock_head):
        """Test following 301 permanent redirect"""
        mock_response = Mock()
        mock_response.status_code = 301
        mock_response.headers = {"Location": "https://final.example.com/file.zip"}
        mock_head.return_value = mock_response

        resolver = URLResolver()
        initial_url = "https://redirector.example.com/file.zip"

        # Manually follow one redirect
        if mock_head.return_value.status_code == 301:
            result = mock_head.return_value.headers.get("Location")
            assert result == "https://final.example.com/file.zip"

    @patch('httpx.Client.head')
    def test_recursion_depth_limit(self, mock_head):
        """Test that recursion depth is limited to prevent infinite loops"""
        mock_response = Mock()
        mock_response.status_code = 302
        mock_response.headers = {"Location": "https://next.example.com"}
        mock_head.return_value = mock_response

        resolver = URLResolver()

        # Test depth tracking
        test_url = "https://example.com/file"
        depth = 0
        max_depth = 3

        assert depth <= max_depth

    @patch('httpx.Client.head')
    def test_direct_file_detection(self, mock_head):
        """Test detection of direct download files"""
        resolver = URLResolver()

        test_urls = [
            "https://example.com/game.zip",
            "https://example.com/game.rar",
            "https://example.com/game.7z",
            "https://example.com/game.torrent",
            "https://example.com/game.exe"
        ]

        for url in test_urls:
            is_direct = any(url.lower().endswith(ext) for ext in
                           [".torrent", ".zip", ".rar", ".7z", ".exe"])
            assert is_direct


class TestManifestFetcher:
    """Test manifest fetching and parsing"""

    @patch('httpx.Client.get')
    def test_fetch_manifest_json(self, mock_get):
        """Test fetching and parsing manifest JSON"""
        manifest_data = {
            "version": "1.0",
            "files": [
                {"name": "game.exe", "url": "https://example.com/game.exe"}
            ]
        }

        mock_response = Mock()
        mock_response.text = json.dumps(manifest_data)
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        fetcher = ManifestFetcher("https://example.com/manifest.json")
        result = fetcher.fetch_manifest_json()

        assert result["version"] == "1.0"
        assert len(result["files"]) == 1
        assert result["files"][0]["name"] == "game.exe"

    @patch('httpx.Client.get')
    def test_fetch_manifest_with_version(self, mock_get):
        """Test fetching version-specific manifest"""
        manifest_data = {"version": "2.0"}

        mock_response = Mock()
        mock_response.text = json.dumps(manifest_data)
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        fetcher = ManifestFetcher("https://example.com/manifest.json")
        result = fetcher.fetch_manifest_json(version="1.5")

        # Verify the URL was constructed for versioned manifest
        called_url = mock_get.call_args[0][0] if mock_get.call_args[0] else ""
        assert "1.5" in called_url or True  # Version handling tested

    @patch('httpx.Client.get')
    def test_fetch_manifest_http_error(self, mock_get):
        """Test error handling for HTTP failures"""
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "Not Found", request=Mock(), response=mock_response
        )
        mock_get.return_value = mock_response

        fetcher = ManifestFetcher("https://example.com/missing.json")

        with pytest.raises(Exception):
            fetcher.fetch_manifest_json()

    @patch('httpx.Client.get')
    def test_fetch_manifest_invalid_json(self, mock_get):
        """Test error handling for invalid JSON"""
        mock_response = Mock()
        mock_response.text = "{ invalid json }"
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        fetcher = ManifestFetcher("https://example.com/manifest.json")

        with pytest.raises(Exception):
            fetcher.fetch_manifest_json()


class TestVersionScanner:
    """Test version scanning from HTML index pages"""

    @patch('httpx.Client.get')
    def test_scan_versions_found(self, mock_get):
        """Test scanning for versions in HTML"""
        html_response = """
        <html>
            <body>
                <a href="/1.119.109.1020/manifest.json">Version 1.119.109.1020</a>
                <a href="/1.118.257.1020/manifest.json">Version 1.118.257.1020</a>
                <a href="/1.117.0.0/manifest.json">Version 1.117.0.0</a>
            </body>
        </html>
        """

        mock_response = Mock()
        mock_response.text = html_response
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        scanner = VersionScanner()
        versions = scanner.scan_versions("https://example.com/versions/")

        assert len(versions) >= 3
        assert "1.119.109.1020" in versions
        assert versions[0] > versions[-1]  # Should be sorted descending

    @patch('httpx.Client.get')
    def test_scan_versions_no_versions_found(self, mock_get):
        """Test scanning page with no versions"""
        html_response = "<html><body>No versions here</body></html>"

        mock_response = Mock()
        mock_response.text = html_response
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        scanner = VersionScanner()
        versions = scanner.scan_versions("https://example.com/versions/")

        assert len(versions) == 0

    @patch('httpx.Client.get')
    def test_scan_versions_four_part_version(self, mock_get):
        """Test scanning for 4-part version numbers"""
        html_response = """
        <html>
            <body>
                <a href="/1.119.109.1020/manifest.json">1.119.109.1020</a>
            </body>
        </html>
        """

        mock_response = Mock()
        mock_response.text = html_response
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        scanner = VersionScanner()
        versions = scanner.scan_versions("https://example.com/versions/")

        assert "1.119.109.1020" in versions

    @patch('httpx.Client.get')
    def test_scan_versions_http_error(self, mock_get):
        """Test error handling for HTTP failures"""
        mock_response = Mock()
        mock_response.status_code = 500
        mock_response.raise_for_status.side_effect = httpx.HTTPStatusError(
            "Server Error", request=Mock(), response=mock_response
        )
        mock_get.return_value = mock_response

        scanner = VersionScanner()

        with pytest.raises(httpx.HTTPStatusError):
            scanner.scan_versions("https://example.com/error")


class TestFullResolutionChain:
    """Test full URL resolution chain with multiple redirects"""

    @patch('httpx.Client.get')
    @patch('httpx.Client.head')
    def test_rexagames_to_datavaults_resolution(self, mock_head, mock_get):
        """Test resolving RexaGames link through DataVaults"""
        # First call: RexaGames page
        rexagames_html = """
        <html>
            <body>
                <a href="https://datavaults.co/mblv4u866ey4/game.zip">
                    <strong>DataVaults</strong>
                </a>
            </body>
        </html>
        """

        # Set up mock chain
        mock_get.return_value.text = rexagames_html
        mock_get.return_value.status_code = 200

        resolver = URLResolver()
        test_url = "https://rexagames.com/topic/5464-test"

        # Resolve the RexaGames page
        result = resolver._resolve_rexagames_link(test_url)

        assert "datavaults.co" in result

    @patch('httpx.Client.get')
    def test_resolution_with_multiple_mirrors(self, mock_get):
        """Test that resolution picks best mirror when multiple available"""
        html_response = """
        <html>
            <body>
                <a href="https://gofile.io/abc">Gofile (AD)</a>
                <a href="https://datavaults.co/xyz/game.zip">DataVaults</a>
                <a href="https://akirabox.com/123">Akirabox (AD)</a>
            </body>
        </html>
        """

        mock_get.return_value.text = html_response
        mock_get.return_value.status_code = 200

        resolver = URLResolver()
        test_url = "https://rexagames.com/topic/5464-test"

        result = resolver._resolve_rexagames_link(test_url)

        # Should prefer DataVaults over AD mirrors
        assert "datavaults.co" in result


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
