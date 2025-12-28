# Windows Installer Build Guide

## Overview

This guide covers building the professional NSIS installer for **Sims 4 Updater** with custom branding, code signing, and deployment.

---

## Prerequisites

### Required Software

1. **Node.js & npm** (v18+)
   - Download: https://nodejs.org/
   - Verify: `node --version && npm --version`

2. **Python 3.8+** (for backend packaging)
   - Download: https://www.python.org/
   - Verify: `python --version`

3. **Windows SDK** (for signtool.exe - optional but recommended)
   - Download: https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/
   - Required for: Code signing installers
   - Install: Full Windows SDK (includes signtool.exe at `C:\Program Files (x86)\Windows Kits\10\bin\...`)

4. **Code Signing Certificate** (optional, for production)
   - Type: EV Code Signing Certificate (.pfx format)
   - Cost: ~$200-500/year
   - Vendors: DigiCert, Sectigo, GlobalSign
   - Required for: Remove SmartScreen warnings, trusted publisher status

### Recommended Tools

- **Visual Studio Code** - For editing configuration files
- **7-Zip or WinRAR** - For inspecting .exe contents
- **Process Monitor** - For debugging installer behavior

---

## Build Process

### Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
pip install -r requirements.txt
```

The `--legacy-peer-deps` flag is needed due to TypeScript peer dependency constraints.

### Step 2: Generate Branding Assets (One-Time)

If you haven't generated the branding assets yet:

```bash
npm run generate-icons        # SVG → PNG exports (16-1024px)
npm run generate-ico          # Create icon.ico placeholder
npm run generate-installer-assets  # Create NSIS graphics
```

Or all at once:

```bash
npm run prebuild:installer
```

**Output:**
- `assets/branding/logo/exports/icon-*.png` (8 files)
- `assets/branding/logo/exports/icon.ico`
- `assets/branding/installer/header.png` (150×57)
- `assets/branding/installer/sidebar.png` (164×314)

### Step 3: Build the Installer

#### Without Code Signing (Development)

Fastest build, suitable for internal testing:

```bash
npm run build:installer
```

This will:
1. Generate all branding assets
2. Package the Electron app with Forge
3. Create the NSIS installer via electron-builder
4. Output: `dist-installer/Sims4Updater Setup 1.0.0.exe`

**Expected time:** 3-5 minutes

#### With Code Signing (Production)

Creates a digitally signed, trusted installer:

```bash
# Option 1: Using environment variables
set CSC_LINK=C:\Certificates\code-signing-cert.pfx
set CSC_KEY_PASSWORD=your_certificate_password
npm run build:installer
```

Or on Linux/macOS:

```bash
export CSC_LINK=/path/to/code-signing-cert.pfx
export CSC_KEY_PASSWORD=your_certificate_password
npm run build:installer
```

#### Option 2: Using .env.local

Create `.env.local` from the template:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
CSC_LINK=C:\Certificates\code-signing-cert.pfx
CSC_KEY_PASSWORD=your_certificate_password
```

Then run:

```bash
npm run build:installer
```

**⚠️ Security Note:** `.env.local` is gitignored. NEVER commit certificate files or passwords.

---

## Customizing the Installer

### Changing Installer Text

Edit `scripts/installer.nsh` to modify:

```nsh
; Welcome page text (line ~50)
!define MUI_WELCOMEPAGE_TEXT "Your custom text here..."

; Directory selection text (line ~51)
!define MUI_DIRECTORYPAGE_TEXT_TOP "Your custom text here..."

; Finish page text (line ~53)
!define MUI_FINISHPAGE_TEXT "Your custom text here..."

; Finish page link (line ~58)
!define MUI_FINISHPAGE_LINK "Your link text"
!define MUI_FINISHPAGE_LINK_LOCATION "https://your-url.com"
```

### Changing Installer Colors

Edit `scripts/installer.nsh` to modify branding colors:

```nsh
; Line ~42-45 (in CONSTANTS & BRANDING section)
!define MUI_BGCOLOR_FOREGROUND "0f0f0f"      ; Background color (hex)
!define MUI_TEXTCOLOR_FOREGROUND "ffffff"    ; Text color (hex)
```

Current colors match the cyan crystal theme:
- Background: `#0f0f0f` (dark slate)
- Text: `#ffffff` (white)

### Changing Installer Icons

Replace these files with your own:

- **Icon file:** `assets/branding/logo/exports/icon.ico`
- **Header banner:** `assets/branding/installer/header.png` (150×57)
- **Sidebar banner:** `assets/branding/installer/sidebar.png` (164×314)

### Changing Installation Directory

Edit `electron-builder.json`:

```json
{
  "nsis": {
    "installerIcon": "assets/branding/logo/exports/icon.ico"
  }
}
```

Or in `scripts/installer.nsh`:

```nsh
InstallDir "$PROGRAMFILES\${APP_NAME}"
```

Other common locations:
- `$PROGRAMFILES` - C:\Program Files
- `$PROGRAMFILES(X86)` - C:\Program Files (x86)
- `$LOCALAPPDATA` - C:\Users\YourName\AppData\Local
- `$APPDATA` - C:\Users\YourName\AppData\Roaming

### Adding/Removing Shortcuts

Edit `scripts/installer.nsh` in the `SecApp` section:

```nsh
; Create Desktop shortcut
CreateShortcut "$DESKTOP\${APP_NAME}.lnk" \
  "$INSTDIR\${APP_EXE}"

; Create Quick Launch shortcut (Windows 7 only)
CreateShortcut "$QUICKLAUNCH\${APP_NAME}.lnk" \
  "$INSTDIR\${APP_EXE}"
```

### Modifying License Agreement

The license shown during installation is:

- File: `assets/branding/installer/license.rtf`
- Modify in any RTF editor (Notepad++, Word, etc.)
- electron-builder.json references it: `"license": "assets/branding/installer/license.rtf"`

---

## Code Signing Setup

### Why Code Signing?

Code signing provides:
- **Trusted Publisher Status** - No SmartScreen warnings
- **Reputation Building** - Faster reputation accumulation
- **Professional Image** - Shows users the app is legitimate
- **Windows Defender Bypass** - Reduces SmartScreen blocks

### Getting a Certificate

#### Option 1: Standard Code Signing Certificate (~$150-300/year)

1. Visit certificate vendor:
   - DigiCert: https://www.digicert.com/code-signing
   - Sectigo: https://sectigo.com/code-signing
   - GlobalSign: https://www.globalsign.com/en/code-signing

2. Provide company information and verify identity

3. Download certificate as `.pfx` file

4. Store securely: `C:\Certificates\code-signing-cert.pfx`

#### Option 2: EV Code Signing Certificate (~$400-500/year)

Recommended for higher reputation impact:
- Instant SmartScreen reputation
- Faster user trust building
- More professional appearance

### Setting Up Your Certificate

1. **Export to .pfx format:**
   - If you have a .cer + .key file:
     ```bash
     openssl pkcs12 -export -in certificate.crt -inkey private.key -out certificate.pfx
     ```

2. **Store safely:**
   ```
   C:\Certificates\code-signing-cert.pfx
   ```

3. **Note the password:**
   - You'll need it in `.env.local`

4. **Create `.env.local`:**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit to add:
   ```env
   CSC_LINK=C:\Certificates\code-signing-cert.pfx
   CSC_KEY_PASSWORD=your_password_here
   ```

5. **Build with signing:**
   ```bash
   npm run build:installer
   ```

### Verifying Code Signing

After building:

1. Right-click installer .exe
2. Select "Properties"
3. Go to "Digital Signatures" tab
4. If signed, you'll see the certificate details
5. Verify:
   - Signer: Your company name
   - Timestamp: Recent date
   - Valid: "Signature is OK"

---

## Troubleshooting

### Error: "signtool.exe not found"

**Cause:** Windows SDK not installed

**Solution:**
1. Download Windows SDK: https://developer.microsoft.com/en-us/windows/downloads/windows-sdk/
2. Run installer
3. Select "Windows SDK" component only
4. Install (~2GB download)
5. Retry build

### Error: "Certificate not found"

**Cause:** CSC_LINK path is incorrect

**Solution:**
1. Verify file exists: `C:\Certificates\code-signing-cert.pfx`
2. Use absolute path in `.env.local`
3. Ensure path uses backslashes: `C:\Certificates\cert.pfx`
4. Check for typos

### Error: "Invalid certificate password"

**Cause:** CSC_KEY_PASSWORD is wrong

**Solution:**
1. Verify password with certificate issuer
2. Test password locally (if possible)
3. Check for extra spaces in `.env.local`
4. Ensure password is correct when exporting

### Error: "No entry points found for architecture"

**Cause:** Webpack build failed

**Solution:**
1. Check for TypeScript errors: `npm run lint`
2. Verify all components are properly imported
3. Check webpack config: `webpack.main.config.ts`
4. Run build manually: `npm run make`

### Installer looks pixelated on high-DPI displays

**Cause:** PNG images need DPI scaling

**Solution:**
1. Regenerate header/sidebar at 2x resolution
2. Edit `scripts/generate-installer-assets.js`:
   ```javascript
   // Change width/height to 300x114 for header, 328x628 for sidebar
   ```
3. Regenerate: `npm run generate-installer-assets`

---

## Build Output

After successful build, you'll have:

```
dist-installer/
├── Sims4Updater Setup 1.0.0.exe     (Signed installer, ~150MB)
└── (other artifacts)

out/                                   (Packaged app from Electron Forge)
├── my-app-win32-x64/
│   ├── Sims4Updater.exe
│   ├── resources/
│   ├── node_modules/
│   └── (other files)
└── (other architectures)
```

### Installer Size

- **Total:** ~150MB (includes all dependencies)
- **Installed:** ~300MB
- **Breakdown:**
  - Electron: ~150MB
  - Node modules: ~100MB
  - Python sidecar: ~50MB

### Distribution

1. **GitHub Releases:**
   ```bash
   gh release create v1.0.0 dist-installer/Sims4Updater\ Setup\ 1.0.0.exe
   ```

2. **Direct Download:**
   - Host on your website
   - Users download .exe and run installer

3. **MSIX/Store (Optional):**
   - Can be packaged for Microsoft Store
   - Requires additional configuration

---

## Advanced Configuration

### Custom Installation Pages

Add custom page to `scripts/installer.nsh`:

```nsh
; Create custom page
Page custom PageUserInfo PageUserInfoLeave

Function PageUserInfo
  nsDialogs::Create 1018
  Pop $0
  
  ${NSD_CreateLabel} 0 0 100% 12u "Enter your name:"
  Pop $1
  
  ${NSD_CreateText} 0 13u 100% 12u ""
  Pop $2
  
  nsDialogs::Show
FunctionEnd

Function PageUserInfoLeave
  ${NSD_GetText} $2 $USERNAME
FunctionEnd
```

### Detecting Windows Version

In `scripts/installer.nsh`:

```nsh
!include "WinVer.nsh"

${If} ${AtLeastWin10}
  MessageBox MB_OK "Windows 10 or later detected"
${EndIf}
```

### Creating Registry Associations

Add to `WriteRegistry` function:

```nsh
; Associate .upd files with Sims 4 Updater
WriteRegStr HKCR ".upd" "" "Sims4Updater.File"
WriteRegStr HKCR "Sims4Updater.File\shell\open\command" "" "$INSTDIR\${APP_EXE} ""%1"""
```

---

## Performance Tips

1. **Build time optimization:**
   - Use SSD for builds
   - Close antivirus during build
   - Increase Node memory: `NODE_OPTIONS=--max_old_space_size=4096`

2. **Installer size reduction:**
   - Minify assets
   - Remove unused dependencies
   - Use asar archive (already enabled)

3. **Install time optimization:**
   - Solid compression (already configured)
   - Lazy-load plugins if possible

---

## Security Best Practices

1. **Certificate Management:**
   - Store `.pfx` files in secure location
   - Use strong passwords (16+ characters)
   - Never commit to version control
   - Rotate certificates annually

2. **Build Machine:**
   - Keep Windows updated
   - Install latest SDK updates
   - Use dedicated build machine if possible
   - Enable full-disk encryption

3. **Distribution:**
   - Host installers on HTTPS only
   - Verify SHA256 hash before publishing
   - Keep build logs for audit trail
   - Test on clean systems

---

## Uninstaller Behavior

The installer creates a professional uninstaller that:

1. **Closes the application** - Automatically stops running processes
2. **Removes files** - Deletes all installation files
3. **Removes shortcuts** - Cleans up Start Menu and Desktop
4. **Cleans registry** - Removes all registry entries
5. **Confirms uninstall** - Shows success message

Users can uninstall via:
- `Control Panel` → `Programs and Features`
- Start Menu shortcut: `Sims 4 Updater` → `Uninstall`
- Direct exe: `C:\Program Files\Sims 4 Updater\Uninstall Sims 4 Updater.exe`

---

## Testing the Installer

### Manual Testing Checklist

- [ ] Installer starts without errors
- [ ] Welcome page displays correctly
- [ ] Can select installation directory
- [ ] Installation completes successfully
- [ ] Desktop shortcut created and functional
- [ ] Start Menu shortcuts created
- [ ] Application launches from shortcuts
- [ ] Uninstaller works correctly
- [ ] All files removed after uninstall
- [ ] Registry cleaned after uninstall

### Automated Testing

Create `scripts/test-installer.js`:

```javascript
const fs = require('fs');
const path = require('path');

const files = [
  'dist-installer/Sims4Updater Setup 1.0.0.exe',
  'assets/branding/logo/exports/icon.ico',
  'assets/branding/installer/header.png',
  'assets/branding/installer/sidebar.png',
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`❌ Missing: ${file}`);
    process.exit(1);
  }
  console.log(`✅ ${file}`);
});

console.log('\n🎉 All installer files ready!');
```

Run: `node scripts/test-installer.js`

---

## Next Steps

1. **Set up code signing** (if distributing publicly)
2. **Test on Windows 10/11 VMs** (various DPI settings)
3. **Create GitHub Release** with installer
4. **Monitor SmartScreen reputation** (if code signed)
5. **Gather user feedback** on installation experience

---

## Additional Resources

- **NSIS Documentation:** http://nsis.sourceforge.net/Docs/
- **electron-builder:** https://www.electron.build/
- **Code Signing Guide:** https://docs.microsoft.com/en-us/windows/win32/seccrypto/signtool
- **Windows Installer Best Practices:** https://docs.microsoft.com/en-us/windows/win32/msi/best-practices

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Author:** KhaoticKodeDev62
