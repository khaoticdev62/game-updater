# Game Updater

A modern, feature-rich application for managing game updates, patches, and downloadable content.

## Overview

This Game Updater is a comprehensive, production-grade tool designed to automate game installation management, updates, and content patching. It features a premium UI, granular content management, and high-performance update mechanisms.

## Features

- **Premium User Interface**: Modern, console-style interface with smooth animations and glassmorphism effects.
- **Granular Content Management**: Detailed control over game packages and additional content with real-time status detection.
- **High-Performance Infrastructure**: Multi-threaded file hashing, asynchronous downloading, and intelligent binary delta patching.
- **Fault Tolerance**: Integrated circuit breakers, health monitoring, and automatic rollback capabilities to protect game integrity.
- **Production Ready**: Persistent configuration, structured JSON logging, and a robust Windows installer with dependency checks.

## Architecture

The application is built with a decoupled architecture:

### Backend (Python 3.11+)
- **Core Engine**: Multi-threaded verification and manifest parsing.
- **Safety Layer**: Circuit breakers and health monitoring.
- **Data Layer**: Automatic restore points and rollback management.
- **Networking**: High-performance HTTPX client with connection pooling.

### Frontend (Electron & React)
- **Framework**: TypeScript with React 18.
- **Styling**: Tailwind CSS 3.4+ with PostCSS.
- **Animations**: Framer Motion for fluid screen transitions and interactive elements.
- **Bridge**: Secure IPC communication with line-buffered stdout handling.

## Installation and Setup

1. Install Python 3.11+
2. Install Node.js and npm
3. Install dependencies:
   ```bash
   npm install
   ```
4. Install required system tools (aria2c, xdelta3, etc.)

## Usage

1. Run the development server:
   ```bash
   npm start
   ```
2. Configure your game directory path
3. Set the manifest URL for update information
4. Use the interface to verify, patch, and update your game installation

## Development

### Running Tests

```bash
python -m pytest
```

### Running with Coverage

```bash
python -m pytest --cov=.
```

## Configuration

The application supports various configuration options:

- **Game Directory**: Path to your game installation
- **Manifest URL**: URL to the manifest file with update information
- **Content Selection**: Choose which content packages to update or install

## Components

### Update Manager
Handles the orchestration of update operations, including:
- Fetching and parsing manifests
- Determining necessary operations
- Executing downloads and patches
- Reporting progress

### Content Manager
Manages content-specific functionality:
- Detecting installed content packages
- Managing content selection
- Generating installation plans

### Verification Engine
Performs multi-threaded file verification using cryptographic hashing.

### Patcher
Handles binary delta patching with safety mechanisms:
- Atomic file operations
- Cryptographic verification after patching
- Batch patching for performance

## Error Handling

The application implements comprehensive error handling:
- Network error recovery
- File system error handling
- Graceful degradation when components are unavailable
- Detailed logging for debugging

## Performance Optimizations

- Multi-threaded file verification
- Batch patching operations
- Efficient progress reporting
- Asynchronous operations where possible

## Testing

The application has >80% test coverage with:
- Unit tests for individual components
- Integration tests for component interactions
- End-to-end tests for complete workflows
- Error condition tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details.
