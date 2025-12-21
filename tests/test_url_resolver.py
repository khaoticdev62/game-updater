import pytest
import httpx
from manifest import URLResolver

def test_resolve_direct_url(httpx_mock):
    mock_url = "http://example.com/direct_file.zip"
    httpx_mock.add_response(url=mock_url, method="HEAD")
    
    resolver = URLResolver()
    resolved = resolver.resolve_url(mock_url)
    assert resolved == mock_url

def test_resolve_url_with_redirect(httpx_mock):
    initial_url = "http://example.com/redirect"
    final_url = "http://example.com/final_file.zip"
    httpx_mock.add_response(url=initial_url, method="HEAD", status_code=302, headers={"Location": final_url})
    httpx_mock.add_response(url=final_url, method="HEAD") # For httpx to follow redirect
    
    resolver = URLResolver()
    resolved = resolver.resolve_url(initial_url)
    assert resolved == final_url

def test_resolve_mediafire_link(httpx_mock):
    mediafire_page_url = "http://www.mediafire.com/file/some_id/file.zip/file"
    direct_download_url = "https://download1234.mediafire.com/random/some_id/file.zip"
    
    # Mock the MediaFire page HTML containing the direct download link
    mock_html = f'<a href="{direct_download_url}" class="download-btn">Download</a>'
    httpx_mock.add_response(url=mediafire_page_url, text=mock_html)
    
    resolver = URLResolver()
    resolved = resolver.resolve_url(mediafire_page_url)
    assert resolved == direct_download_url

def test_resolve_url_network_error(httpx_mock):
    mock_url = "http://nonexistent.com/file.zip"
    httpx_mock.add_exception(httpx.ConnectError("Connection refused"))
    
    resolver = URLResolver()
    with pytest.raises(Exception, match="Network error resolving URL: Connection refused"):
        resolver.resolve_url(mock_url)
