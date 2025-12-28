; Inno Setup Script for Sims 4 Updater Rebuild
#define MyAppName "Sims 4 Updater"
#define MyAppVersion "2.0.0"
#define MyAppPublisher "Anadius / KhaoticKode"
#define MyAppExeName "Sims 4 Updater.exe"

[Setup]
AppId={{Sims4Updater-Rebuild-2025}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputDir=.
OutputBaseFilename=Sims4Updater_Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "out\Sims 4 Updater-win32-x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "sims-4-updater-v1.4.7.exe_extracted\tools\aria2c.exe"; DestDir: "{app}\resources\bin"; Flags: ignoreversion
Source: "sims-4-updater-v1.4.7.exe_extracted\tools\xdelta3.exe"; DestDir: "{app}\resources\bin"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
function IsVCRedistInstalled: Boolean;
var
  Version: String;
begin
  // Check for VC++ 2015-2022 Redistributable (x64)
  // Registry key for 14.0 (2015-2022)
  Result := RegQueryStringValue(HKEY_LOCAL_MACHINE, 'SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64', 'Version', Version);
end;

function InitializeSetup: Boolean;
begin
  Result := True;
  if not IsVCRedistInstalled then
  begin
    if MsgBox('Visual C++ 2015-2022 Redistributable (x64) is required but not found. ' +
              'Would you like to download it now?', mbConfirmation, MB_YESNO) = IDYES then
    begin
      ShellExec('open', 'https://aka.ms/vs/17/release/vc_redist.x64.exe', '', '', SW_SHOWNORMAL, ewNoWait, ErrorCode);
    end;
    // We allow setup to continue, but the app might fail if they don't install it.
  end;
end;
