#!/usr/bin/env python3
"""
Test suite for MirrorOptimizer functionality.

Demonstrates automatic mirror detection and ranking.
"""

import json
import pytest
from unittest.mock import patch, MagicMock
from manifest import MirrorOptimizer
from typing import List, Dict, Any


class TestMirrorOptimizer:
    """Test MirrorOptimizer class functionality."""

    def test_mirror_optimizer_initialization(self):
        """Test optimizer can be initialized with custom settings."""
        optimizer = MirrorOptimizer(timeout=10.0, max_workers=3)
        assert optimizer.timeout == 10.0
        assert optimizer.max_workers == 3

    def test_test_mirror_success(self):
        """Test successful mirror test."""
        optimizer = MirrorOptimizer()

        # Mock successful response
        with patch('manifest.httpx.Client.head') as mock_head:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_head.return_value = mock_response

            result = optimizer.test_mirror('https://example.com/file.zip')

            assert result['available'] is True
            assert result['status_code'] == 200
            assert result['rank_score'] > 0
            assert result['url'] == 'https://example.com/file.zip'

    def test_test_mirror_timeout(self):
        """Test mirror test timeout handling."""
        optimizer = MirrorOptimizer()

        with patch('manifest.httpx.Client.head') as mock_head:
            import httpx
            mock_head.side_effect = httpx.TimeoutException("Timeout")

            result = optimizer.test_mirror('https://slow-mirror.com/file.zip')

            assert result['available'] is False
            assert result['rank_score'] == -1
            assert result['response_time'] == -1

    def test_test_mirror_unavailable(self):
        """Test mirror test with 404 response."""
        optimizer = MirrorOptimizer()

        with patch('manifest.httpx.Client.head') as mock_head:
            mock_response = MagicMock()
            mock_response.status_code = 404
            mock_head.return_value = mock_response

            result = optimizer.test_mirror('https://dead-mirror.com/file.zip')

            assert result['available'] is False
            assert result['status_code'] == 404
            assert result['rank_score'] == -404

    def test_rank_mirrors_sorting(self):
        """Test that mirrors are properly ranked and sorted."""
        optimizer = MirrorOptimizer()
        urls = [
            'https://slow.com/file.zip',
            'https://fast.com/file.zip',
            'https://medium.com/file.zip',
        ]

        with patch.object(optimizer, 'test_mirror') as mock_test:
            # Mock responses in order of speed
            def test_side_effect(url):
                if 'fast.com' in url:
                    return {
                        'url': url,
                        'available': True,
                        'response_time': 50,
                        'status_code': 200,
                        'rank_score': 950  # Fastest
                    }
                elif 'medium.com' in url:
                    return {
                        'url': url,
                        'available': True,
                        'response_time': 200,
                        'status_code': 200,
                        'rank_score': 800  # Medium
                    }
                else:  # slow.com
                    return {
                        'url': url,
                        'available': True,
                        'response_time': 500,
                        'status_code': 200,
                        'rank_score': 500  # Slowest
                    }

            mock_test.side_effect = test_side_effect

            results = optimizer.rank_mirrors(urls)

            # Should be sorted by rank_score (descending)
            assert results[0]['rank_score'] == 950  # fast.com first
            assert results[1]['rank_score'] == 800  # medium.com second
            assert results[2]['rank_score'] == 500  # slow.com last

    def test_get_best_mirror_prefers_available(self):
        """Test that get_best_mirror returns first available mirror."""
        optimizer = MirrorOptimizer()
        urls = [
            'https://dead.com/file.zip',
            'https://alive.com/file.zip',
        ]

        with patch.object(optimizer, 'rank_mirrors') as mock_rank:
            mock_rank.return_value = [
                {'url': 'https://alive.com/file.zip', 'available': True, 'rank_score': 500},
                {'url': 'https://dead.com/file.zip', 'available': False, 'rank_score': 100},
            ]

            best = optimizer.get_best_mirror(urls)
            assert best == 'https://alive.com/file.zip'

    def test_get_best_mirror_none_available(self):
        """Test get_best_mirror returns None when no mirrors available."""
        optimizer = MirrorOptimizer()
        urls = ['https://dead1.com/file.zip', 'https://dead2.com/file.zip']

        with patch.object(optimizer, 'rank_mirrors') as mock_rank:
            mock_rank.return_value = [
                {'url': 'https://dead1.com/file.zip', 'available': False, 'rank_score': -1},
                {'url': 'https://dead2.com/file.zip', 'available': False, 'rank_score': -2},
            ]

            best = optimizer.get_best_mirror(urls)
            assert best is None

    def test_update_manifest_with_best_link(self):
        """Test automatic manifest update with best link."""
        optimizer = MirrorOptimizer()
        manifest = {
            'download_info': {
                'primary_link': 'https://slow.com/file.zip',
                'mirrors': [
                    'https://medium.com/file.zip',
                    'https://fast.com/file.zip',
                ]
            }
        }

        mirror_keys = [
            'download_info.primary_link',
            'download_info.mirrors.0',
            'download_info.mirrors.1',
        ]

        with patch.object(optimizer, 'get_best_mirror') as mock_best:
            mock_best.return_value = 'https://fast.com/file.zip'

            updated = optimizer.update_manifest_with_best_link(manifest, mirror_keys)

            # Primary link should now be the best mirror
            assert updated['download_info']['primary_link'] == 'https://fast.com/file.zip'

    def test_nested_value_access(self):
        """Test nested dictionary value access."""
        optimizer = MirrorOptimizer()
        data = {
            'level1': {
                'level2': {
                    'level3': 'value'
                },
                'array': [
                    'item0',
                    'item1',
                    'item2'
                ]
            }
        }

        # Test nested object access
        value = optimizer._get_nested_value(data, 'level1.level2.level3')
        assert value == 'value'

        # Test array access
        value = optimizer._get_nested_value(data, 'level1.array.1')
        assert value == 'item1'

    def test_nested_value_set(self):
        """Test nested dictionary value setting."""
        optimizer = MirrorOptimizer()
        data = {
            'level1': {
                'level2': {
                    'level3': 'old_value'
                }
            }
        }

        optimizer._set_nested_value(data, 'level1.level2.level3', 'new_value')
        assert data['level1']['level2']['level3'] == 'new_value'

    def test_manifest_integration_real_world(self):
        """Test with realistic manifest structure."""
        optimizer = MirrorOptimizer()
        manifest = {
            'game': 'The Sims 4',
            'version': '1.100.0.1000',
            'download_info': {
                'primary_link': 'https://updatecrackgames.com/sims4-patch-1-100',
                'mirrors': [
                    'https://fitgirl-repacks.site/sims-4-patch-1-100',
                    'https://elamigos.site/sims4-patch-1100',
                    'https://rexagames.com/sims4-patch-links',
                ]
            },
            'metadata': {
                'auto_selected': False
            }
        }

        mirror_keys = [
            'download_info.primary_link',
            'download_info.mirrors.0',
            'download_info.mirrors.1',
            'download_info.mirrors.2',
        ]

        with patch.object(optimizer, 'get_best_mirror') as mock_best:
            mock_best.return_value = 'https://fitgirl-repacks.site/sims-4-patch-1-100'

            updated = optimizer.update_manifest_with_best_link(manifest, mirror_keys)

            # Verify primary link was updated
            assert updated['download_info']['primary_link'] == 'https://fitgirl-repacks.site/sims-4-patch-1-100'
            # Verify other data preserved
            assert updated['game'] == 'The Sims 4'
            assert updated['version'] == '1.100.0.1000'


class TestMirrorOptimizerIntegration:
    """Integration tests for mirror optimization workflow."""

    def test_full_optimization_workflow(self):
        """Test complete mirror optimization workflow."""
        optimizer = MirrorOptimizer(timeout=5.0, max_workers=3)

        # Create test manifest
        manifest = {
            'name': 'test-patch',
            'links': {
                'primary': 'https://mirror1.com/patch.zip',
                'secondary': 'https://mirror2.com/patch.zip',
                'tertiary': 'https://mirror3.com/patch.zip',
            }
        }

        with patch.object(optimizer, 'test_mirror') as mock_test:
            # Simulate different response times
            def test_side_effect(url):
                mirror_scores = {
                    'https://mirror1.com/patch.zip': 600,  # Medium (slow)
                    'https://mirror2.com/patch.zip': 850,  # Fast
                    'https://mirror3.com/patch.zip': 700,  # Medium-fast
                }
                score = mirror_scores.get(url, 0)
                return {
                    'url': url,
                    'available': score > 0,
                    'response_time': 1000 - score,
                    'status_code': 200 if score > 0 else 404,
                    'rank_score': score
                }

            mock_test.side_effect = test_side_effect

            keys = ['links.primary', 'links.secondary', 'links.tertiary']
            updated = optimizer.update_manifest_with_best_link(manifest, keys)

            # mirror2 should be selected as primary (fastest)
            assert updated['links']['primary'] == 'https://mirror2.com/patch.zip'


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
