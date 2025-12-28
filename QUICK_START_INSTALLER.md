# Quick Start - Build the Installer

## 30-Second Overview

You now have a **professional, branded Windows installer** for Sims 4 Updater.

**To build it:**

```bash
npm run build:installer
```

**Output:** `dist-installer/Sims4Updater Setup 1.0.0.exe`

---

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
pip install -r requirements.txt
```

### 2. Generate Assets (One-Time)
```bash
npm run prebuild:installer
```

Creates:
- 8 PNG icons (16-1024px)
- .ico file
- Installer header and sidebar images

### 3. Build Installer
```bash
npm run build:installer
```

Takes: 3-5 minutes
Output: `dist-installer/Sims4Updater Setup 1.0.0.exe`

---

## What You Get

### Installer Features ✨
- ✅ Professional branded pages
- ✅ Cyan crystal theme
- ✅ Custom icons and graphics
- ✅ Auto-close running app before uninstall
- ✅ Clean registry management
- ✅ Start Menu + Desktop shortcuts
- ✅ MIT License agreement
- ✅ Detailed progress messages

### Splash Screen ✨
- ✅ Animated glassmorphism overlay
- ✅ Glowing crystal logo
- ✅ Loading progress bar
- ✅ Backend connection status
- ✅ Smooth 60fps animations
- ✅ Auto-launch app on ready

### Code Structure ✨
- ✅ Fully typed TypeScript
- ✅ React Framer Motion animations
- ✅ IPC event communication
- ✅ Proper window lifecycle management
- ✅ Error handling and fallbacks

---

## Testing the Installer

### Quick Test
1. Double-click `Sims4Updater Setup 1.0.0.exe`
2. Click "Next" through pages
3. Choose install location
4. Wait for installation
5. Check:
   - [ ] Desktop shortcut created
   - [ ] Start Menu folder created
   - [ ] Application launches
   - [ ] Uninstall shortcut works

### Full Test (Recommended)
- Test on clean Windows 10/11 VM
- Test on different user accounts
- Verify Programs and Features entry
- Verify uninstall removes all files
- Check registry cleanup

---

## Customization

### Change Application Name
Edit `package.json`:
```json
{
  "name": "your-app",
  "productName": "Your App Name"
}
```

### Change Company/Publisher
Edit `scripts/installer.nsh`:
```nsh
!define COMPANY_NAME "Your Company"
!define APP_PUBLISHER "Your Publisher"
```

### Change Colors
Edit `scripts/installer.nsh`:
```nsh
!define MUI_BGCOLOR_FOREGROUND "0f0f0f"      ; Background
!define MUI_TEXTCOLOR_FOREGROUND "ffffff"    ; Text
```

### Change Installation Directory
Edit `scripts/installer.nsh`:
```nsh
InstallDir "$PROGRAMFILES\${APP_NAME}"
```

### Change Welcome Message
Edit `electron-builder.json`:
```json
{
  "nsis": {
    "installerIcon": "path/to/icon.ico"
  }
}
```

For more customization options, see:
- `docs/NSIS_CUSTOMIZATION_REFERENCE.md`
- `docs/INSTALLER_BUILD_GUIDE.md`

---

## Code Signing (Production)

### Option 1: No Signing (Development)
```bash
npm run build:installer
```

Installer works fine, but shows "Unknown Publisher" warning.

### Option 2: With Code Signing (Production)

1. **Get certificate:** Purchase code signing certificate (DigiCert, Sectigo, etc.)

2. **Set up environment:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Edit `.env.local`:**
   ```
   CSC_LINK=C:\Certificates\code-signing-cert.pfx
   CSC_KEY_PASSWORD=your_password_here
   ```

4. **Build with signing:**
   ```bash
   npm run build:installer
   ```

Installer shows "Verified publisher" - trusted by Windows.

---

## File Structure

What was created for you:

```
assets/branding/
├── logo/
│   ├── source/icon.svg
│   └── exports/icon-*.png (8 sizes)
├── installer/
│   ├── header.png
│   ├── sidebar.png
│   └── license.rtf

src/
├── components/SplashScreen.tsx
├── splash.html
├── splash-renderer.tsx
├── index.ts (modified)
└── preload.ts (modified)

scripts/
├── generate-icons.js
├── generate-ico.js
├── generate-installer-assets.js
├── sign-windows.js
├── post-package-sign.js
└── installer.nsh

docs/
├── BRAND_GUIDELINES.md
├── INSTALLER_BUILD_GUIDE.md
└── NSIS_CUSTOMIZATION_REFERENCE.md

Configuration:
├── electron-builder.json
├── forge.config.ts (modified)
├── package.json (modified)
├── .env.local.example
└── .gitignore (modified)
```

---

## Build Scripts

| Command | What It Does | Time |
|---------|------------|------|
| `npm run generate-icons` | SVG → PNG (all sizes) | 30s |
| `npm run generate-ico` | .ico verification | 10s |
| `npm run generate-installer-assets` | NSIS graphics | 10s |
| `npm run prebuild:installer` | All asset generation | 1min |
| `npm run build:installer` | Full installer build | 3-5min |

---

## Troubleshooting

### "Module not found: sharp"
```bash
npm install --legacy-peer-deps
```

### Installer won't start
- Check Windows 7+
- Ensure no admin permission conflicts
- Check antivirus isn't blocking

### Splash screen doesn't show
- Check `src/splash.html` exists
- Verify `src/splash-renderer.tsx` compiles
- Check forge.config.ts entry points

### Icons don't appear
- Regenerate assets: `npm run prebuild:installer`
- Check image paths exist
- Verify .ico file created

### Registry entries missing
- Run installer as admin
- Check Windows permissions
- Verify registry key in scripts/installer.nsh

For more help: `docs/INSTALLER_BUILD_GUIDE.md` → Troubleshooting section

---

## Distribution

### Method 1: GitHub Releases
```bash
gh release create v1.0.0 dist-installer/Sims4Updater\ Setup\ 1.0.0.exe
```

### Method 2: Direct Download
Upload to your website/cloud storage

### Method 3: Microsoft Store
Follow Windows Store submission process (optional)

---

## Key Features Checklist

When your installer runs:

- [ ] Welcome page shows with cyan theme
- [ ] Directory selection works
- [ ] Files copy to installation directory
- [ ] Shortcuts created successfully
- [ ] Registry entries written
- [ ] Finish page shows with GitHub link
- [ ] Splash screen animates on app launch
- [ ] Progress bar shows during backend init
- [ ] App launches successfully
- [ ] Uninstaller removes all traces
- [ ] Registry cleaned on uninstall

---

## Performance

| Metric | Value |
|--------|-------|
| Asset Generation | 1-2 minutes |
| Installer Build | 3-5 minutes |
| Installer Size | ~150MB |
| Installation Time | 2-3 minutes |
| Installed Size | ~300MB |

---

## Next Steps

1. ✅ **Build installer**
   ```bash
   npm run build:installer
   ```

2. ✅ **Test on Windows VM**
   - Test installation
   - Test uninstall
   - Test shortcuts

3. ✅ **If satisfied, deploy**
   - Upload to GitHub Releases
   - Share with users
   - Monitor feedback

4. ✅ **Optional: Set up code signing**
   - Get certificate
   - Configure .env.local
   - Rebuild with signing

---

## Documentation

Need more details?

| Document | For |
|----------|-----|
| `BRAND_GUIDELINES.md` | Logo usage and branding |
| `INSTALLER_BUILD_GUIDE.md` | Complete build instructions |
| `NSIS_CUSTOMIZATION_REFERENCE.md` | Customization options |
| `NSIS_IMPROVEMENTS.md` | What was enhanced |
| `IMPLEMENTATION_COMPLETE.md` | Full project overview |

---

## Support Resources

- **NSIS Docs:** http://nsis.sourceforge.net/Docs/
- **electron-builder:** https://www.electron.build/
- **Code Signing:** https://docs.microsoft.com/en-us/windows/win32/seccrypto/signtool
- **Windows Installer Best Practices:** https://docs.microsoft.com/en-us/windows/win32/msi/best-practices

---

## Summary

🎉 **You now have:**
- ✅ Professional branded logo
- ✅ Animated splash screen
- ✅ Custom NSIS installer
- ✅ Code signing setup
- ✅ Comprehensive documentation
- ✅ Build automation

**Build your installer:**
```bash
npm run build:installer
```

**That's it!** 🚀

---

**Version:** 1.0  
**Last Updated:** December 2024  
**Author:** KhaoticKodeDev62
