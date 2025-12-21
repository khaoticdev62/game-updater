# Sims 4 Updater Context

This directory contains the **Sims 4 Updater**, a GUI tool developed by **anadius** for updating and repairing *The Sims 4*.

## Project Overview

- **Purpose:** Automates the process of updating or repairing game files for *The Sims 4*.
- **Developer:** anadius
- **Technology Stack:** 
  - **Language:** Python 3.11
  - **Distribution:** Packaged as a 64-bit Windows executable using PyInstaller.
- **Key Resources:**
  - [CS RIN Thread](https://cs.rin.ru/forum/viewtopic.php?f=29&t=102519) (Official support and source code audit)

## Directory Structure

- `sims-4-updater-v1.4.7.exe`: The main application executable.
- `updater_readme.txt`: Contains basic troubleshooting, system requirements, and FAQ.

## Requirements & Usage

- **Operating System:** Windows 8 or newer (64-bit). Windows 7 is not officially supported.
- **Dependencies:** [Visual C++ Redistributable 2015-2022 x64](https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads).
- **Security:** Anti-virus software may flag the executable as a false positive due to the nature of PyInstaller-packaged Python scripts.

To use the tool, run `sims-4-updater-v1.4.7.exe`. It will generate a more comprehensive readme file upon execution.
