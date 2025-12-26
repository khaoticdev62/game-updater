"""
Engine module for file verification, dependency resolution, and manifest parsing.

Provides:
- VerificationEngine: Calculates file hashes and verifies file integrity
- DLCGraph: Manages pack dependencies and resolves transitive dependencies
- ManifestParser: Parses and extracts information from manifest JSON
- Version: Semantic version parsing and comparison
"""

import hashlib
import os
import json
import logging
from concurrent.futures import ThreadPoolExecutor
from logging_system import get_logger

# Setup logging
logger = get_logger()

class VerificationEngine:
    def __init__(self, max_workers=None):
        self.max_workers = max_workers or os.cpu_count()

    @staticmethod
    def hash_file(file_path):
        """
        Calculates MD5 hash of a file using optimized file_digest.

        Args:
            file_path: Path to the file to hash

        Returns:
            str: Uppercase hexadecimal hash string, or None if file cannot be hashed

        Raises:
            FileNotFoundError: If the file does not exist
            PermissionError: If the file cannot be read due to permissions
            IOError: If there's an error reading the file
        """
        try:
            with open(file_path, 'rb') as f:
                return hashlib.file_digest(f, "md5").hexdigest().upper()
        except FileNotFoundError as e:
            logger.error(f"File not found when hashing: {file_path}")
            raise
        except PermissionError as e:
            logger.error(f"Permission denied reading file for hash: {file_path}")
            raise
        except IOError as e:
            logger.error(f"IO error while hashing file {file_path}: {e}")
            raise
        except Exception as e:
            logger.exception(f"Unexpected error hashing file {file_path}: {e}")
            raise

    def verify_files(self, file_paths):
        """Verifies multiple files using multi-threading."""
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Map returns results in the same order as input
            results = list(executor.map(self.hash_file, file_paths))
        
        # Return a dictionary of path -> hash
        return dict(zip(file_paths, results))

class DLCGraph:
    """
    Manages dependencies between game packs and core versions.
    """
    def __init__(self):
        # map of pack_id -> list of required pack_ids
        self.dependencies = {}

    def add_dependency(self, pack_id: str, requires: str):
        if pack_id not in self.dependencies:
            self.dependencies[pack_id] = []
        if requires not in self.dependencies[pack_id]:
            self.dependencies[pack_id].append(requires)

    def resolve_dependencies(self, selected_packs: list) -> set:
        """
        Returns the complete set of required packs including transitive dependencies.
        """
        resolved = set(selected_packs)
        stack = list(selected_packs)

        while stack:
            current = stack.pop()
            if current in self.dependencies:
                for dep in self.dependencies[current]:
                    if dep not in resolved:
                        resolved.add(dep)
                        stack.append(dep)
        return resolved

class ManifestParser:
    def __init__(self, json_data):
        """
        Initialize manifest parser with JSON data.

        Args:
            json_data: JSON string or dict to parse

        Raises:
            ValueError: If JSON is invalid or missing required structure
            TypeError: If json_data is neither string nor dict
        """
        try:
            if isinstance(json_data, str):
                self.data = json.loads(json_data)
            elif isinstance(json_data, dict):
                self.data = json_data
            else:
                raise TypeError(f"Expected str or dict, got {type(json_data).__name__}")

            # Validate required fields
            if not isinstance(self.data, dict):
                raise ValueError("Manifest must be a JSON object (dict)")
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in manifest: {e}")
            raise ValueError(f"Failed to parse manifest JSON: {e}")
        except TypeError as e:
            logger.error(f"Invalid manifest data type: {e}")
            raise
        except Exception as e:
            logger.exception(f"Unexpected error parsing manifest: {e}")
            raise ValueError(f"Error initializing manifest parser: {e}")

    def get_target_version(self):
        return self.data.get("version")

    def get_dependencies(self) -> dict:
        """Returns the dependency map from manifest."""
        return self.data.get("dependencies", {})

    def get_categorized_patches(self) -> dict:
        """
        Returns patches grouped by category.
        Categories: Base, EP, GP, SP, Kit, Language
        """
        categorized = {}
        for patch in self.get_patches():
            cat = patch.get("category", "Base")
            if cat not in categorized:
                categorized[cat] = []
            categorized[cat].append(patch)
        return categorized

    def get_patches(self):
        patch_section = self.data.get("patch", {})
        return patch_section.get("files", [])

class Version:
    def __init__(self, version_str):
        self.parts = [int(x) for x in version_str.split('.')]

    def __lt__(self, other):
        return self.parts < other.parts

    def __eq__(self, other):
        return self.parts == other.parts

    def __str__(self):
        return '.'.join(map(str, self.parts))
