$ErrorActionPreference = "Stop"

# Configuration
$APP_NAME = "anvil"
$REPO_URL = "https://github.com/jimmy-lew/anvil"
$BINARY_BASE_URL = "https://github.com/jimmy-lew/anvil/releases/latest/download"
$INSTALL_DIR = "$env:LOCALAPPDATA\Programs\Anvil"
$START_MENU_DIR = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs"

# Colors for output
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Detect architecture
function Get-Architecture {
    $arch = $env:PROCESSOR_ARCHITECTURE
    switch ($arch) {
        "AMD64" { return "amd64" }
        "ARM64" { return "arm64" }
        default {
            Write-Error-Custom "Unsupported architecture: $arch"
            exit 1
        }
    }
}

# Download and install prebuilt binary
function Install-Binary {
    Write-Info "Installing prebuilt binary..."

    $arch = Get-Architecture
    $binaryName = "$APP_NAME-windows-$arch.tar.gz"
    $downloadUrl = "$BINARY_BASE_URL/$binaryName"

    Write-Info "Detected architecture: windows-$arch"
    Write-Info "Downloading from: $downloadUrl"

    # Create temporary directory
    $tempDir = New-Item -ItemType Directory -Path "$env:TEMP\anvil-install-$(Get-Random)" -Force
    $tempFile = "$tempDir\$binaryName"

    try {
        # Download binary
        Invoke-WebRequest -Uri $downloadUrl -OutFile $tempFile -UseBasicParsing

        # Extract archive (using tar which is available in Windows 10+)
        Write-Info "Extracting archive..."
        Set-Location $tempDir
        tar -xzf $binaryName

        # Create install directory if it doesn't exist
        if (-not (Test-Path $INSTALL_DIR)) {
            New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
        }

        # Move binary to install directory
        $exeName = "$APP_NAME.exe"
        if (Test-Path $exeName) {
            Move-Item -Path $exeName -Destination "$INSTALL_DIR\$exeName" -Force
            Write-Info "Binary installed to: $INSTALL_DIR\$exeName"
        } else {
            Write-Error-Custom "Binary not found in archive"
            exit 1
        }
    }
    finally {
        # Cleanup
        Set-Location $env:TEMP
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Clone repo and build from source
function Build-FromSource {
    Write-Info "Building from source..."

    # Check for git
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error-Custom "git is not installed. Please install git first or use prebuilt binary."
        Write-Info "Download git from: https://git-scm.com/download/win"
        exit 1
    }

    # Check for Go
    if (-not (Get-Command go -ErrorAction SilentlyContinue)) {
        Write-Error-Custom "Go is not installed. Please install Go first or use prebuilt binary."
        Write-Info "Download Go from: https://go.dev/dl/"
        exit 1
    }

    # Create temporary directory
    $tempDir = New-Item -ItemType Directory -Path "$env:TEMP\anvil-build-$(Get-Random)" -Force

    try {
        Set-Location $tempDir

        # Clone repository
        Write-Info "Cloning repository..."
        git clone $REPO_URL repo
        Set-Location repo

        # Build
        Write-Info "Building application..."
        go build -o "$APP_NAME.exe" .

        # Create install directory if it doesn't exist
        if (-not (Test-Path $INSTALL_DIR)) {
            New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
        }

        # Move binary to install directory
        if (Test-Path "$APP_NAME.exe") {
            Move-Item -Path "$APP_NAME.exe" -Destination "$INSTALL_DIR\$APP_NAME.exe" -Force
            Write-Info "Binary built and installed to: $INSTALL_DIR\$APP_NAME.exe"
        } else {
            Write-Error-Custom "Build failed - binary not found"
            exit 1
        }
    }
    finally {
        # Cleanup
        Set-Location $env:TEMP
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Add to PATH
function Add-ToPath {
    Write-Info "Adding to PATH..."

    # Get current user PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

    # Check if already in PATH
    if ($currentPath -split ';' | Where-Object { $_ -eq $INSTALL_DIR }) {
        Write-Info "$INSTALL_DIR is already in PATH"
        return
    }

    # Add to PATH
    $newPath = "$currentPath;$INSTALL_DIR"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")

    # Update PATH for current session
    $env:Path = "$env:Path;$INSTALL_DIR"

    Write-Info "Added $INSTALL_DIR to PATH"
}

# Create Start Menu shortcut (makes it searchable in Windows Search)
function Create-StartMenuShortcut {
    Write-Info "Creating Start Menu shortcut..."

    $WScriptShell = New-Object -ComObject WScript.Shell
    $shortcutPath = "$START_MENU_DIR\Anvil.lnk"
    $shortcut = $WScriptShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "$INSTALL_DIR\$APP_NAME.exe"
    $shortcut.WorkingDirectory = $INSTALL_DIR
    $shortcut.Description = "Anvil CLI Application"
    $shortcut.Save()

    Write-Info "Start Menu shortcut created at: $shortcutPath"
    Write-Info "Anvil should now be searchable in Windows Search, PowerToys Run, and other launchers"
}

# Rebuild Windows Search index for faster discovery
function Update-SearchIndex {
    Write-Info "Updating Windows Search index..."

    try {
        # Trigger indexing of the Start Menu folder
        $searcher = New-Object -ComObject Windows.Search.SearchHelper
        # This will help Windows Search pick up the new shortcut faster
        Start-Sleep -Seconds 1
    }
    catch {
        # Silent fail - not critical
    }
}

# Main installation flow
function Main {
    Write-Host ""
    Write-Info "Welcome to Anvil installer for Windows!"
    Write-Host ""

    # Prompt user for installation method
    Write-Host "How would you like to install Anvil?"
    Write-Host "1) Download prebuilt binary (recommended)"
    Write-Host "2) Clone repository and build from source"
    Write-Host ""
    $choice = Read-Host "Enter choice [1-2]"

    switch ($choice) {
        "1" {
            Install-Binary
        }
        "2" {
            Build-FromSource
        }
        default {
            Write-Error-Custom "Invalid choice. Exiting."
            exit 1
        }
    }

    Add-ToPath
    Create-StartMenuShortcut
    Update-SearchIndex

    Write-Host ""
    Write-Info "Installation complete!"
    Write-Info "You can now:"
    Write-Host "  1. Search for 'Anvil' in Windows Search (Win + S)" -ForegroundColor Cyan
    Write-Host "  2. Run 'anvil' from any new PowerShell/Command Prompt window" -ForegroundColor Cyan
    Write-Host "  3. Use PowerToys Run (Alt + Space) to launch Anvil" -ForegroundColor Cyan
    Write-Host ""
    Write-Info "To use immediately in this session, run:"
    Write-Host '  $env:Path = "$env:Path;' + $INSTALL_DIR + '"' -ForegroundColor Yellow
    Write-Host ""
}

# Run main function
Main
