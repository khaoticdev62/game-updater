import json
import pytest
from unittest.mock import MagicMock, patch
from io import StringIO
import sidecar

def get_last_json_line(output):
    """Helper to extract the last JSON line from output, ignoring 'ready' signal."""
    lines = output.strip().split('\n')
    for line in reversed(lines):
        try:
            return json.loads(line)
        except json.JSONDecodeError:
            continue
    return None

def test_unknown_command_error_reporting():
    mock_request = {"command": "unknown_command", "id": "test_123"}
    
    with patch('sys.stdin', StringIO(json.dumps(mock_request) + '\n')):
        with patch('sys.stdout', new_callable=StringIO) as mock_stdout:
            sidecar.main()
            
            response = get_last_json_line(mock_stdout.getvalue())
            
            assert response['id'] == "test_123"
            assert response['error'] == "Unknown command: unknown_command"

def test_discover_mirrors_command():
    mock_request = {
        "command": "discover_mirrors", 
        "id": "test_125", 
        "mirrors": [{"url": "http://mirror1.com", "weight": 1}]
    }
    
    # We need to mock 'discovery' module
    mock_discovery = MagicMock()
    mock_discovery.MirrorDiscovery.return_value.discover_best_mirrors.return_value = [{"url": "http://mirror1.com", "available": True}]
    
    # Asyncio run mock
    async def async_run_mock(coro):
        return [{"url": "http://mirror1.com", "available": True}]
    
    # We need to mock asyncio.run because discover_best_mirrors is async
    # But since we're mocking the module, we can just make the return value of run() contain the result.
    
    with patch.dict('sys.modules', {'discovery': mock_discovery, 'asyncio': MagicMock(run=lambda x: x)}):
        # We also need to fix the discover_best_mirrors return value to not be a coroutine since we mocked run
        mock_discovery.MirrorDiscovery.return_value.discover_best_mirrors.return_value = [{"url": "http://mirror1.com", "available": True}]

        with patch('sys.stdin', StringIO(json.dumps(mock_request) + '\n')):
            with patch('sys.stdout', new_callable=StringIO) as mock_stdout:
                sidecar.main()
                response = get_last_json_line(mock_stdout.getvalue())
                assert response['id'] == "test_125"
                assert response['result'][0]['url'] == "http://mirror1.com"

def test_select_mirror_command():
    mock_request = {
        "command": "select_mirror", 
        "id": "test_126", 
        "url": "http://selected.com"
    }
    
    mock_discovery = MagicMock()
    
    with patch.dict('sys.modules', {'discovery': mock_discovery}):
        with patch('sys.stdin', StringIO(json.dumps(mock_request) + '\n')):
            with patch('sys.stdout', new_callable=StringIO) as mock_stdout:
                sidecar.main()
                mock_discovery.set_selected_mirror.assert_called_once_with("http://selected.com")
                response = get_last_json_line(mock_stdout.getvalue())
                assert response['result'] == "success"