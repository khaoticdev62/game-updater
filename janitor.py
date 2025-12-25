import json
import os
from pathlib import Path
from typing import Dict, Any, List
from logging_system import get_logger
from rollback_manager import rollback_to_restore_point
from doctor import BackendDoctor

class OperationLogger:
    """
    Handles persistence of background operations to allow stateful resumption.
    Optimized with in-memory cache to reduce disk I/O.
    """
    def __init__(self, log_path: Path):
        self.log_path = log_path
        self._cache = {}
        self._ensure_log_exists()
        self._cache = self._read_log()

    def _ensure_log_exists(self):
        if not self.log_path.exists():
            self.log_path.parent.mkdir(parents=True, exist_ok=True)
            self._write_to_disk({})

    def _read_log(self) -> Dict[str, Any]:
        try:
            if not self.log_path.exists():
                return {}
            with open(self.log_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return {}

    def _write_to_disk(self, data: Dict[str, Any]):
        with open(self.log_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)

    def log_operation(self, op_id: str, op_data: Dict[str, Any]):
        self._cache[op_id] = {
            "status": op_data.get("status", "pending"),
            "data": op_data
        }
        self._write_to_disk(self._cache)

    def update_status(self, op_id: str, status: str):
        if op_id in self._cache:
            self._cache[op_id]["status"] = status
            self._write_to_disk(self._cache)

    def get_pending_operations(self) -> List[Dict[str, Any]]:
        pending = []
        for op_id, info in self._cache.items():
            if info["status"] == "pending":
                pending.append({"id": op_id, "data": info["data"]})
        return pending

    def clear_log(self):
        self._cache = {}
        if self.log_path.exists():
            self.log_path.unlink()

class RecoveryOrchestrator:
    """
    Coordinates automatic rollback and diagnostic scans after an interruption.
    """
    def __init__(self, game_dir: Path):
        self.game_dir = game_dir
        self.lock_file = game_dir / "update.lock"

    def run_recovery(self, restore_point: str = None) -> bool:
        """
        Executes the mandatory recovery flow: Rollback -> Diagnostic.
        """
        logger = get_logger()
        logger.warning(f"RecoveryOrchestrator: Initiating recovery flow for {self.game_dir}")

        # 1. Atomic Safety: Rollback if restore point provided
        if restore_point:
            success = rollback_to_restore_point(restore_point, str(self.game_dir))
            if not success:
                logger.error("RecoveryOrchestrator: Rollback failed during recovery.")
                return False

        # 2. Mandatory Diagnostics: Verify system health
        doctor = BackendDoctor()
        results = doctor.check_all()
        
        # Check critical status
        is_healthy = True
        for r in results:
            if r["name"] in ["Permissions"] and r["status"] == "error":
                is_healthy = False
                break
        
        if not is_healthy:
            logger.error("RecoveryOrchestrator: Post-interruption diagnostic failed.")
            return False

        # 3. Cleanup: Remove session locks
        if self.lock_file.exists():
            self.lock_file.unlink()

        logger.info("RecoveryOrchestrator: Recovery flow completed successfully.")
        return True
