# setup-lsp-kit.ps1
# Installs: Node (if needed), Go (if needed), Gemini/Qwen/Claude CLIs, LSP servers, mcp-language-server
# Creates: .gemini/settings.json, .qwen/settings.json, GEMINI.md, QWEN.md in the current project

$ErrorActionPreference = "Stop"

function Ensure-Command($cmd, $hint) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    Write-Host "Missing: $cmd" -ForegroundColor Yellow
    Write-Host $hint -ForegroundColor Yellow
    exit 1
  }
}

Write-Host "== LSP KIT: prereqs ==" -ForegroundColor Cyan
Ensure-Command winget "Install winget (App Installer) from Microsoft Store."

# Node 20+ is required for Qwen Code; Gemini CLI also commonly uses Node. :contentReference[oaicite:6]{index=6}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Node.js (LTS)..." -ForegroundColor Cyan
  winget install -e --id OpenJS.NodeJS.LTS
}
# Go for mcp-language-server :contentReference[oaicite:7]{index=7}
if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
  Write-Host "Installing Go..." -ForegroundColor Cyan
  winget install -e --id GoLang.Go
}

Ensure-Command npm "npm not found even after Node install. Restart terminal and try again."
Ensure-Command go  "go not found even after Go install. Restart terminal and try again."

Write-Host "== Installing CLIs ==" -ForegroundColor Cyan
# Gemini CLI install (official repo shows npm distribution) :contentReference[oaicite:8]{index=8}
npm install -g @google/gemini-cli

# Qwen Code install (docs: npm install -g @qwen-code/qwen-code@latest) :contentReference[oaicite:9]{index=9}
npm install -g @qwen-code/qwen-code@latest

# Claude Code installed via npm in many setups; plugin docs assume `claude` available. :contentReference[oaicite:10]{index=10}
npm install -g @anthropic-ai/claude-code

Write-Host "== Installing language servers (baseline set) ==" -ForegroundColor Cyan
# Python (pyright) :contentReference[oaicite:11]{index=11}
npm install -g pyright

# TypeScript :contentReference[oaicite:12]{index=12}
npm install -g typescript typescript-language-server

# JSON/CSS/HTML (handy for web projects)
npm install -g vscode-langservers-extracted

# YAML
npm install -g yaml-language-server

# Bash
npm install -g bash-language-server

Write-Host "== Installing MCP → LSP bridge (mcp-language-server) ==" -ForegroundColor Cyan
# mcp-language-server install :contentReference[oaicite:13]{index=13}
go install github.com/isaacphi/mcp-language-server@latest

# Ensure Go bin is on PATH for this session
$goBin = (go env GOPATH) + "\bin"
if ($env:Path -notlike "*$goBin*") { $env:Path = "$goBin;$env:Path" }

Write-Host "== Writing project configs (.gemini / .qwen + context files) ==" -ForegroundColor Cyan
New-Item -ItemType Directory -Force .gemini | Out-Null
New-Item -ItemType Directory -Force .qwen   | Out-Null

@'
{
  "mcp": {
    "allowed": ["lsp-py", "lsp-ts"]
  },
  "mcpServers": {
    "lsp-py": {
      "command": "mcp-language-server",
      "args": ["--workspace", ".", "--lsp", "pyright-langserver", "--", "--stdio"],
      "cwd": ".",
      "timeout": 600000,
      "trust": false
    },
    "lsp-ts": {
      "command": "mcp-language-server",
      "args": ["--workspace", ".", "--lsp", "typescript-language-server", "--", "--stdio"],
      "cwd": ".",
      "timeout": 600000,
      "trust": false
    }
  }
}
'@ | Set-Content -Encoding UTF8 .gemini\settings.json

@'
{
  "mcp": {
    "allowed": ["lsp-py", "lsp-ts"]
  },
  "mcpServers": {
    "lsp-py": {
      "command": "mcp-language-server",
      "args": ["--workspace", ".", "--lsp", "pyright-langserver", "--", "--stdio"],
      "cwd": ".",
      "timeout": 600000
    },
    "lsp-ts": {
      "command": "mcp-language-server",
      "args": ["--workspace", ".", "--lsp", "typescript-language-server", "--", "--stdio"],
      "cwd": ".",
      "timeout": 600000
    }
  }
}
'@ | Set-Content -Encoding UTF8 .qwen\settings.json

@'
# GEMINI.md (project instruction)
Use MCP LSP tools before making edits:
- Run diagnostics for touched files
- Use definition / references for symbol understanding
- Prefer rename_symbol over manual rename
- If unsure about location, ask LSP for references/definition first
'@ | Set-Content -Encoding UTF8 .\GEMINI.md

@'
# QWEN.md (project instruction)
Always use MCP LSP tools for code navigation:
- diagnostics before edits
- definition/references for symbol discovery
- rename_symbol for project-wide renames
- report file + line/col for changes
'@ | Set-Content -Encoding UTF8 .\QWEN.md

Write-Host "`nDONE." -ForegroundColor Green
Write-Host "Next:" -ForegroundColor Green
Write-Host "  1) In this folder run: gemini  (Gemini reads .gemini/settings.json) :contentReference[oaicite:14]{index=14}"
Write-Host "  2) In this folder run: qwen    (Qwen reads .qwen/settings.json) :contentReference[oaicite:15]{index=15}"
Write-Host "  3) For Claude Code LSP: install LSP plugins (see below) :contentReference[oaicite:16]{index=16}"
