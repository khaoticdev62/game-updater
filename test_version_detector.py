#!/usr/bin/env python3
"""
Comprehensive test suite for GameVersionDetector.

Tests cover:
- Version detection from all sources
- Regex pattern matching
- Version comparison and ranking
- Confidence scoring
- Update checking
- Edge cases and error handling
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from version_detector import (
    GameVersionDetector,
    VersionInfo,
    VersionRegexPatterns
)


class TestVersionInfo:
    """Test VersionInfo dataclass."""

    def test_version_info_creation(self):
        """Test creating a VersionInfo object."""
        info = VersionInfo(
            version_string="1.100.0",
            release_date="2025-01-15",
            patch_name="Growing Together",
            source="Official"
        )
        assert info.version_string == "1.100.0"
        assert info.release_date == "2025-01-15"
        assert info.patch_name == "Growing Together"
        assert info.source == "Official"
        assert info.is_verified == False
        assert info.download_urls == []

    def test_version_info_comparison_lt(self):
        """Test version less than comparison."""
        v1 = VersionInfo("1.50.0")
        v2 = VersionInfo("1.100.0")
        assert v1 < v2

    def test_version_info_comparison_gt(self):
        """Test version greater than comparison."""
        v1 = VersionInfo("1.100.0")
        v2 = VersionInfo("1.50.0")
        assert v1 > v2

    def test_version_info_comparison_eq(self):
        """Test version equality comparison."""
        v1 = VersionInfo("1.100.0")
        v2 = VersionInfo("1.100.0")
        assert v1 == v2

    def test_version_info_to_dict(self):
        """Test converting VersionInfo to dictionary."""
        info = VersionInfo(
            version_string="1.100.0",
            release_date="2025-01-15",
            patch_name="Growing Together",
            source="Official",
            is_verified=True,
            confidence_score=0.95
        )
        result = info.to_dict()
        assert result['version'] == "1.100.0"
        assert result['release_date'] == "2025-01-15"
        assert result['patch_name'] == "Growing Together"
        assert result['source'] == "Official"
        assert result['verified'] == True
        assert result['confidence'] == 0.95

    def test_version_info_with_download_urls(self):
        """Test VersionInfo with download URLs."""
        urls = [
            "https://mirror1.com/sims4-patch.zip",
            "https://mirror2.com/sims4-patch.zip"
        ]
        info = VersionInfo(
            version_string="1.100.0",
            download_urls=urls
        )
        assert len(info.download_urls) == 2
        assert info.download_urls[0] == urls[0]


class TestVersionRegexPatterns:
    """Test version regex patterns."""

    def test_semantic_version_pattern(self):
        """Test semantic version regex."""
        pattern = VersionRegexPatterns.SEMANTIC_VERSION

        # Valid versions
        assert pattern.search("1.50.0")
        assert pattern.search("1.100.0")
        assert pattern.search("1.100.0.1000")

        # Invalid versions
        assert not pattern.search("version 1.")
        assert not pattern.search("1.x.y")

    def test_sims4_patch_pattern(self):
        """Test Sims 4 patch pattern."""
        pattern = VersionRegexPatterns.SIMS4_PATCH

        # Valid Sims 4 patches
        match = pattern.search("Patch 1.100")
        assert match and match.group(1) == "1.100"

        match = pattern.search("patch 1.100.0")
        assert match and match.group(1) == "1.100.0"

        match = pattern.search("UPDATE 1.100.0.1000")
        assert match and match.group(1) == "1.100.0.1000"

        # Case insensitive
        match = pattern.search("PATCH 1.50.0")
        assert match and match.group(1) == "1.50.0"

    def test_sims4_patch_with_name_pattern(self):
        """Test Sims 4 patch with name pattern."""
        pattern = VersionRegexPatterns.SIMS4_PATCH_WITH_NAME

        text = "Patch 1.100 - Growing Together"
        match = pattern.search(text)
        assert match
        assert match.group(1) == "1.100"
        assert "Growing Together" in match.group(2)

    def test_date_pattern(self):
        """Test release date regex."""
        pattern = VersionRegexPatterns.DATE_PATTERN

        # US date format
        assert pattern.search("01/15/2025")

        # ISO date format
        assert pattern.search("2025-01-15")

        # Named month format
        assert pattern.search("January 15, 2025")
        assert pattern.search("January 15 2025")


class TestGameVersionDetector:
    """Test GameVersionDetector class."""

    def test_detector_initialization(self):
        """Test detector initialization."""
        detector = GameVersionDetector(timeout=10.0)
        assert detector.timeout == 10.0
        assert detector.client is not None
        assert isinstance(detector.discovered_versions, set)

    def test_detector_initialization_default_timeout(self):
        """Test detector with default timeout."""
        detector = GameVersionDetector()
        assert detector.timeout == 10.0

    @patch('version_detector.httpx.Client')
    def test_detect_from_official_manifest_success(self, mock_client_class):
        """Test successful official manifest detection."""
        # Mock HTML response
        html_response = """
        <html>
            <body>
                <h2>Patch 1.100 - Growing Together</h2>
                <p>Released January 15, 2025</p>
                <p>Version 1.100.0.1000</p>
            </body>
        </html>
        """

        mock_client = MagicMock()
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = html_response
        mock_client.get.return_value = mock_response
        mock_client_class.return_value = mock_client

        detector = GameVersionDetector()
        detector.client = mock_client

        versions = detector._detect_from_official_manifest()

        assert isinstance(versions, list)
        assert len(versions) > 0
        assert all(isinstance(v, VersionInfo) for v in versions)
        assert versions[0].source == "Official"

    @patch('version_detector.httpx.Client')
    def test_detect_from_official_manifest_failure(self, mock_client_class):
        """Test official manifest detection with network error."""
        mock_client = MagicMock()
        mock_client.get.side_effect = Exception("Network error")
        mock_client_class.return_value = mock_client

        detector = GameVersionDetector()
        detector.client = mock_client

        versions = detector._detect_from_official_manifest()

        assert versions == []

    @patch('version_detector.httpx.Client')
    def test_detect_from_updatecrackgames_success(self, mock_client_class):
        """Test successful UpdateCrackGames detection."""
        html_response = """
        <html>
            <body>
                <a href="/sims4-patch">Sims 4 Patch 1.100.0</a>
                <p>Latest patch version 1.100.0.1000</p>
            </body>
        </html>
        """

        mock_client = MagicMock()
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = html_response
        mock_client.get.return_value = mock_response
        mock_client_class.return_value = mock_client

        detector = GameVersionDetector()
        detector.client = mock_client

        versions = detector._detect_from_updatecrackgames()

        assert isinstance(versions, list)
        assert all(isinstance(v, VersionInfo) for v in versions)
        if versions:
            assert versions[0].source == "UpdateCrackGames"

    @patch('version_detector.httpx.Client')
    def test_detect_from_fitgirl_success(self, mock_client_class):
        """Test successful FitGirl Repacks detection."""
        html_response = """
        <html>
            <body>
                <h1>Sims 4 Patch 1.100 - Growing Together</h1>
                <p>Version: 1.100.0.1000</p>
            </body>
        </html>
        """

        mock_client = MagicMock()
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = html_response
        mock_client.get.return_value = mock_response
        mock_client_class.return_value = mock_client

        detector = GameVersionDetector()
        detector.client = mock_client

        versions = detector._detect_from_fitgirl()

        assert isinstance(versions, list)
        if versions:
            assert versions[0].source == "FitGirl Repacks"

    @patch('version_detector.httpx.Client')
    def test_detect_from_elamigos_success(self, mock_client_class):
        """Test successful ElAmigos detection."""
        html_response = """
        <html>
            <body>
                <p>Sims 4 Update 1.100.0</p>
            </body>
        </html>
        """

        mock_client = MagicMock()
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.text = html_response
        mock_client.get.return_value = mock_response
        mock_client_class.return_value = mock_client

        detector = GameVersionDetector()
        detector.client = mock_client

        versions = detector._detect_from_elamigos()

        assert isinstance(versions, list)
        if versions:
            assert versions[0].source == "ElAmigos"

    def test_parse_html_for_versions_with_patch_names(self):
        """Test HTML parsing for versions with patch names."""
        html = """
        <html>
            <body>
                <h2>Patch 1.100 - Growing Together</h2>
                <h2>Patch 1.95 - High School Years</h2>
                <h2>Patch 1.50 - Cats & Dogs</h2>
            </body>
        </html>
        """

        detector = GameVersionDetector()
        versions = detector._parse_html_for_versions(html, "Test Source")

        assert len(versions) >= 3
        assert versions[0].source == "Test Source"
        assert versions[0].is_verified == False

    def test_parse_html_for_versions_semantic_fallback(self):
        """Test HTML parsing falls back to semantic versions."""
        html = """
        <html>
            <body>
                <p>Version 1.100.0 now available</p>
                <p>Latest: 1.95.0.500</p>
            </body>
        </html>
        """

        detector = GameVersionDetector()
        versions = detector._parse_html_for_versions(html, "Test Source")

        assert len(versions) > 0
        # Should have detected semantic versions
        version_strings = [v.version_string for v in versions]
        assert "1.100.0" in version_strings or "1.95.0.500" in version_strings

    def test_parse_html_deduplication(self):
        """Test that duplicate versions are not added twice."""
        html = """
        <html>
            <body>
                <h2>Patch 1.100 - Growing Together</h2>
                <h2>Patch 1.100 - Growing Together Update</h2>
                <p>Version 1.100.0</p>
            </body>
        </html>
        """

        detector = GameVersionDetector()
        versions = detector._parse_html_for_versions(html, "Test Source")

        # Check that 1.100 is only added once (deduplicated)
        version_strings = [v.version_string for v in versions]
        assert version_strings.count("1.100") <= 1

    def test_find_latest_version_sorting(self):
        """Test version sorting to find latest."""
        versions = [
            VersionInfo("1.50.0", source="Source1"),
            VersionInfo("1.100.0", source="Source2"),
            VersionInfo("1.95.0", source="Source3"),
            VersionInfo("1.75.0", source="Source4"),
        ]

        detector = GameVersionDetector()
        latest = detector._find_latest_version(versions)

        assert latest.version_string == "1.100.0"

    def test_find_latest_version_with_confidence_boost(self):
        """Test that versions from multiple sources get confidence boost."""
        versions = [
            VersionInfo("1.100.0", source="Source1", confidence_score=0.6),
            VersionInfo("1.100.0", source="Source2", confidence_score=0.6),
            VersionInfo("1.100.0", source="Source3", confidence_score=0.6),
            VersionInfo("1.95.0", source="Source4", confidence_score=0.8),
        ]

        detector = GameVersionDetector()
        latest = detector._find_latest_version(versions)

        # Latest version should be 1.100.0 (newest)
        assert latest.version_string == "1.100.0"
        # And should be verified (found in multiple sources)
        assert latest.is_verified == True
        # Confidence should be boosted
        assert latest.confidence_score > 0.6

    def test_find_latest_version_empty_list_raises(self):
        """Test that empty version list raises ValueError."""
        detector = GameVersionDetector()

        with pytest.raises(ValueError):
            detector._find_latest_version([])

    @patch('version_detector.GameVersionDetector._detect_from_official_manifest')
    @patch('version_detector.GameVersionDetector._detect_from_updatecrackgames')
    @patch('version_detector.GameVersionDetector._detect_from_fitgirl')
    @patch('version_detector.GameVersionDetector._detect_from_elamigos')
    def test_detect_sims4_latest_version_integration(
        self,
        mock_elamigos,
        mock_fitgirl,
        mock_updatecrackgames,
        mock_official
    ):
        """Test full version detection workflow."""
        # Setup mock returns
        mock_official.return_value = [
            VersionInfo("1.100.0", source="Official", confidence_score=0.9)
        ]
        mock_updatecrackgames.return_value = [
            VersionInfo("1.100.0", source="UpdateCrackGames", confidence_score=0.8)
        ]
        mock_fitgirl.return_value = [
            VersionInfo("1.100.0", source="FitGirl Repacks", confidence_score=0.8)
        ]
        mock_elamigos.return_value = [
            VersionInfo("1.95.0", source="ElAmigos", confidence_score=0.7)
        ]

        detector = GameVersionDetector()
        latest = detector.detect_sims4_latest_version()

        assert latest is not None
        assert latest.version_string == "1.100.0"
        # Should be verified (found in multiple sources)
        assert latest.is_verified == True
        # Should have boosted confidence
        assert latest.confidence_score >= 0.8

    @patch('version_detector.GameVersionDetector._detect_from_official_manifest')
    @patch('version_detector.GameVersionDetector._detect_from_updatecrackgames')
    @patch('version_detector.GameVersionDetector._detect_from_fitgirl')
    @patch('version_detector.GameVersionDetector._detect_from_elamigos')
    def test_detect_sims4_latest_version_no_versions_found(
        self,
        mock_elamigos,
        mock_fitgirl,
        mock_updatecrackgames,
        mock_official
    ):
        """Test version detection when no versions are found."""
        # All sources return empty lists
        mock_official.return_value = []
        mock_updatecrackgames.return_value = []
        mock_fitgirl.return_value = []
        mock_elamigos.return_value = []

        detector = GameVersionDetector()
        latest = detector.detect_sims4_latest_version()

        assert latest is None

    def test_check_for_update_available(self):
        """Test update checking when update is available."""
        detector = GameVersionDetector()

        # Mock the detect method
        detector.detect_sims4_latest_version = Mock(
            return_value=VersionInfo("1.100.0", source="Official")
        )

        update_available, latest_info = detector.check_for_update("1.95.0")

        assert update_available == True
        assert latest_info is not None
        assert latest_info.version_string == "1.100.0"

    def test_check_for_update_not_available(self):
        """Test update checking when no update is available."""
        detector = GameVersionDetector()

        # Mock the detect method
        detector.detect_sims4_latest_version = Mock(
            return_value=VersionInfo("1.100.0", source="Official")
        )

        update_available, latest_info = detector.check_for_update("1.100.0")

        assert update_available == False
        assert latest_info is None

    def test_check_for_update_newer_installed(self):
        """Test update checking when installed version is newer."""
        detector = GameVersionDetector()

        # Mock the detect method
        detector.detect_sims4_latest_version = Mock(
            return_value=VersionInfo("1.100.0", source="Official")
        )

        update_available, latest_info = detector.check_for_update("1.105.0")

        assert update_available == False
        assert latest_info is None

    def test_check_for_update_invalid_version(self):
        """Test update checking with invalid current version."""
        detector = GameVersionDetector()

        # Mock the detect method
        detector.detect_sims4_latest_version = Mock(
            return_value=VersionInfo("1.100.0", source="Official")
        )

        update_available, latest_info = detector.check_for_update("invalid")

        assert update_available == False
        assert latest_info is None

    def test_check_for_update_no_latest_detected(self):
        """Test update checking when latest version cannot be detected."""
        detector = GameVersionDetector()

        # Mock the detect method to return None
        detector.detect_sims4_latest_version = Mock(return_value=None)

        update_available, latest_info = detector.check_for_update("1.95.0")

        assert update_available == False
        assert latest_info is None

    def test_get_version_history(self):
        """Test retrieving version history."""
        detector = GameVersionDetector()

        # Populate discovered_versions set directly
        detector.discovered_versions = {
            "1.100.0", "1.95.0", "1.90.0", "1.85.0", "1.80.0"
        }

        history = detector.get_version_history(limit=5)

        assert isinstance(history, list)
        assert len(history) > 0
        # Should be sorted newest first
        if len(history) > 1:
            assert history[0] > history[1]

    def test_get_version_history_limit(self):
        """Test version history respects limit."""
        detector = GameVersionDetector()

        # Add many versions
        detector.discovered_versions = {
            "1.100.0", "1.95.0", "1.90.0", "1.85.0",
            "1.80.0", "1.75.0", "1.70.0", "1.65.0"
        }

        history = detector.get_version_history(limit=3)

        assert len(history) == 3
        # Should be sorted newest first
        assert history[0].version_string == "1.100.0"
        assert history[1].version_string == "1.95.0"
        assert history[2].version_string == "1.90.0"


class TestVersionDetectorErrorHandling:
    """Test error handling in version detection."""

    @patch('version_detector.httpx.Client')
    def test_timeout_handling(self, mock_client_class):
        """Test handling of timeout errors."""
        mock_client = MagicMock()
        mock_client.get.side_effect = Exception("Timeout")
        mock_client_class.return_value = mock_client

        detector = GameVersionDetector()
        detector.client = mock_client

        # Should not raise, should return empty list
        versions = detector._detect_from_official_manifest()
        assert versions == []

    @patch('version_detector.httpx.Client')
    def test_http_404_handling(self, mock_client_class):
        """Test handling of 404 errors."""
        mock_client = MagicMock()
        mock_response = Mock()
        mock_response.status_code = 404
        mock_response.text = ""
        mock_client.get.return_value = mock_response
        mock_client_class.return_value = mock_client

        detector = GameVersionDetector()
        detector.client = mock_client

        versions = detector._detect_from_official_manifest()
        assert versions == []

    def test_invalid_version_format_comparison(self):
        """Test comparison with invalid version formats."""
        v1 = VersionInfo("invalid1")
        v2 = VersionInfo("invalid2")

        # Should fall back to string comparison
        assert v1 < v2
        assert v2 > v1

    def test_parse_html_empty_content(self):
        """Test parsing empty HTML content."""
        detector = GameVersionDetector()
        versions = detector._parse_html_for_versions("", "Test Source")

        assert versions == []

    def test_parse_html_with_malformed_html(self):
        """Test parsing malformed HTML."""
        html = "<html><body><unclosed tag><p>Patch 1.100.0</body>"

        detector = GameVersionDetector()
        # Should not raise, should handle gracefully
        versions = detector._parse_html_for_versions(html, "Test Source")

        # May or may not find versions depending on parser robustness
        assert isinstance(versions, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
