#!/usr/bin/env python3
"""
Script to automatically optimize manifest files by testing mirrors and
selecting the best available link.

Usage:
    python optimize_manifest.py manifest_file.json
    python optimize_manifest.py manifest_file.json --output optimized_manifest.json
    python optimize_manifest.py manifest_file.json --auto-save
"""

import json
import sys
from pathlib import Path
from typing import Optional
from manifest import MirrorOptimizer
from logging_system import get_logger

logger = get_logger()


def optimize_manifest_file(
    manifest_path: str,
    output_path: Optional[str] = None,
    mirror_keys: Optional[list] = None,
    timeout: float = 5.0,
    auto_save: bool = False
) -> dict:
    """
    Optimize a manifest file by testing and ranking mirrors.

    Args:
        manifest_path: Path to manifest JSON file
        output_path: Path to save optimized manifest (default: overwrites input)
        mirror_keys: List of JSON keys containing mirror URLs
                    (default: ['download_info.primary_link', 'download_info.mirrors'])
        timeout: Timeout for mirror tests in seconds
        auto_save: Automatically save changes back to file

    Returns:
        Optimized manifest dictionary
    """
    # Default mirror keys to check
    if mirror_keys is None:
        mirror_keys = [
            'download_info.primary_link',
            'download_info.mirrors.0',
            'download_info.mirrors.1',
            'download_info.mirrors.2',
            'download_info.mirrors.3',
            'download_info.mirrors.4',
        ]

    # Load manifest
    manifest_path = Path(manifest_path)
    if not manifest_path.exists():
        logger.error(f"Manifest file not found: {manifest_path}")
        return {}

    with open(manifest_path, 'r') as f:
        manifest = json.load(f)
    logger.info(f"Loaded manifest from {manifest_path}")

    # Optimize with MirrorOptimizer
    optimizer = MirrorOptimizer(timeout=timeout, max_workers=5)

    print("\n" + "="*70)
    print("MANIFEST MIRROR OPTIMIZATION")
    print("="*70)
    print(f"Manifest: {manifest_path}")
    print(f"Testing mirrors with {timeout}s timeout...\n")

    optimized_manifest = optimizer.update_manifest_with_best_link(manifest, mirror_keys)

    # Update metadata
    from datetime import datetime
    optimized_manifest['metadata'] = optimized_manifest.get('metadata', {})
    optimized_manifest['metadata']['auto_selected_best_mirror'] = True
    optimized_manifest['metadata']['last_mirror_test'] = datetime.utcnow().isoformat()

    # Determine output path
    final_output = output_path or (manifest_path if auto_save else None)

    # Save result
    if final_output:
        final_output = Path(final_output)
        with open(final_output, 'w') as f:
            json.dump(optimized_manifest, f, indent=2)
        logger.info(f"Optimized manifest saved to {final_output}")
        print(f"\n✓ Optimized manifest saved to {final_output}")
    else:
        print("\n✓ Optimization complete (use --output or --auto-save to persist)")

    print("="*70 + "\n")
    return optimized_manifest


def main():
    """CLI entry point."""
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    manifest_path = sys.argv[1]
    output_path = None
    auto_save = False

    # Parse arguments
    for i, arg in enumerate(sys.argv[2:], 2):
        if arg == '--output' and i + 1 < len(sys.argv):
            output_path = sys.argv[i + 1]
        elif arg == '--auto-save':
            auto_save = True
        elif arg == '--help':
            print(__doc__)
            sys.exit(0)

    # Optimize
    try:
        optimize_manifest_file(
            manifest_path,
            output_path=output_path,
            auto_save=auto_save
        )
    except Exception as e:
        logger.exception(f"Error optimizing manifest: {e}")
        print(f"✗ Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
