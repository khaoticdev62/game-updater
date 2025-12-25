import pytest
import httpx
from manifest import URLResolver

def test_resolve_direct_url(httpx_mock):
    mock_url = "http://example.com/direct_page"
    httpx_mock.add_response(url=mock_url, method="HEAD")
    
    resolver = URLResolver()
    resolved = resolver.resolve_url(mock_url)
    assert resolved == mock_url

def test_resolve_url_with_redirect(httpx_mock):
    initial_url = "http://example.com/redirect"
    final_url = "http://example.com/final_file.zip"
    
    # Resolver makes HEAD request, sees 302, then recurses.
    # Recursion on final_url (.zip) returns immediately without request.
    httpx_mock.add_response(url=initial_url, method="HEAD", status_code=302, headers={"Location": final_url})
    
    resolver = URLResolver()
    resolved = resolver.resolve_url(initial_url)
    assert resolved == final_url

def test_resolve_mediafire_link(httpx_mock):
    mediafire_page_url = "http://www.mediafire.com/file/some_id/file.zip"
    direct_download_url = "https://download1234.mediafire.com/random/some_id/file.zip"
    
    mock_html = f'<div><a id="downloadButton" href="{direct_download_url}">Download</a></div>'
    httpx_mock.add_response(url=mediafire_page_url, text=mock_html)
    
    resolver = URLResolver()
    resolved = resolver.resolve_url(mediafire_page_url)
    assert resolved == direct_download_url

def test_resolve_fitgirl_link(httpx_mock):
    fitgirl_url = "https://fitgirl-repacks.site/some-game/"
    download_link = "https://example.com/game.torrent"
    mock_html = f'<ul><li><a href="{download_link}">Magnet / .torrent</a></li></ul>'
    httpx_mock.add_response(url=fitgirl_url, text=mock_html)
    
    resolver = URLResolver()
    resolved = resolver.resolve_url(fitgirl_url)
    assert resolved == download_link

def test_resolve_elamigos_link(httpx_mock):
    elamigos_url = "https://elamigos.site/game/some-game"
    download_link = "https://mediafire.com/file/some_id"
    mock_html = f'<div><a href="{download_link}">MediaFire Link</a></div>'
    httpx_mock.add_response(url=elamigos_url, text=mock_html)
    
    direct_dl = "https://download.mediafire.com/direct.zip"
    mock_mediafire_html = f'<div><a id="downloadButton" href="{direct_dl}">Download</a></div>'
    httpx_mock.add_response(url=download_link, text=mock_mediafire_html)

    resolver = URLResolver()
    resolved = resolver.resolve_url(elamigos_url)
    assert resolved == direct_dl

def test_resolve_url_network_error(httpx_mock):
    # If head fails, it returns the original URL now (to be robust)
    # So I'll test that it doesn't crash
    mock_url = "http://nonexistent.com/page"
    httpx_mock.add_exception(httpx.ConnectError("Connection refused"))
    
    resolver = URLResolver()
    resolved = resolver.resolve_url(mock_url)
    assert resolved == mock_url
