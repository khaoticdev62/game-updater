import json
import pytest
from unittest.mock import MagicMock, patch
from io import StringIO
import sidecar

def test_unknown_command_error_reporting():
    mock_request = {"command": "unknown_command", "id": "test_123"}
    
    with patch('sys.stdin', StringIO(json.dumps(mock_request) + '\n')):
        with patch('sys.stdout', new_callable=StringIO) as mock_stdout:
            sidecar.main()
            
            output = mock_stdout.getvalue().strip()
            response = json.loads(output)
            
            assert response['id'] == "test_123"
            assert response['error'] == "Unknown command: unknown_command"

def test_exception_error_reporting():
    mock_request = {"command": "start_update", "id": "test_124", "game_dir": ".", "manifest_url": "http://test.com/manifest.json"}
    
    # Simulate an exception during processing within UpdateManager.get_operations
    with patch('update_logic.UpdateManager.get_operations', side_effect=Exception("Test Error")):
        with patch('sys.stdin', StringIO(json.dumps(mock_request) + '\n')):
            with patch('sys.stdout', new_callable=StringIO) as mock_stdout:
                sidecar.main()
                
                output_lines = mock_stdout.getvalue().strip().split('\n')
                
                # The last line should be the error response
                response = json.loads(output_lines[-1])
                
                assert response['id'] == "test_124"
                assert response['error'] is True
                assert "Test Error" in response['message']
                assert response['type'] == "Exception"

def test_discover_mirrors_command():
    mock_request = {
        "command": "discover_mirrors", 
        "id": "test_125", 
        "mirrors": [{"url": "http://mirror1.com", "weight": 1}]
    }
    
    with patch('discovery.MirrorDiscovery.discover_best_mirrors') as mock_discover:
        mock_discover.return_value = [{"url": "http://mirror1.com", "available": True}]
        with patch('sys.stdin', StringIO(json.dumps(mock_request) + '\n')):
            with patch('sys.stdout', new_callable=StringIO) as mock_stdout:
                sidecar.main()
                response = json.loads(mock_stdout.getvalue().strip())
                assert response['id'] == "test_125"
                assert response['result'][0]['url'] == "http://mirror1.com"

def test_select_mirror_command():
    mock_request = {
        "command": "select_mirror", 
        "id": "test_126", 
        "url": "http://selected.com"
    }
    
    with patch('discovery.set_selected_mirror') as mock_set:
        with patch('sys.stdin', StringIO(json.dumps(mock_request) + '\n')):
            with patch('sys.stdout', new_callable=StringIO) as mock_stdout:
                sidecar.main()
                mock_set.assert_called_once_with("http://selected.com")
                response = json.loads(mock_stdout.getvalue().strip())
                assert response['result'] == "success"
