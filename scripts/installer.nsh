; ============================================================================
; NSIS Installer Script - Sims 4 Updater
; ============================================================================
;
; Professional Windows installer with:
; - Custom branding (cyan crystal theme)
; - Multi-page installation flow
; - Detailed progress messaging
; - Proper registry management
; - Shortcut creation with icons
; - Uninstaller cleanup
;
; ============================================================================

; ============================================================================
; INCLUDES & PLUGINS
; ============================================================================

!include "MUI2.nsh"
!include "WinVer.nsh"
!include "x64.nsh"
!include "LogicLib.nsh"

; ============================================================================
; CONSTANTS & BRANDING
; ============================================================================

!define COMPANY_NAME "KhaoticKodeDev62"
!define APP_NAME "Sims 4 Updater"
!define APP_VERSION "1.0.0"
!define APP_PUBLISHER "KhaoticKodeDev62"
!define APP_WEBSITE "https://github.com/KhaoticKodeDev62/sims-4-updater"
!define APP_EXE "Sims4Updater.exe"
!define APP_REGISTRY_KEY "Software\${COMPANY_NAME}\${APP_NAME}"

; Branding colors (cyan crystal theme)
!define MUI_BGCOLOR_FOREGROUND "0f0f0f"      ; Dark slate background
!define MUI_TEXTCOLOR_FOREGROUND "ffffff"    ; White text
!define MUI_HEADERIMAGE_BITMAP "assets\branding\installer\header.png"
!define MUI_WELCOMEFINISHPAGE_BITMAP "assets\branding\installer\sidebar.png"
!define MUI_ICON "assets\branding\logo\exports\icon.ico"
!define MUI_UNICON "assets\branding\logo\exports\icon.ico"

; ============================================================================
; INSTALLER CONFIGURATION
; ============================================================================

Name "${APP_NAME} v${APP_VERSION}"
OutFile "Sims4Updater-Setup-${APP_VERSION}.exe"
InstallDir "$PROGRAMFILES\${APP_NAME}"
InstallDirRegKey HKLM "${APP_REGISTRY_KEY}" "InstallLocation"

; Request admin privileges
RequestExecutionLevel admin

; Modern UI settings
!define MUI_ABORTWARNING
!define MUI_ABORTWARNING_TEXT "Are you sure you want to cancel the installation of ${APP_NAME}?"

; Configure install pages
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of ${APP_NAME}.$\r$\n$\r$\nSims 4 Updater is a modern game content manager with Vision Pro-inspired design.$\r$\n$\r$\nClick Next to continue."

!define MUI_DIRECTORYPAGE_TEXT_TOP "Select the folder where ${APP_NAME} should be installed:"
!define MUI_DIRECTORYPAGE_TEXT_DESTINATION "Installation folder"

!define MUI_FINISHPAGE_TEXT "${APP_NAME} has been successfully installed on your computer.$\r$\n$\r$\nThe application is ready to use. Click Finish to close this wizard."
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "Launch ${APP_NAME} now"
!define MUI_FINISHPAGE_RUN_FUNCTION "LaunchApp"
!define MUI_FINISHPAGE_SHOWREADME ""
!define MUI_FINISHPAGE_LINK "Visit project on GitHub"
!define MUI_FINISHPAGE_LINK_LOCATION "${APP_WEBSITE}"

; ============================================================================
; MUI2 PAGE CONFIGURATION
; ============================================================================

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; ============================================================================
; LANGUAGE
; ============================================================================

!insertmacro MUI_LANGUAGE "English"

; ============================================================================
; INSTALLER SECTIONS
; ============================================================================

; Main application installation section
Section "!${APP_NAME}" SecApp
  SectionIn RO  ; Read-only, always installed
  
  SetOutPath "$INSTDIR"
  DetailPrint "Installing ${APP_NAME}..."
  
  ; The application files are automatically included by electron-builder
  ; This section ensures they're placed in the correct location
  
  DetailPrint "Creating application shortcuts..."
  
  ; Create Start Menu shortcuts
  CreateDirectory "$SMPROGRAMS\${APP_NAME}"
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" \
    "$INSTDIR\${APP_EXE}" \
    "" \
    "$INSTDIR\${APP_EXE}" \
    0 \
    SW_SHOWNORMAL \
    "" \
    "Modern game content updater for The Sims 4"
  
  CreateShortcut "$SMPROGRAMS\${APP_NAME}\Uninstall ${APP_NAME}.lnk" \
    "$INSTDIR\Uninstall ${APP_NAME}.exe" \
    "" \
    "$INSTDIR\Uninstall ${APP_NAME}.exe" \
    0
  
  ; Create Desktop shortcut
  CreateShortcut "$DESKTOP\${APP_NAME}.lnk" \
    "$INSTDIR\${APP_EXE}" \
    "" \
    "$INSTDIR\${APP_EXE}" \
    0 \
    SW_SHOWNORMAL \
    "" \
    "Modern game content updater for The Sims 4"
  
  DetailPrint "Writing registry entries..."
  Call WriteRegistry
  
  DetailPrint "Installation completed successfully!"
SectionEnd

; ============================================================================
; REGISTRY & UNINSTALLER MANAGEMENT
; ============================================================================

Function WriteRegistry
  ; Determine install size
  ${GetSize} "$INSTDIR" "/S=0K" $0
  IntFmt $0 "0x%08X" $0
  
  ; Write to HKLM for all users (if admin)
  ${If} ${RunningX64}
    SetRegView 64
  ${EndIf}
  
  ; Remove old registry entries first
  DeleteRegKey HKLM "${APP_REGISTRY_KEY}"
  
  ; Write new registry entries for Programs and Features
  WriteRegStr HKLM "${APP_REGISTRY_KEY}" "DisplayName" "${APP_NAME} v${APP_VERSION}"
  WriteRegStr HKLM "${APP_REGISTRY_KEY}" "DisplayVersion" "${APP_VERSION}"
  WriteRegStr HKLM "${APP_REGISTRY_KEY}" "Publisher" "${APP_PUBLISHER}"
  WriteRegStr HKLM "${APP_REGISTRY_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "${APP_REGISTRY_KEY}" "UninstallString" "$INSTDIR\Uninstall ${APP_NAME}.exe"
  WriteRegStr HKLM "${APP_REGISTRY_KEY}" "QuietUninstallString" "$INSTDIR\Uninstall ${APP_NAME}.exe /S"
  WriteRegStr HKLM "${APP_REGISTRY_KEY}" "URLInfoAbout" "${APP_WEBSITE}"
  WriteRegDWORD HKLM "${APP_REGISTRY_KEY}" "EstimatedSize" "$0"
  WriteRegDWORD HKLM "${APP_REGISTRY_KEY}" "NoModify" 1
  WriteRegDWORD HKLM "${APP_REGISTRY_KEY}" "NoRepair" 1
  
  ; Write HKCU for current user
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" \
    "DisplayName" "${APP_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" \
    "InstallLocation" "$INSTDIR"
FunctionEnd

; ============================================================================
; APPLICATION LAUNCH
; ============================================================================

Function LaunchApp
  DetailPrint "Launching ${APP_NAME}..."
  ExecShell "open" "$INSTDIR\${APP_EXE}"
FunctionEnd

; ============================================================================
; UNINSTALLER SECTION
; ============================================================================

Section "Uninstall"
  DetailPrint "Uninstalling ${APP_NAME}..."
  
  ; Close the application if running
  DetailPrint "Closing ${APP_NAME}..."
  nsExec::ExecToLog "taskkill /IM ${APP_EXE} /F"
  Sleep 1000
  
  ; Remove application files and folder
  DetailPrint "Removing application files..."
  RMDir /r "$INSTDIR"
  
  ; Remove Start Menu folder and shortcuts
  DetailPrint "Removing shortcuts..."
  RMDir /r "$SMPROGRAMS\${APP_NAME}"
  
  ; Remove Desktop shortcut
  Delete "$DESKTOP\${APP_NAME}.lnk"
  
  ; Remove registry entries
  DetailPrint "Removing registry entries..."
  ${If} ${RunningX64}
    SetRegView 64
  ${EndIf}
  DeleteRegKey HKLM "${APP_REGISTRY_KEY}"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
  
  DetailPrint "Uninstall completed successfully!"
SectionEnd

; ============================================================================
; FUNCTION: Check if application is running
; ============================================================================

Function CheckIfRunning
  FindWindow $0 "" "${APP_NAME}"
  ${If} $0 != 0
    MessageBox MB_YESNO "Sims 4 Updater is currently running.$\r$\n$\r$\nPlease close it before continuing.$\r$\n$\r$\nDo you want to close it automatically?" \
      /SD IDYES IDYES CloseApp IDNO ExitInstaller
    
    CloseApp:
      nsExec::ExecToLog "taskkill /IM ${APP_EXE} /F"
      Sleep 2000
      Goto Done
    
    ExitInstaller:
      Abort "Installation aborted. Please close Sims 4 Updater and try again."
    
    Done:
  ${EndIf}
FunctionEnd

; Call check on installer init
Function .onInit
  DetailPrint "Checking system requirements..."
  
  ; Check Windows version (Windows 7 or later)
  ${Unless} ${AtLeastWin7}
    MessageBox MB_OK "This application requires Windows 7 or later."
    Abort
  ${EndUnless}
  
  DetailPrint "System check passed."
  Call CheckIfRunning
FunctionEnd

; ============================================================================
; UNINSTALLER INIT
; ============================================================================

Function un.onInit
  MessageBox MB_ICONQUESTION|MB_YESNO "Are you sure you want to uninstall ${APP_NAME}?" \
    /SD IDYES IDYES +2
  Abort
FunctionEnd

; Call check on uninstaller init
Function un.onUninstSuccess
  MessageBox MB_ICONINFORMATION|MB_OK "${APP_NAME} has been successfully uninstalled."
FunctionEnd

; ============================================================================
; END OF INSTALLER SCRIPT
; ============================================================================
