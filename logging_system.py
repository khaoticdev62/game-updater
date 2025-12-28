import logging
import os
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any
from contextvars import ContextVar

# Context variable to store the current request ID
current_request_id: ContextVar[Optional[str]] = ContextVar('current_request_id', default=None)

class StructuredFormatter(logging.Formatter):
    """
    Custom formatter that creates structured JSON logs with request IDs.
    """
    def format(self, record):
        # Get the current request ID from context
        req_id = current_request_id.get()

        log_entry = {
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
        }

        # Add request ID if available
        if req_id:
            log_entry['request_id'] = req_id

        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)

        # Add any extra fields
        for key, value in record.__dict__.items():
            if key not in ['name', 'msg', 'args', 'levelname', 'levelno', 'pathname',
                          'filename', 'module', 'lineno', 'funcName', 'created',
                          'msecs', 'relativeCreated', 'thread', 'threadName',
                          'processName', 'process', 'getMessage', 'exc_info',
                          'exc_text', 'stack_info']:
                log_entry[key] = value

        return json.dumps(log_entry)


class SimsUpdaterLogger:
    """
    Comprehensive logging system for the Sims 4 Updater.
    Provides structured logging with multiple handlers and formatters.
    """

    def __init__(self, log_dir: Optional[str] = None, level: int = logging.INFO):
        # Determine log directory
        if log_dir is None:
            log_dir = os.path.join(os.getcwd(), "logs")

        self.logger = logging.getLogger('SimsUpdater')
        self.logger.setLevel(level)

        # Prevent adding handlers multiple times
        if self.logger.handlers:
            return

        # Create logs directory if not exists
        Path(log_dir).mkdir(parents=True, exist_ok=True)
        self.log_dir = log_dir

        # Create structured formatter
        formatter = StructuredFormatter()

        # File handler for detailed logs
        log_file = os.path.join(
            log_dir,
            f"sims_updater_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        )
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(level)
        file_handler.setFormatter(formatter)

        # Console handler for important messages (still using basic format for console)
        console_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.WARNING)  # Only warnings and errors to console
        console_handler.setFormatter(console_formatter)

        # Add handlers to logger
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)

        # Store the log file path for potential external access
        self.log_file_path = log_file

    def info(self, message: str, extra: Optional[Dict[str, Any]] = None):
        """Log an info message."""
        self.logger.info(message, extra=extra or {})

    def warning(self, message: str, extra: Optional[Dict[str, Any]] = None):
        """Log a warning message."""
        self.logger.warning(message, extra=extra or {})

    def error(self, message: str, extra: Optional[Dict[str, Any]] = None):
        """Log an error message."""
        self.logger.error(message, extra=extra or {})

    def debug(self, message: str, extra: Optional[Dict[str, Any]] = None):
        """Log a debug message."""
        self.logger.debug(message, extra=extra or {})

    def exception(self, message: str, extra: Optional[Dict[str, Any]] = None):
        """Log an exception with traceback."""
        self.logger.exception(message, extra=extra or {})

    def get_log_file_path(self):
        """Get the path to the current log file."""
        return self.log_file_path

    def close(self):
        """Close all handlers and clean up resources."""
        for handler in self.logger.handlers[:]:
            handler.close()
            self.logger.removeHandler(handler)


def set_request_id(request_id: Optional[str] = None) -> str:
    """
    Set the current request ID in the context.
    """
    if request_id is None:
        request_id = str(uuid.uuid4())

    current_request_id.set(request_id)
    return request_id


def get_request_id() -> Optional[str]:
    """
    Get the current request ID from the context.
    """
    return current_request_id.get()

# Global logger instance
_updater_logger = None

def get_logger() -> SimsUpdaterLogger:
    """
    Get the global logger instance.
    Creates one if it doesn't exist.
    """
    global _updater_logger
    if _updater_logger is None:
        _updater_logger = SimsUpdaterLogger()
    return _updater_logger

def setup_logging(log_dir: Optional[str] = None, level: int = logging.INFO) -> SimsUpdaterLogger:
    """
    Set up the logging system.
    """
    global _updater_logger
    _updater_logger = SimsUpdaterLogger(log_dir, level)
    return _updater_logger
