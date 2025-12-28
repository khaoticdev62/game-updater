# NSIS Installer - Customization Reference

Quick reference guide for customizing the Sims 4 Updater NSIS installer.

---

## Configuration Files

### Primary Configuration
- **File:** `electron-builder.json`
- **Purpose:** Main electron-builder settings for NSIS generation
- **Key Section:** `"nsis"`

### Installer Script
- **File:** `scripts/installer.nsh`
- **Purpose:** NSIS script with pages, messages, and behavior
- **Language:** NSIS Script Language

---

## Customizable Elements

### 1. Application Metadata

**File:** `electron-builder.json`

```json
{
  "appId": "com.khaotickobedev.sims4updater",      // Unique app ID
  "productName": "Sims 4 Updater",                 // Display name
  "description": "Modern game content updater...",  // Description
  "copyright": "Copyright © 2025 KhaoticKodeDev62" // Copyright text
}
```

---

### 2. Installer Behavior

**File:** `scripts/installer.nsh` (Lines ~49-60)

```nsh
; One-click installation (skip directory selection)
!define MUI_DIRECTORYPAGE_SHOW_ONNONEXISTENT  ;Uncomment to force directory selection

; Allow changing installation directory
; (currently enabled - users can change)

; Request admin privileges
RequestExecutionLevel admin  ; Options: none, user, admin
```

---

### 3. Welcome Page

**File:** `scripts/installer.nsh` (Line ~50)

```nsh
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide...$\r$\n$\r$\nClick Next to continue."
```

**Variables Available:**
- `${APP_NAME}` - "Sims 4 Updater"
- `${APP_VERSION}` - "1.0.0"
- `$\r$\n` - Line break

**Example:**
```nsh
!define MUI_WELCOMEPAGE_TEXT "${APP_NAME} Setup\n\nVersion: ${APP_VERSION}\n\nClick Next to continue."
```

---

### 4. Directory Selection Page

**File:** `scripts/installer.nsh` (Line ~51)

```nsh
!define MUI_DIRECTORYPAGE_TEXT_TOP "Select the folder where ${APP_NAME} should be installed:"
!define MUI_DIRECTORYPAGE_TEXT_DESTINATION "Installation folder"
```

**Suggested Directories:**

| Variable | Path | Use Case |
|----------|------|----------|
| `$PROGRAMFILES` | C:\Program Files | Default, all users |
| `$PROGRAMFILES(X86)` | C:\Program Files (x86) | Legacy 32-bit apps |
| `$LOCALAPPDATA` | C:\Users\[User]\AppData\Local | Per-user install |
| `$APPDATA` | C:\Users\[User]\AppData\Roaming | Per-user roaming |

**Change default location:**

In `scripts/installer.nsh` (Line ~100):
```nsh
InstallDir "$PROGRAMFILES\${APP_NAME}"  ; Change this path
```

---

### 5. Finish Page

**File:** `scripts/installer.nsh` (Lines ~53-58)

```nsh
!define MUI_FINISHPAGE_TEXT "${APP_NAME} has been successfully installed..."
!define MUI_FINISHPAGE_RUN                         ; Show "Launch app" checkbox
!define MUI_FINISHPAGE_RUN_TEXT "Launch ${APP_NAME} now"
!define MUI_FINISHPAGE_LINK "Visit project on GitHub"
!define MUI_FINISHPAGE_LINK_LOCATION "${APP_WEBSITE}"
```

**Options:**

```nsh
; Remove the launch checkbox
; !define MUI_FINISHPAGE_RUN  ; Comment this line out

; Show readme file on finish
!define MUI_FINISHPAGE_SHOWREADME "$INSTDIR\README.txt"

; Show link to manual
!define MUI_FINISHPAGE_LINK "User Manual"
!define MUI_FINISHPAGE_LINK_LOCATION "https://example.com/manual"
```

---

### 6. Branding Elements

**File:** `electron-builder.json` or `scripts/installer.nsh`

#### Icons

```json
{
  "win": {
    "icon": "assets/branding/logo/exports/icon.ico"
  },
  "nsis": {
    "installerIcon": "assets/branding/logo/exports/icon.ico",
    "uninstallerIcon": "assets/branding/logo/exports/icon.ico"
  }
}
```

Replace with your own .ico files.

#### Header Image

```nsh
!define MUI_HEADERIMAGE_BITMAP "assets\branding\installer\header.png"
```

**Requirements:**
- Dimensions: 150×57 pixels
- Format: PNG
- Colors: Matches installer theme

#### Sidebar Image

```nsh
!define MUI_WELCOMEFINISHPAGE_BITMAP "assets\branding\installer\sidebar.png"
```

**Requirements:**
- Dimensions: 164×314 pixels
- Format: PNG
- Usage: Shown on welcome and finish pages

#### Colors

```nsh
!define MUI_BGCOLOR_FOREGROUND "0f0f0f"      ; Background (hex)
!define MUI_TEXTCOLOR_FOREGROUND "ffffff"    ; Text (hex)
```

**Recommended Colors:**
- Dark background: `0f0f0f`, `1a1a1a`, `2c2c2c`
- Light text: `ffffff`, `eeeeee`, `e0e0e0`
- Accent: `0ea5e9` (cyan), `3b82f6` (blue)

---

### 7. Shortcuts

**File:** `scripts/installer.nsh` (Lines ~113-133)

```nsh
; Create Start Menu shortcut
CreateShortcut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" \
  "$INSTDIR\${APP_EXE}" \
  "" \
  "$INSTDIR\${APP_EXE}" \
  0 \
  SW_SHOWNORMAL \
  "" \
  "Modern game content updater for The Sims 4"

; Create Desktop shortcut
CreateShortcut "$DESKTOP\${APP_NAME}.lnk" \
  "$INSTDIR\${APP_EXE}"
```

**Add Quick Launch shortcut (Windows 7):**

```nsh
; Create Quick Launch shortcut
CreateShortcut "$QUICKLAUNCH\${APP_NAME}.lnk" \
  "$INSTDIR\${APP_EXE}" \
  "" \
  "$INSTDIR\${APP_EXE}" \
  0
```

**Shortcut Variables:**
- `$SMPROGRAMS` - Start Menu\Programs
- `$DESKTOP` - Desktop
- `$QUICKLAUNCH` - Quick Launch bar (Windows 7)
- `$APPDATA` - User AppData
- `$INSTDIR` - Installation directory

**Parameters:**
```nsh
CreateShortcut "shortcut_path" \
  "target_exe" \
  "arguments" \
  "icon_path" \
  icon_index \
  show_mode \
  "hotkey" \
  "description"
```

**Show modes:**
- `SW_SHOWNORMAL` - Normal window
- `SW_SHOWMINIMIZED` - Minimized
- `SW_SHOWMAXIMIZED` - Maximized
- `SW_HIDE` - Hidden

---

### 8. Installation Directory

**File:** `scripts/installer.nsh` (Line ~100)

```nsh
InstallDir "$PROGRAMFILES\${APP_NAME}"
```

**Change to:**

```nsh
; Per-user installation
InstallDir "$LOCALAPPDATA\${APP_NAME}"

; Legacy location
InstallDir "$PROGRAMFILES(X86)\${APP_NAME}"

; Roaming profile
InstallDir "$APPDATA\${APP_NAME}"
```

---

### 9. License File

**File:** `electron-builder.json`

```json
{
  "nsis": {
    "license": "assets/branding/installer/license.rtf"
  }
}
```

**To customize:**
1. Edit `assets/branding/installer/license.rtf` in any RTF editor
2. Common editors: Notepad++, Microsoft Word, WordPad
3. Rebuild: `npm run build:installer`

---

### 10. Installer Messages

**File:** `scripts/installer.nsh`

#### Abort Warning

```nsh
!define MUI_ABORTWARNING
!define MUI_ABORTWARNING_TEXT "Are you sure you want to cancel the installation of ${APP_NAME}?"
```

#### Uninstaller Confirmation

Add to `un.onInit` function:

```nsh
Function un.onInit
  MessageBox MB_ICONQUESTION|MB_YESNO "Are you sure you want to uninstall ${APP_NAME}?" \
    /SD IDYES IDYES +2
  Abort
FunctionEnd
```

#### Uninstaller Complete

```nsh
Function un.onUninstSuccess
  MessageBox MB_ICONINFORMATION|MB_OK "${APP_NAME} has been successfully uninstalled."
FunctionEnd
```

---

### 11. System Requirements

**File:** `scripts/installer.nsh` (Line ~238)

```nsh
Function .onInit
  ; Check Windows version (Windows 7 or later)
  ${Unless} ${AtLeastWin7}
    MessageBox MB_OK "This application requires Windows 7 or later."
    Abort
  ${EndUnless}
FunctionEnd
```

**Available checks:**

```nsh
${AtLeastWinXP}         ; Windows XP or later
${AtLeastWin2003}       ; Windows Server 2003 or later
${AtLeastWinVista}      ; Windows Vista or later
${AtLeastWin7}          ; Windows 7 or later
${AtLeastWin8}          ; Windows 8 or later
${AtLeastWin8.1}        ; Windows 8.1 or later
${AtLeastWin10}         ; Windows 10 or later
${RunningX64}           ; 64-bit Windows
```

---

### 12. Registry Entries

**File:** `scripts/installer.nsh` (Lines ~167-183)

```nsh
Function WriteRegistry
  WriteRegStr HKLM "${APP_REGISTRY_KEY}" "DisplayName" "${APP_NAME} v${APP_VERSION}"
  WriteRegStr HKLM "${APP_REGISTRY_KEY}" "Publisher" "${APP_PUBLISHER}"
  WriteRegStr HKLM "${APP_REGISTRY_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "${APP_REGISTRY_KEY}" "URLInfoAbout" "${APP_WEBSITE}"
  WriteRegDWORD HKLM "${APP_REGISTRY_KEY}" "EstimatedSize" "$0"
FunctionEnd
```

**Common Registry Locations:**

| Key | Purpose |
|-----|---------|
| `HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall` | Programs and Features |
| `HKCU\Software\${Company}\${AppName}` | User settings |
| `HKCR` | File associations |

**Add custom registry entry:**

```nsh
WriteRegStr HKCU "Software\MyCompany\MyApp" "Setting1" "Value1"
WriteRegDWORD HKCU "Software\MyCompany\MyApp" "Setting2" 1
```

---

### 13. Uninstaller Behavior

**File:** `scripts/installer.nsh` (Lines ~203-218)

```nsh
Section "Uninstall"
  ; Close the application if running
  nsExec::ExecToLog "taskkill /IM ${APP_EXE} /F"
  Sleep 1000
  
  ; Remove files
  RMDir /r "$INSTDIR"
  
  ; Remove shortcuts
  RMDir /r "$SMPROGRAMS\${APP_NAME}"
  Delete "$DESKTOP\${APP_NAME}.lnk"
  
  ; Remove registry
  DeleteRegKey HKLM "${APP_REGISTRY_KEY}"
SectionEnd
```

**Customization:**

```nsh
; Keep user data on uninstall
; RMDir /r "$INSTDIR"  ; Comment out to keep folder
RMDir "$INSTDIR"  ; Only remove if empty

; Remove specific files only
Delete "$INSTDIR\*.exe"
Delete "$INSTDIR\*.dll"

; Keep config files
; Don't delete: $APPDATA\MyApp\config.ini
```

---

### 14. Command Line Parameters

Users can run installer silently:

```bash
# Silent installation (no UI)
Sims4Updater Setup 1.0.0.exe /S

# Silent with custom directory
Sims4Updater Setup 1.0.0.exe /S /D=C:\CustomPath

# No desktop shortcut
Sims4Updater Setup 1.0.0.exe /NOQUICKLAUNCH
```

---

## Common Customizations

### Change Company Name

**File:** `scripts/installer.nsh` (Line ~17)

```nsh
!define COMPANY_NAME "YourCompanyName"
!define APP_REGISTRY_KEY "Software\${COMPANY_NAME}\${APP_NAME}"
```

### Add Multi-Language Support

```nsh
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "Spanish"
!insertmacro MUI_LANGUAGE "French"
!insertmacro MUI_LANGUAGE "German"
!insertmacro MUI_LANGUAGE "Japanese"
```

### Create Multiple Shortcuts

```nsh
; Documentation shortcut
CreateShortcut "$SMPROGRAMS\${APP_NAME}\Documentation.lnk" \
  "https://github.com/KhaoticKodeDev62/sims-4-updater"

; Uninstall shortcut
CreateShortcut "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk" \
  "$INSTDIR\Uninstall ${APP_NAME}.exe"
```

### Disable Installation Directory Selection

```nsh
; In .onInit function
Function .onInit
  StrCpy $INSTDIR "$PROGRAMFILES\${APP_NAME}"
  Abort  ; Skip directory page
FunctionEnd
```

### Set Installer Size Estimate

**File:** `scripts/installer.nsh` (Line ~175)

The estimated size is calculated automatically:

```nsh
${GetSize} "$INSTDIR" "/S=0K" $0  ; Get actual size in KB
IntFmt $0 "0x%08X" $0             ; Convert to hex
WriteRegDWORD HKLM "${APP_REGISTRY_KEY}" "EstimatedSize" "$0"
```

---

## Testing Customizations

After editing `scripts/installer.nsh`:

```bash
# Rebuild installer
npm run build:installer

# Test installation on clean VM or separate folder
# Right-click .exe → Properties → Digital Signatures (verify code signing)

# Check registry
# regedit → HKLM\Software\KhaoticKodeDev62\Sims 4 Updater

# Verify shortcuts
# Check Desktop and Start Menu\Programs
```

---

## Performance Optimization

### Reduce Installation Time

1. **Minimize asset size:**
   ```bash
   npm run prebuild:installer  # Regenerate with optimization
   ```

2. **Use SSD for builds**

3. **Disable antivirus during build**

### Reduce Installer Size

1. **Remove unused dependencies:**
   - Check `node_modules` for unused packages
   - Remove in `package.json` devDependencies

2. **Minify assets:**
   - Use optimized PNG images
   - Compress installer graphics

3. **Enable ASAR archive:**
   ```typescript
   // Already enabled in forge.config.ts
   packagerConfig: {
     asar: true,
   }
   ```

---

## Troubleshooting

### Installer appears blank

- Check image paths use backslashes: `assets\branding\installer\header.png`
- Verify image files exist and are readable
- Check image dimensions (150×57 for header, 164×314 for sidebar)

### Registry entries not created

- Verify user has admin privileges
- Check registry path syntax
- Ensure `RequestExecutionLevel admin` is set

### Uninstall doesn't remove files

- Check file permissions
- Ensure installer runs as admin
- Verify paths in `Uninstall` section

### Shortcuts don't appear

- Check shortcut path variables are correct
- Verify `$INSTDIR` is set correctly
- Check folder permissions

---

## Resources

- **NSIS Manual:** http://nsis.sourceforge.net/Docs/
- **NSIS InstallOptions:** http://nsis.sourceforge.net/Docs/Chapter4.html
- **MUI2 Documentation:** http://nsis.sourceforge.net/Docs/Modern%20UI%202/Readme.html
- **Windows Registry Reference:** https://docs.microsoft.com/en-us/windows/win32/sysinfo/structure-of-the-registry

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Author:** KhaoticKodeDev62
