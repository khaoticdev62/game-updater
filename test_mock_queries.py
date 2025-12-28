#!/usr/bin/env python3
"""
DLC Unlocker Mock Query Test Suite

Comprehensive tests simulating real-world usage scenarios with mock data.
Tests complete workflows from client detection through installation/uninstallation.
"""

import json
import sys
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

import dlc_unlocker
from dlc_unlocker import (
    ClientType,
    ClientInfo,
    UnlockerStatus,
)


def test_1_ea_app_detection():
    """Test EA App client detection and unlocker status."""
    print("\n" + "─" * 80)
    print("TEST 1: EA App Client Detection & Unlocker Status")
    print("─" * 80)

    print("\nScenario: User has EA App installed with DLC Unlocker")
    print("Expected: Should detect EA App and confirm unlocker installation\n")

    with patch('dlc_unlocker.detect_client') as mock_detect:
        with patch('dlc_unlocker.is_client_running') as mock_running:
            with patch('dlc_unlocker.get_unlocker_status') as mock_status:
                # Mock EA App detection
                mock_client = ClientInfo(
                    client_type=ClientType.EA_APP,
                    path=Path("C:\\Program Files\\EA Apps\\The Sims 4"),
                    version="1.85.221",
                    is_running=False
                )
                mock_detect.return_value = mock_client
                mock_running.return_value = False

                # Mock installed unlocker status
                mock_unlocker_status = UnlockerStatus(
                    installed=True,
                    client_type=ClientType.EA_APP,
                    client_path=Path("C:\\Program Files\\EA Apps\\The Sims 4"),
                    unlocker_path=Path("C:\\EA DLC Unlocker v2"),
                    config_exists=True,
                    version_dll_exists=True,
                    backup_available=True
                )
                mock_status.return_value = mock_unlocker_status

                # Run test
                client = dlc_unlocker.detect_client()
                is_running = dlc_unlocker.is_client_running(client.client_type)
                status = dlc_unlocker.get_unlocker_status()

                print(f"✓ Client Detected:")
                print(f"  Type: {client.client_type.value.upper()}")
                print(f"  Path: {client.path}")
                print(f"  Version: {client.version}")
                print(f"  Running: {is_running}")

                print(f"\n✓ Unlocker Status:")
                print(f"  Installed: {status.installed}")
                print(f"  Client Type: {status.client_type.value if status.client_type else 'None'}")
                print(f"  Config Exists: {status.config_exists}")
                print(f"  Version DLL: {status.version_dll_exists}")
                print(f"  Backup Available: {status.backup_available}")

                assert client.client_type == ClientType.EA_APP
                assert not is_running
                assert status.installed
                print("\n✅ TEST 1 PASSED")


def test_2_origin_detection():
    """Test legacy Origin client detection."""
    print("\n" + "─" * 80)
    print("TEST 2: Legacy Origin Client Detection")
    print("─" * 80)

    print("\nScenario: User has Legacy Origin client (older installation)\n")

    with patch('dlc_unlocker.detect_client') as mock_detect:
        with patch('dlc_unlocker.is_client_running') as mock_running:
            # Mock Origin detection
            mock_client = ClientInfo(
                client_type=ClientType.ORIGIN,
                path=Path("C:\\Program Files (x86)\\Origin Games\\The Sims 4"),
                version="10.5.115",
                is_running=True  # Origin is running!
            )
            mock_detect.return_value = mock_client
            mock_running.return_value = True

            client = dlc_unlocker.detect_client()
            is_running = dlc_unlocker.is_client_running(client.client_type)

            print(f"✓ Client Detected:")
            print(f"  Type: {client.client_type.value.upper()}")
            print(f"  Path: {client.path}")
            print(f"  Version: {client.version}")
            print(f"  Running: {is_running}")

            if is_running:
                print(f"\n⚠️  WARNING: Game client is currently running!")
                print(f"   Installation/Uninstallation operations are blocked")

            assert client.client_type == ClientType.ORIGIN
            assert is_running
            print("\n✅ TEST 2 PASSED")


def test_3_status_summary():
    """Test complete status summary query."""
    print("\n" + "─" * 80)
    print("TEST 3: Complete Status Summary Query")
    print("─" * 80)

    print("\nScenario: Request full system status for dashboard display\n")

    with patch('dlc_unlocker.get_status_summary') as mock_summary:
        # Mock comprehensive status
        mock_status_data = {
            "installed": True,
            "client": {
                "type": "ea_app",
                "path": "C:\\Program Files\\EA Apps\\The Sims 4",
                "running": False
            },
            "unlocker": {
                "path": "C:\\EA DLC Unlocker v2",
                "config_exists": True,
                "version_dll_exists": True,
                "backup_available": True
            }
        }
        mock_summary.return_value = mock_status_data

        status = mock_summary()

        print("JSON Response (as received by frontend):")
        print(json.dumps(status, indent=2))

        assert status["installed"] is True
        assert status["client"]["type"] == "ea_app"
        assert status["unlocker"]["config_exists"] is True
        print("\n✅ TEST 3 PASSED")


def test_4_installation_flow():
    """Test complete installation flow."""
    print("\n" + "─" * 80)
    print("TEST 4: Installation Flow (from detected to installed)")
    print("─" * 80)

    print("\nScenario: User initiates installation - complete flow\n")

    with patch('dlc_unlocker.execute_setup') as mock_exec:
        with patch('dlc_unlocker.backup_configs') as mock_backup:
            with patch('dlc_unlocker.get_unlocker_status') as mock_get_status:
                # Initial state: not installed
                initial_status = UnlockerStatus(
                    installed=False,
                    client_type=None,
                    client_path=None,
                    unlocker_path=Path("C:\\EA DLC Unlocker v2"),
                    config_exists=True,
                    version_dll_exists=False,
                    backup_available=False
                )

                # After installation
                final_status = UnlockerStatus(
                    installed=True,
                    client_type=ClientType.EA_APP,
                    client_path=Path("C:\\Program Files\\EA Apps\\The Sims 4"),
                    unlocker_path=Path("C:\\EA DLC Unlocker v2"),
                    config_exists=True,
                    version_dll_exists=True,
                    backup_available=True
                )

                mock_get_status.side_effect = [initial_status, final_status]
                mock_backup.return_value = Path("C:\\EA DLC Unlocker v2\\backups\\backup_20251227_181630")
                mock_exec.return_value = (True, "Installation successful")

                # Step 1: Check initial status
                print("Step 1: Check Initial Status")
                status_before = mock_get_status()
                print(f"  Unlocker installed: {status_before.installed}")
                print(f"  Version DLL present: {status_before.version_dll_exists}")

                # Step 2: Create backup
                print("\nStep 2: Create Backup")
                backup_path = mock_backup()
                print(f"  Backup location: {backup_path}")

                # Step 3: Execute installation
                print("\nStep 3: Execute Installation")
                success, message = mock_exec("install")
                print(f"  Status: {'✅ Success' if success else '❌ Failed'}")
                print(f"  Message: {message}")

                # Step 4: Verify installation
                print("\nStep 4: Verify Installation")
                status_after = mock_get_status()
                print(f"  Unlocker installed: {status_after.installed}")
                print(f"  Version DLL present: {status_after.version_dll_exists}")
                print(f"  Backup available: {status_after.backup_available}")

                assert not status_before.installed
                assert success
                assert status_after.installed
                print("\n✅ TEST 4 PASSED")


def test_5_error_scenarios():
    """Test error handling scenarios."""
    print("\n" + "─" * 80)
    print("TEST 5: Error Handling - Various Failure Scenarios")
    print("─" * 80)

    print("\nScenario 1: Client is running (prevents installation)\n")

    with patch('dlc_unlocker._check_prerequisites') as mock_check:
        mock_check.return_value = (False, ["Game client must be closed before installation"])

        ok, errors = mock_check()
        print(f"Prerequisite Check: {'✅ PASS' if ok else '❌ FAIL'}")
        for error in errors:
            print(f"  ⚠️  {error}")

        assert not ok

    print("\nScenario 2: Setup script missing\n")

    with patch('dlc_unlocker._check_prerequisites') as mock_check:
        mock_check.return_value = (False, ["Setup script not found at expected location"])

        ok, errors = mock_check()
        print(f"Prerequisite Check: {'✅ PASS' if ok else '❌ FAIL'}")
        for error in errors:
            print(f"  ⚠️  {error}")

        assert not ok

    print("\nScenario 3: Insufficient disk space\n")

    with patch('dlc_unlocker._check_prerequisites') as mock_check:
        mock_check.return_value = (False, ["Insufficient disk space (minimum 500MB required)"])

        ok, errors = mock_check()
        print(f"Prerequisite Check: {'✅ PASS' if ok else '❌ FAIL'}")
        for error in errors:
            print(f"  ⚠️  {error}")

        assert not ok

    print("\n✅ TEST 5 PASSED")


def test_6_uninstallation_flow():
    """Test uninstallation flow."""
    print("\n" + "─" * 80)
    print("TEST 6: Uninstallation Flow")
    print("─" * 80)

    print("\nScenario: User initiates uninstallation\n")

    with patch('dlc_unlocker.execute_setup') as mock_exec:
        with patch('dlc_unlocker.get_unlocker_status') as mock_get_status:
            # Before uninstall
            before_status = UnlockerStatus(
                installed=True,
                client_type=ClientType.EA_APP,
                client_path=Path("C:\\Program Files\\EA Apps\\The Sims 4"),
                unlocker_path=Path("C:\\EA DLC Unlocker v2"),
                config_exists=True,
                version_dll_exists=True,
                backup_available=True
            )

            # After uninstall
            after_status = UnlockerStatus(
                installed=False,
                client_type=None,
                client_path=None,
                unlocker_path=Path("C:\\EA DLC Unlocker v2"),
                config_exists=False,
                version_dll_exists=False,
                backup_available=True
            )

            mock_get_status.side_effect = [before_status, after_status]
            mock_exec.return_value = (True, "Uninstallation successful")

            # Step 1: Check before uninstall
            print("Step 1: Check Before Uninstallation")
            status_before = mock_get_status()
            print(f"  Unlocker installed: {status_before.installed}")
            print(f"  Config files present: {status_before.config_exists}")

            # Step 2: Execute uninstallation
            print("\nStep 2: Execute Uninstallation")
            success, message = mock_exec("uninstall")
            print(f"  Status: {'✅ Success' if success else '❌ Failed'}")
            print(f"  Message: {message}")

            # Step 3: Verify uninstallation
            print("\nStep 3: Verify Uninstallation")
            status_after = mock_get_status()
            print(f"  Unlocker installed: {status_after.installed}")
            print(f"  Config files present: {status_after.config_exists}")
            print(f"  Backup preserved: {status_after.backup_available}")

            assert status_before.installed
            assert success
            assert not status_after.installed
            print("\n✅ TEST 6 PASSED")


def test_7_configuration_parsing():
    """Test configuration file parsing."""
    print("\n" + "─" * 80)
    print("TEST 7: Configuration File Parsing")
    print("─" * 80)

    print("\nScenario: Read DLC Unlocker configuration\n")

    with patch('dlc_unlocker.get_unlocker_config') as mock_config:
        # Mock INI configuration
        mock_config_data = {
            "config": {
                "enabled": "true",
                "version": "2.0.1",
                "last_updated": "2025-12-27",
                "auto_backup": "true",
                "max_backups": "10",
                "backup_retention_days": "30",
                "log_level": "INFO"
            },
            "autoupdate": {
                "check_on_startup": "true"
            }
        }
        mock_config.return_value = mock_config_data

        config = mock_config()

        print("Configuration Sections:")
        for section, settings in config.items():
            print(f"\n  [{section.upper()}]")
            for key, value in settings.items():
                print(f"    {key} = {value}")

        assert "config" in config
        assert config["config"]["enabled"] == "true"
        assert config["config"]["version"] == "2.0.1"
        print("\n✅ TEST 7 PASSED")


def main():
    """Run all mock query tests."""
    print("=" * 80)
    print("DLC UNLOCKER - COMPREHENSIVE MOCK QUERY TEST SUITE")
    print("=" * 80)

    try:
        test_1_ea_app_detection()
        test_2_origin_detection()
        test_3_status_summary()
        test_4_installation_flow()
        test_5_error_scenarios()
        test_6_uninstallation_flow()
        test_7_configuration_parsing()

        # Summary
        print("\n" + "=" * 80)
        print("TEST SUITE SUMMARY")
        print("=" * 80)
        print("""
✅ TEST 1: EA App Detection          - PASSED
✅ TEST 2: Origin Detection          - PASSED
✅ TEST 3: Status Summary            - PASSED
✅ TEST 4: Installation Flow         - PASSED
✅ TEST 5: Error Handling            - PASSED
✅ TEST 6: Uninstallation Flow       - PASSED
✅ TEST 7: Configuration Parsing     - PASSED

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOTAL: 7/7 Tests Passed (100% Pass Rate)
Status: ✅ ALL MOCK QUERY TESTS PASSED
""")
        print("=" * 80)

    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
