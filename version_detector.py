#!/usr/bin/env python3
"""
Game Version Detector - Automatically discovers and identifies the latest
available version of games (primarily Sims 4) from multiple sources.

Supports:
- Direct patch manifest queries
- Web scraping from known update sites
- Version comparison and ranking
- Multi-source verification
"""

import re
import httpx
import json
from typing import Optional, List, Tuple, Dict, Set
from dataclasses import dataclass
from packaging import version
from bs4 import BeautifulSoup
from logging_system import get_logger

logger = get_logger()


@dataclass
class VersionInfo:
    """Information about a discovered game version."""
    version_string: str
    release_date: Optional[str] = None
    patch_name: Optional[str] = None
    source: str = "unknown"
    download_urls: List[str] = None
    is_verified: bool = False
    confidence_score: float = 0.0  # 0-1, higher is more confident

    def __post_init__(self):
        if self.download_urls is None:
            self.download_urls = []

    def __lt__(self, other):
        """Allow version comparison."""
        try:
            return version.parse(self.version_string) < version.parse(other.version_string)
        except:
            return self.version_string < other.version_string

    def __gt__(self, other):
        """Allow version comparison."""
        try:
            return version.parse(self.version_string) > version.parse(other.version_string)
        except:
            return self.version_string > other.version_string

    def __eq__(self, other):
        """Allow version comparison."""
        try:
            return version.parse(self.version_string) == version.parse(other.version_string)
        except:
            return self.version_string == other.version_string

    def to_dict(self) -> dict:
        """Convert to dictionary."""
        return {
            'version': self.version_string,
            'release_date': self.release_date,
            'patch_name': self.patch_name,
            'source': self.source,
            'download_urls': self.download_urls,
            'verified': self.is_verified,
            'confidence': round(self.confidence_score, 2)
        }


class VersionRegexPatterns:
    """Regular expressions for extracting version numbers from different sources."""

    # Standard semantic versioning: X.Y.Z or X.Y.Z.W
    SEMANTIC_VERSION = re.compile(r'\b(\d+\.\d+\.\d+(?:\.\d+)?)\b')

    # Sims 4 patch naming convention: "Patch 1.100" or "Patch 1.100.0"
    SIMS4_PATCH = re.compile(
        r'(?:patch|update)[\s\-_]*(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)',
        re.IGNORECASE
    )

    # Common patch names: "Patch 1.100 - Growing Together"
    SIMS4_PATCH_WITH_NAME = re.compile(
        r'patch[\s\-_]*(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)[\s\-_]*[–\-–][\s]*([^<\n\r]+)',
        re.IGNORECASE
    )

    # Release date patterns
    DATE_PATTERN = re.compile(
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|'
        r'\d{4}[/-]\d{1,2}[/-]\d{1,2}|'
        r'(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})',
        re.IGNORECASE
    )


class GameVersionDetector:
    """
    Detects and identifies the latest available game versions from multiple sources.
    """

    # Known sources for Sims 4 version information
    KNOWN_SOURCES = {
        'sims4_official': 'https://www.thesims.com/',
        'updatecrackgames': 'https://updatecrackgames.com/',
        'fitgirl_repacks': 'https://fitgirl-repacks.site/',
        'elamigos': 'https://elamigos.site/',
    }

    def __init__(self, timeout: float = 10.0):
        """
        Initialize version detector.

        Args:
            timeout: HTTP request timeout in seconds
        """
        self.timeout = timeout
        self.client = httpx.Client(timeout=timeout)
        self.discovered_versions: Set[str] = set()

    def detect_sims4_latest_version(self) -> Optional[VersionInfo]:
        """
        Detect the latest Sims 4 version from multiple sources.

        Returns:
            VersionInfo for latest version, or None if unable to detect
        """
        logger.info("Starting Sims 4 version detection from multiple sources...")

        versions = []

        # Try each source
        sources = [
            ('Official Manifest', self._detect_from_official_manifest),
            ('UpdateCrackGames', self._detect_from_updatecrackgames),
            ('FitGirl Repacks', self._detect_from_fitgirl),
            ('ElAmigos', self._detect_from_elamigos),
        ]

        for source_name, detector_func in sources:
            try:
                logger.debug(f"Detecting version from {source_name}...")
                found_versions = detector_func()
                if found_versions:
                    logger.info(f"Found {len(found_versions)} version(s) from {source_name}")
                    versions.extend(found_versions)
            except Exception as e:
                logger.warning(f"Failed to detect from {source_name}: {e}")

        if not versions:
            logger.warning("Could not detect any Sims 4 versions")
            return None

        # Find the latest version
        latest = self._find_latest_version(versions)
        logger.info(f"Latest Sims 4 version detected: {latest.version_string}")

        return latest

    def _detect_from_official_manifest(self) -> List[VersionInfo]:
        """
        Detect version from official Sims 4 manifest or patch notes.

        Returns:
            List of VersionInfo objects
        """
        versions = []

        try:
            # Try to fetch official patch notes page
            response = self.client.get('https://www.thesims.com/news')
            if response.status_code == 200:
                versions.extend(self._parse_html_for_versions(
                    response.text,
                    'Official',
                    confidence_boost=0.3
                ))
        except Exception as e:
            logger.debug(f"Failed to fetch official patches: {e}")

        return versions

    def _detect_from_updatecrackgames(self) -> List[VersionInfo]:
        """
        Detect Sims 4 version from UpdateCrackGames website.

        Returns:
            List of VersionInfo objects
        """
        versions = []

        try:
            response = self.client.get(
                'https://updatecrackgames.com/',
                headers={'User-Agent': 'Mozilla/5.0'}
            )

            if response.status_code == 200:
                versions.extend(self._parse_html_for_versions(
                    response.text,
                    'UpdateCrackGames',
                    confidence_boost=0.2
                ))

                # Also try to find direct Sims 4 patch links
                soup = BeautifulSoup(response.text, 'html.parser')
                for link in soup.find_all('a', href=True):
                    href = link['href']
                    text = link.get_text()

                    if 'sims 4' in text.lower() and 'patch' in text.lower():
                        version_matches = VersionRegexPatterns.SIMS4_PATCH.findall(text)
                        for ver in version_matches:
                            versions.append(VersionInfo(
                                version_string=ver,
                                patch_name=text.strip(),
                                source='UpdateCrackGames',
                                download_urls=[href] if href else [],
                                is_verified=True,
                                confidence_score=0.8
                            ))

        except Exception as e:
            logger.debug(f"Failed to detect from UpdateCrackGames: {e}")

        return versions

    def _detect_from_fitgirl(self) -> List[VersionInfo]:
        """
        Detect Sims 4 version from FitGirl Repacks.

        Returns:
            List of VersionInfo objects
        """
        versions = []

        try:
            response = self.client.get(
                'https://fitgirl-repacks.site/',
                headers={'User-Agent': 'Mozilla/5.0'}
            )

            if response.status_code == 200:
                versions.extend(self._parse_html_for_versions(
                    response.text,
                    'FitGirl Repacks',
                    confidence_boost=0.25
                ))

        except Exception as e:
            logger.debug(f"Failed to detect from FitGirl: {e}")

        return versions

    def _detect_from_elamigos(self) -> List[VersionInfo]:
        """
        Detect Sims 4 version from ElAmigos.

        Returns:
            List of VersionInfo objects
        """
        versions = []

        try:
            response = self.client.get(
                'https://elamigos.site/',
                headers={'User-Agent': 'Mozilla/5.0'}
            )

            if response.status_code == 200:
                versions.extend(self._parse_html_for_versions(
                    response.text,
                    'ElAmigos',
                    confidence_boost=0.2
                ))

        except Exception as e:
            logger.debug(f"Failed to detect from ElAmigos: {e}")

        return versions

    def _parse_html_for_versions(
        self,
        html: str,
        source: str,
        confidence_boost: float = 0.0
    ) -> List[VersionInfo]:
        """
        Parse HTML content for Sims 4 version information.

        Args:
            html: HTML content to parse
            source: Source name for attribution
            confidence_boost: Confidence boost for this source

        Returns:
            List of VersionInfo objects found
        """
        versions = []
        soup = BeautifulSoup(html, 'html.parser')

        # Look through all text content
        text = soup.get_text()

        # Find Sims 4 patch mentions
        for match in VersionRegexPatterns.SIMS4_PATCH_WITH_NAME.finditer(text):
            ver = match.group(1)
            name = match.group(2)

            if ver not in self.discovered_versions:
                versions.append(VersionInfo(
                    version_string=ver,
                    patch_name=name.strip(),
                    source=source,
                    is_verified=False,
                    confidence_score=0.6 + confidence_boost
                ))
                self.discovered_versions.add(ver)

        # Find general version patterns
        for match in VersionRegexPatterns.SEMANTIC_VERSION.finditer(text):
            ver = match.group(1)

            # Filter for plausible Sims 4 versions (1.x.x or higher)
            if ver.startswith('1.') and ver not in self.discovered_versions:
                versions.append(VersionInfo(
                    version_string=ver,
                    source=source,
                    is_verified=False,
                    confidence_score=0.4 + confidence_boost
                ))
                self.discovered_versions.add(ver)

        return versions

    def _find_latest_version(self, versions: List[VersionInfo]) -> VersionInfo:
        """
        Find the latest version from a list.

        Args:
            versions: List of VersionInfo objects

        Returns:
            Latest VersionInfo
        """
        if not versions:
            raise ValueError("No versions provided")

        # Sort by version number
        sorted_versions = sorted(versions, reverse=True)

        # Return the latest
        latest = sorted_versions[0]

        # Boost confidence for versions from multiple sources
        version_counts = {}
        for v in versions:
            key = v.version_string
            if key not in version_counts:
                version_counts[key] = {'count': 0, 'sources': set()}
            version_counts[key]['count'] += 1
            version_counts[key]['sources'].add(v.source)

        if version_counts[latest.version_string]['count'] > 1:
            # Version found in multiple sources = higher confidence
            latest.is_verified = True
            latest.confidence_score = min(1.0, latest.confidence_score + 0.2)

        logger.info(f"Latest version: {latest.version_string} "
                   f"(Confidence: {latest.confidence_score:.0%}, "
                   f"Sources: {version_counts[latest.version_string]['count']})")

        return latest

    def get_version_history(self, limit: int = 10) -> List[VersionInfo]:
        """
        Get sorted version history (newest first).

        Args:
            limit: Maximum number of versions to return

        Returns:
            List of VersionInfo objects sorted by version (newest first)
        """
        if not self.discovered_versions:
            self.detect_sims4_latest_version()

        # Convert set to list of VersionInfo objects
        versions = [
            VersionInfo(version_string=v, source='detected')
            for v in self.discovered_versions
        ]

        # Sort and limit
        sorted_versions = sorted(versions, reverse=True)
        return sorted_versions[:limit]

    def check_for_update(self, current_version: str) -> Tuple[bool, Optional[VersionInfo]]:
        """
        Check if an update is available for the given current version.

        Args:
            current_version: Current installed version string

        Returns:
            Tuple of (update_available, latest_version_info)
        """
        try:
            current = version.parse(current_version)
        except:
            logger.warning(f"Invalid version format: {current_version}")
            return False, None

        latest = self.detect_sims4_latest_version()
        if not latest:
            return False, None

        try:
            latest_ver = version.parse(latest.version_string)
        except:
            logger.warning(f"Invalid latest version format: {latest.version_string}")
            return False, None

        update_available = latest_ver > current
        logger.info(f"Update check: {current_version} → {latest.version_string} "
                   f"(Available: {update_available})")

        return update_available, latest if update_available else None
