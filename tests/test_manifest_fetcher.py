import pytest
import httpx
from manifest import ManifestFetcher

def test_fetch_manifest_json_success(httpx_mock):
    mock_url = "http://test.com/manifest.json"
    mock_content = {"version": "1.0", "dlcs": []}
    httpx_mock.add_response(url=mock_url, json=mock_content)
    
    fetcher = ManifestFetcher(mock_url)
    manifest = fetcher.fetch_manifest_json()
    assert manifest == mock_content

def test_fetch_manifest_text_http_error(httpx_mock):
    mock_url = "http://test.com/manifest.json"
    httpx_mock.add_response(url=mock_url, status_code=404)
    
    fetcher = ManifestFetcher(mock_url)
    with pytest.raises(Exception, match="HTTP error fetching manifest: 404"):
        fetcher.fetch_manifest_text()

def test_fetch_manifest_json_malformed_json(httpx_mock):
    mock_url = "http://test.com/manifest.json"
    httpx_mock.add_response(url=mock_url, text="not json")
    
    fetcher = ManifestFetcher(mock_url)
    with pytest.raises(Exception, match="Failed to parse manifest JSON"):
        fetcher.fetch_manifest_json()

def test_fetch_manifest_text_network_error(httpx_mock):
    mock_url = "http://test.com/manifest.json"
    httpx_mock.add_exception(httpx.ConnectError("Connection refused"))
    
    fetcher = ManifestFetcher(mock_url)
    with pytest.raises(Exception, match="Network error fetching manifest: Connection refused"):
        fetcher.fetch_manifest_text()
