"""
DLC Unlocker Management Module.

Handles detection, installation, and uninstallation of the EA DLC Unlocker.
Provides a safe, user-friendly interface for managing the unlocker tool.
"""

import os
import sys
import shutil
import subprocess
import logging
from pathlib import Path
from typing import Dict, Tuple, Optional, List
from dataclasses import dataclass
from enum import Enum
from datetime import datetime

# Configure logging
logger = logging.getLogger("dlc_unlocker")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


# ============================================================================
# Data Classes and Enums
# ============================================================================

class ClientType(Enum):
    """Supported game clients."""
    EA_APP = "ea_app"
    ORIGIN = "origin"
    UNKNOWN = "unknown"


@dataclass
class ClientInfo:
    """Information about detected client."""
    client_type: ClientType
    path: Optional[Path]
    version: Optional[str] = None
    is_running: bool = False


@dataclass
class UnlockerStatus:
    """Status of DLC Unlocker installation."""
    installed: bool
    client_type: Optional[ClientType]
    client_path: Optional[Path]
    unlocker_path: Optional[Path]
    config_exists: bool
    version_dll_exists: bool
    backup_available: bool
    last_installed: Optional[datetime] = None


# ============================================================================
# Constants
# ============================================================================

# DLC Unlocker location
UNLOCKER_ROOT = Path(__file__).parent / "EA DLC Unlocker v2"
SETUP_BAT = UNLOCKER_ROOT / "setup.bat"
SETUP_LINUX = UNLOCKER_ROOT / "setup_linux.sh"
CONFIG_FILE = UNLOCKER_ROOT / "config.ini"
DLC_CONFIG = UNLOCKER_ROOT / "g_The Sims 4.ini"
BACKUP_DIR = UNLOCKER_ROOT / "backups"

# EA App and Origin paths
EA_APP_REGISTRY_KEY = (
    r"Software\Electronic Arts\EA App"
)
ORIGIN_REGISTRY_KEY = r"Software\Electronic Arts\Electronic Arts Launcher"

# Version DLL paths relative to client installation
VERSION_DLLS = {
    ClientType.EA_APP: "version.dll",
    ClientType.ORIGIN: "version.dll"
}


# ============================================================================
# Client Detection
# ============================================================================

def detect_client() -> ClientInfo:
    """
    Detect installed game client (EA App or Origin).

    Uses Windows Registry to locate client installation.
    Works on Windows only; returns UNKNOWN on other platforms.

    Returns:
        ClientInfo object with detected client details
    """
    if sys.platform != "win32":
        logger.info("Non-Windows platform detected; client detection skipped")
        return ClientInfo(
            client_type=ClientType.UNKNOWN,
            path=None,
            version=None,
            is_running=False
        )

    try:
        import winreg

        # Try EA App first (newer client)
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, EA_APP_REGISTRY_KEY) as key:
                install_path, _ = winreg.QueryValueEx(key, "InstallPath")
                if install_path and Path(install_path).exists():
                    logger.info(f"EA App detected at: {install_path}")
                    return ClientInfo(
                        client_type=ClientType.EA_APP,
                        path=Path(install_path),
                        version=_get_client_version(Path(install_path))
                    )
        except (FileNotFoundError, OSError):
            pass

        # Try Origin (older client)
        try:
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, ORIGIN_REGISTRY_KEY) as key:
                install_path, _ = winreg.QueryValueEx(key, "InstallPath")
                if install_path and Path(install_path).exists():
                    logger.info(f"Origin detected at: {install_path}")
                    return ClientInfo(
                        client_type=ClientType.ORIGIN,
                        path=Path(install_path),
                        version=_get_client_version(Path(install_path))
                    )
        except (FileNotFoundError, OSError):
            pass

    except ImportError:
        logger.warning("winreg module not available")

    logger.warning("No game client detected")
    return ClientInfo(
        client_type=ClientType.UNKNOWN,
        path=None,
        version=None,
        is_running=False
    )


def _get_client_version(client_path: Path) -> Optional[str]:
    """
    Get version of game client.

    Args:
        client_path: Path to client installation

    Returns:
        Version string or None if not found
    """
    try:
        # Try to read version from manifest or config
        manifest = client_path / "EAAppManifest.xml"
        if manifest.exists():
            # Simple version extraction from manifest
            with open(manifest, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                if '<AppVersion>' in content:
                    start = content.find('<AppVersion>') + len('<AppVersion>')
                    end = content.find('</AppVersion>', start)
                    if end > start:
                        return content[start:end]
    except Exception as e:
        logger.debug(f"Could not read client version: {e}")

    return None


def is_client_running(client_type: ClientType) -> bool:
    """
    Check if game client process is running.

    Args:
        client_type: Type of client to check

    Returns:
        True if client is running, False otherwise
    """
    if sys.platform != "win32":
        return False

    try:
        import psutil

        process_names = {
            ClientType.EA_APP: ["EALauncher.exe", "EAApp.exe"],
            ClientType.ORIGIN: ["Origin.exe"],
        }

        target_processes = process_names.get(client_type, [])

        for proc in psutil.process_iter(['name']):
            try:
                if proc.info['name'] in target_processes:
                    logger.warning(f"Client process running: {proc.info['name']}")
                    return True
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass

    except ImportError:
        logger.debug("psutil not available for process checking")

    return False


# ============================================================================
# Status Checking
# ============================================================================

def get_unlocker_status() -> UnlockerStatus:
    """
    Get current status of DLC Unlocker installation.

    Returns:
        UnlockerStatus object with current installation state
    """
    client_info = detect_client()

    # Check if unlocker files exist
    config_exists = CONFIG_FILE.exists()
    dlc_config_exists = DLC_CONFIG.exists()
    version_dll_exists = False

    if client_info.path:
        version_dll = client_info.path / VERSION_DLLS.get(client_info.client_type, "version.dll")
        version_dll_exists = version_dll.exists()

    # Check for backups
    backup_available = BACKUP_DIR.exists() and any(BACKUP_DIR.iterdir())

    # Determine installation status
    installed = (
        config_exists and
        dlc_config_exists and
        version_dll_exists and
        client_info.client_type != ClientType.UNKNOWN
    )

    logger.info(f"Unlocker status: installed={installed}")

    return UnlockerStatus(
        installed=installed,
        client_type=client_info.client_type if installed else None,
        client_path=client_info.path,
        unlocker_path=UNLOCKER_ROOT,
        config_exists=config_exists,
        version_dll_exists=version_dll_exists,
        backup_available=backup_available
    )


# ============================================================================
# Backup and Restore
# ============================================================================

def backup_configs() -> Path:
    """
    Create backup of DLC Unlocker configuration.

    Creates timestamped backup directory with all config files.

    Returns:
        Path to backup directory

    Raises:
        IOError: If backup creation fails
    """
    try:
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = BACKUP_DIR / f"backup_{timestamp}"
        backup_path.mkdir(parents=True, exist_ok=True)

        # Backup configuration files
        files_to_backup = [CONFIG_FILE, DLC_CONFIG]

        for file in files_to_backup:
            if file.exists():
                shutil.copy2(file, backup_path / file.name)
                logger.info(f"Backed up: {file.name}")

        logger.info(f"Backup created at: {backup_path}")
        return backup_path

    except Exception as e:
        logger.error(f"Backup failed: {e}")
        raise IOError(f"Failed to create backup: {e}")


def restore_configs(backup_path: Path) -> bool:
    """
    Restore DLC Unlocker configuration from backup.

    Args:
        backup_path: Path to backup directory

    Returns:
        True if restore successful, False otherwise
    """
    try:
        if not backup_path.exists():
            logger.error(f"Backup not found: {backup_path}")
            return False

        # Restore configuration files
        for backup_file in backup_path.iterdir():
            if backup_file.is_file():
                target_file = UNLOCKER_ROOT / backup_file.name
                shutil.copy2(backup_file, target_file)
                logger.info(f"Restored: {backup_file.name}")

        logger.info(f"Restore completed from: {backup_path}")
        return True

    except Exception as e:
        logger.error(f"Restore failed: {e}")
        return False


# ============================================================================
# Installation and Uninstallation
# ============================================================================

def _check_prerequisites() -> Tuple[bool, List[str]]:
    """
    Check prerequisites for installation.

    Validates:
    - Admin rights
    - Client not running
    - Disk space available
    - Setup script exists

    Returns:
        Tuple of (all_ok, list_of_errors)
    """
    errors = []

    # Check for admin rights on Windows
    if sys.platform == "win32":
        try:
            import ctypes
            if not ctypes.windll.shell.IsUserAnAdmin():
                errors.append("Administrator privileges required")
        except Exception as e:
            logger.warning(f"Could not verify admin rights: {e}")

    # Check if client is running
    client_info = detect_client()
    if client_info.client_type != ClientType.UNKNOWN:
        if is_client_running(client_info.client_type):
            errors.append(f"{client_info.client_type.value} must be closed before installation")

    # Check disk space (minimum 500MB)
    try:
        if sys.platform == "win32":
            import shutil as sh
            total, used, free = sh.disk_usage(UNLOCKER_ROOT)
            if free < 500 * 1024 * 1024:  # 500MB
                errors.append("Insufficient disk space (minimum 500MB required)")
    except Exception as e:
        logger.warning(f"Could not check disk space: {e}")

    # Check setup script
    setup_script = SETUP_BAT if sys.platform == "win32" else SETUP_LINUX
    if not setup_script.exists():
        errors.append(f"Setup script not found: {setup_script}")

    return len(errors) == 0, errors


def execute_setup(action: str) -> Tuple[bool, str]:
    """
    Execute DLC Unlocker setup (install/uninstall).

    Creates backup before installation for safety.
    Implements rollback on failure.

    Args:
        action: "install" or "uninstall"

    Returns:
        Tuple of (success, message)
    """
    if action not in ["install", "uninstall"]:
        return False, f"Invalid action: {action}"

    # Check prerequisites
    prerequisites_ok, errors = _check_prerequisites()
    if not prerequisites_ok:
        error_msg = "; ".join(errors)
        logger.error(f"Prerequisites check failed: {error_msg}")
        return False, f"Cannot proceed: {error_msg}"

    try:
        # Create backup before installation
        if action == "install":
            logger.info("Creating backup before installation...")
            backup_path = backup_configs()

        # Execute setup script
        setup_script = SETUP_BAT if sys.platform == "win32" else SETUP_LINUX

        logger.info(f"Executing {action}...")

        # Run setup script with action parameter
        if sys.platform == "win32":
            # On Windows, run batch file
            # The batch file should accept an action parameter
            result = subprocess.run(
                [str(setup_script), action],
                cwd=UNLOCKER_ROOT,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
        else:
            # On Linux
            result = subprocess.run(
                ["bash", str(setup_script), action],
                cwd=UNLOCKER_ROOT,
                capture_output=True,
                text=True,
                timeout=300
            )

        if result.returncode == 0:
            logger.info(f"Setup {action} completed successfully")
            return True, f"DLC Unlocker {action} completed successfully"
        else:
            # Setup failed, attempt rollback
            if action == "install" and 'backup_path' in locals():
                logger.warning("Setup failed, attempting rollback...")
                if restore_configs(backup_path):
                    error_msg = result.stderr or "Setup script returned error"
                    return False, f"Installation failed and rolled back. Error: {error_msg}"

            error_msg = result.stderr or "Setup script returned error"
            logger.error(f"Setup failed: {error_msg}")
            return False, f"Setup {action} failed: {error_msg}"

    except subprocess.TimeoutExpired:
        logger.error("Setup script timed out")
        if action == "install" and 'backup_path' in locals():
            restore_configs(backup_path)
        return False, "Setup operation timed out"

    except Exception as e:
        logger.error(f"Setup execution failed: {e}")
        if action == "install" and 'backup_path' in locals():
            restore_configs(backup_path)
        return False, f"Setup execution failed: {str(e)}"


def install_unlocker() -> Tuple[bool, str]:
    """
    Install DLC Unlocker.

    Returns:
        Tuple of (success, message)
    """
    return execute_setup("install")


def uninstall_unlocker() -> Tuple[bool, str]:
    """
    Uninstall DLC Unlocker.

    Returns:
        Tuple of (success, message)
    """
    return execute_setup("uninstall")


# ============================================================================
# Configuration Management
# ============================================================================

def get_unlocker_config() -> Dict:
    """
    Read DLC Unlocker configuration.

    Returns:
        Dictionary of configuration values
    """
    config = {}

    try:
        if CONFIG_FILE.exists():
            # Simple INI parsing
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                current_section = None
                for line in f:
                    line = line.strip()
                    if not line or line.startswith(';'):
                        continue

                    if line.startswith('[') and line.endswith(']'):
                        current_section = line[1:-1]
                        config[current_section] = {}
                    elif '=' in line and current_section:
                        key, value = line.split('=', 1)
                        config[current_section][key.strip()] = value.strip()

        logger.info("Configuration loaded successfully")

    except Exception as e:
        logger.error(f"Failed to read configuration: {e}")

    return config


# ============================================================================
# Utility Functions
# ============================================================================

def get_status_summary() -> Dict:
    """
    Get comprehensive status summary.

    Returns:
        Dictionary with all relevant status information
    """
    status = get_unlocker_status()
    client_info = detect_client()

    return {
        "installed": status.installed,
        "client": {
            "type": status.client_type.value if status.client_type else None,
            "path": str(status.client_path) if status.client_path else None,
            "running": is_client_running(status.client_type) if status.client_type != ClientType.UNKNOWN else False
        },
        "unlocker": {
            "path": str(status.unlocker_path),
            "config_exists": status.config_exists,
            "version_dll_exists": status.version_dll_exists,
            "backup_available": status.backup_available
        }
    }


# ============================================================================
# Main (for testing)
# ============================================================================

if __name__ == "__main__":
    import json

    print("DLC Unlocker Status")
    print("=" * 50)
    summary = get_status_summary()
    print(json.dumps(summary, indent=2))
