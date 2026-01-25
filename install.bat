@echo off
REM Anvil CLI Installer for Windows
setlocal enabledelayedexpansion

set "REPO_URL=https://github.com/jimmy-lew/anvil.git"
set "INSTALL_DIR=%USERPROFILE%\.anvil"
set "BIN_DIR=%USERPROFILE%\.local\bin"
set "CLI_NAME=anvil"

echo.
echo 🦾 Anvil CLI Installer
echo =======================
echo.

REM Check if running in Command Prompt or PowerShell
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    set "ARCH=x64"
) else (
    set "ARCH=x86"
)

REM Check dependencies
echo [INFO] Checking dependencies...

REM Check git
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] git is not installed. Please install from https://git-scm.com/download/win
    exit /b 1
)

REM Check go
go version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Go is not installed. Please install from https://go.dev/doc/install
    exit /b 1
)

REM Clone or update repository
if exist "%INSTALL_DIR%" (
    echo [WARNING] Installation directory exists. Updating...
    cd /d "%INSTALL_DIR%"
    git pull origin main
) else (
    echo [INFO] Cloning repository...
    git clone "%REPO_URL%" "%INSTALL_DIR%"
    cd /d "%INSTALL_DIR%"
)

REM Build CLI
echo [INFO] Building Go CLI...
cd /d "%INSTALL_DIR%\packages\cli"
go build -o "%BIN_DIR%\%CLI_NAME%.exe" .
if errorlevel 1 (
    echo [ERROR] Failed to build Go CLI
    exit /b 1
)

if not exist "%BIN_DIR%\%CLI_NAME%.exe" (
    echo [ERROR] Build failed - CLI executable not found
    exit /b 1
)

REM Create bin directory and setup CLI
echo [INFO] Setting up CLI executable...
if not exist "%BIN_DIR%" mkdir "%BIN_DIR%"

REM Create uninstall script
(
echo @echo off
echo REM Anvil CLI Uninstaller for Windows
echo.
echo echo [INFO] Removing Anvil CLI...
echo.
echo REM Remove CLI file
echo del /f /q "%BIN_DIR%\%CLI_NAME%.exe" 2^>nul
echo.
echo REM Remove installation directory
echo rmdir /s /q "%INSTALL_DIR%" 2^>nul
echo.
echo echo [SUCCESS] Anvil CLI uninstalled successfully!
echo echo.
echo echo [INFO] Please remove %BIN_DIR% from your PATH manually if needed.
) > "%INSTALL_DIR%\uninstall.bat"

REM Add to PATH
echo [INFO] Adding to PATH...

REM Check if already in PATH
echo %PATH% | findstr /C:"%BIN_DIR%" >nul
if errorlevel 1 (
    echo [INFO] Adding to user PATH...
    
    REM Use setx to add to permanent PATH
    setx PATH "%PATH%;%BIN_DIR%" >nul 2>&1
    
    if errorlevel 1 (
        echo [WARNING] Could not set permanent PATH. You may need to add it manually.
    ) else (
        echo [SUCCESS] Added to user PATH
    )
) else (
    echo [SUCCESS] CLI directory is already in PATH
)

REM Verify installation
echo [INFO] Verifying installation...
"%BIN_DIR%\%CLI_NAME%.exe" --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Installation verification failed
    exit /b 1
)

echo.
echo [SUCCESS] Installation successful!
echo.
echo To use the CLI:
echo   1. Restart your Command Prompt or PowerShell
echo   2. Run: %CLI_NAME% --help
echo.
echo To uninstall, run: %INSTALL_DIR%\uninstall.bat
echo.
pause