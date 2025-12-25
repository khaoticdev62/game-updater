import pytest
import httpx
import json
from manifest import VersionScanner, ManifestFetcher

def test_scan_versions(httpx_mock):
    mock_url = "http://example.com/versions"
    mock_html = """
    <html>
        <body>
            <a href="/1.119.0.0/">Version 1.119.0.0</a>
            <a href="/1.120.0/">Version 1.120.0</a>
            <a href="/1.130.1.0">Latest 1.130.1.0</a>
            <a href="/other">Some other link</a>
        </body>
    </html>
    """
    httpx_mock.add_response(url=mock_url, text=mock_html)
    
    scanner = VersionScanner()
    versions = scanner.scan_versions(mock_url)
    
    assert "1.130.1.0" in versions
    assert "1.120.0" in versions
    assert "1.119.0.0" in versions
    # Sorted reverse
    assert versions[0] == "1.130.1.0"

def test_fetch_versioned_manifest(httpx_mock):
    base_url = "http://example.com/manifest.json"
    target_version = "1.119.0"
    expected_url = "http://example.com/1.119.0/manifest.json"
    
    manifest_data = {"version": target_version, "patch": {"files": []}}
    httpx_mock.add_response(url=expected_url, json=manifest_data)
    
    fetcher = ManifestFetcher(base_url)
    data = fetcher.fetch_manifest_json(version=target_version)
    
    assert data["version"] == target_version

def test_fetch_versioned_manifest_non_json_url(httpx_mock):
    base_url = "http://example.com/updates/"
    target_version = "1.119.0"
    expected_url = "http://example.com/updates/1.119.0/manifest.json"
    
    httpx_mock.add_response(url=expected_url, json={"v": target_version})
    
    fetcher = ManifestFetcher(base_url)
    data = fetcher.fetch_manifest_json(version=target_version)
    assert data["v"] == target_version
