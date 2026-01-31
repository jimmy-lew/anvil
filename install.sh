#!/bin/sh
set -e

# Configuration
APP_NAME="anvil"
REPO_URL="https://github.com/jimmy-lew/anvil"
BINARY_BASE_URL="https://github.com/jimmy-lew/anvil/releases/latest/download"
INSTALL_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"
MACOS_APP_DIR="$HOME/Applications"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    printf "${GREEN}[INFO]${NC} %s\n" "$1"
}

print_warn() {
    printf "${YELLOW}[WARN]${NC} %s\n" "$1"
}

print_error() {
    printf "${RED}[ERROR]${NC} %s\n" "$1"
}

# Detect OS and architecture
detect_platform() {
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)

    case "$OS" in
        darwin) OS="darwin" ;;
        linux) OS="linux" ;;
        *)
            print_error "Unsupported operating system: $OS"
            exit 1
            ;;
    esac

    case "$ARCH" in
        x86_64|amd64) ARCH="amd64" ;;
        arm64|aarch64) ARCH="arm64" ;;
        *)
            print_error "Unsupported architecture: $ARCH"
            exit 1
            ;;
    esac

    print_info "Detected platform: $OS-$ARCH"
}

# Check if curl exists
check_curl() {
    if ! command -v curl >/dev/null 2>&1; then
        print_error "curl is not installed. Please install curl first."
        exit 1
    fi
}

# Download and install prebuilt binary
install_binary() {
    print_info "Installing prebuilt binary..."

    BINARY_NAME="${APP_NAME}-${OS}-${ARCH}.tar.gz"
    DOWNLOAD_URL="${BINARY_BASE_URL}/${BINARY_NAME}"

    print_info "Downloading from: $DOWNLOAD_URL"

    # Create temporary directory
    TMP_DIR=$(mktemp -d)
    cd "$TMP_DIR"

    # Download binary
    curl -fsSL -o "$BINARY_NAME" "$DOWNLOAD_URL"

    # Extract archive
    print_info "Extracting archive..."
    tar -xzf "$BINARY_NAME"

    # Create install directory if it doesn't exist
    mkdir -p "$INSTALL_DIR"

    # Move binary to install directory
    if [ -f "$APP_NAME" ]; then
        mv "$APP_NAME" "$INSTALL_DIR/"
        chmod +x "$INSTALL_DIR/$APP_NAME"
    else
        print_error "Binary not found in archive"
        exit 1
    fi

    # Cleanup
    cd - >/dev/null
    rm -rf "$TMP_DIR"

    print_info "Binary installed to: $INSTALL_DIR/$APP_NAME"
}

# Clone repo and build from source
build_from_source() {
    print_info "Building from source..."

    # Check for git
    if ! command -v git >/dev/null 2>&1; then
        print_error "git is not installed. Please install git first."
        exit 1
    fi

    # Check for Go
    if ! command -v go >/dev/null 2>&1; then
        print_error "Go is not installed. Please install Go or use prebuilt binary."
        exit 1
    fi

    # Create temporary directory
    TMP_DIR=$(mktemp -d)
    cd "$TMP_DIR"

    # Clone repository
    print_info "Cloning repository..."
    git clone "$REPO_URL" repo
    cd repo

    # Build
    print_info "Building application..."
    go build -o "$APP_NAME" .

    # Create install directory if it doesn't exist
    mkdir -p "$INSTALL_DIR"

    # Move binary to install directory
    if [ -f "$APP_NAME" ]; then
        mv "$APP_NAME" "$INSTALL_DIR/"
        chmod +x "$INSTALL_DIR/$APP_NAME"
    else
        print_error "Build failed - binary not found"
        exit 1
    fi

    # Cleanup
    cd - >/dev/null
    rm -rf "$TMP_DIR"

    print_info "Binary built and installed to: $INSTALL_DIR/$APP_NAME"
}

# Create desktop entry for application launchers (Linux)
create_desktop_entry() {
    # Only create desktop entry on Linux
    if [ "$OS" != "linux" ]; then
        return
    fi

    print_info "Creating desktop entry for application launchers..."

    # Create applications directory if it doesn't exist
    mkdir -p "$DESKTOP_DIR"

    # Create .desktop file
    cat > "$DESKTOP_DIR/$APP_NAME.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Anvil
Comment=Anvil CLI Application
Exec=$INSTALL_DIR/$APP_NAME
Icon=utilities-terminal
Terminal=true
Categories=Utility;Development;
Keywords=anvil;cli;terminal;
EOF

    chmod +x "$DESKTOP_DIR/$APP_NAME.desktop"

    # Update desktop database if available
    if command -v update-desktop-database >/dev/null 2>&1; then
        update-desktop-database "$DESKTOP_DIR" 2>/dev/null || true
    fi

    print_info "Desktop entry created at: $DESKTOP_DIR/$APP_NAME.desktop"
    print_info "Anvil should now be searchable in Rofi, Wofi, and other launchers"
}

# Create .app bundle for macOS (makes it searchable in Spotlight/Raycast)
create_macos_app() {
    # Only for macOS
    if [ "$OS" != "darwin" ]; then
        return
    fi

    print_info "Creating .app bundle for Spotlight and Raycast..."

    APP_BUNDLE="$MACOS_APP_DIR/Anvil.app"
    CONTENTS_DIR="$APP_BUNDLE/Contents"
    MACOS_DIR="$CONTENTS_DIR/MacOS"
    RESOURCES_DIR="$CONTENTS_DIR/Resources"

    # Create directory structure
    mkdir -p "$MACOS_DIR"
    mkdir -p "$RESOURCES_DIR"

    # Copy binary
    cp "$INSTALL_DIR/$APP_NAME" "$MACOS_DIR/$APP_NAME"
    chmod +x "$MACOS_DIR/$APP_NAME"

    # Create Info.plist
    cat > "$CONTENTS_DIR/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>$APP_NAME</string>
    <key>CFBundleIdentifier</key>
    <string>com.anvil.app</string>
    <key>CFBundleName</key>
    <string>Anvil</string>
    <key>CFBundleVersion</key>
    <string>1.0</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>LSUIElement</key>
    <false/>
</dict>
</plist>
EOF

    print_info "App bundle created at: $APP_BUNDLE"
    print_info "Anvil should now be searchable in Spotlight and Raycast"

    # Touch the Applications folder to refresh Spotlight
    touch "$MACOS_APP_DIR"
}

# Add to PATH
setup_path() {
    # Check if already in PATH
    case ":$PATH:" in
        *":$INSTALL_DIR:"*)
            print_info "$INSTALL_DIR is already in PATH"
            return
            ;;
    esac

    # Detect shell and add to appropriate rc file
    SHELL_NAME=$(basename "$SHELL")

    case "$SHELL_NAME" in
        bash)
            RC_FILE="$HOME/.bashrc"
            [ -f "$HOME/.bash_profile" ] && RC_FILE="$HOME/.bash_profile"
            ;;
        zsh)
            RC_FILE="$HOME/.zshrc"
            ;;
        fish)
            RC_FILE="$HOME/.config/fish/config.fish"
            ;;
        *)
            RC_FILE="$HOME/.profile"
            ;;
    esac

    # Add to PATH in rc file
    if [ -f "$RC_FILE" ]; then
        if ! grep -q "$INSTALL_DIR" "$RC_FILE" 2>/dev/null; then
            print_info "Adding $INSTALL_DIR to PATH in $RC_FILE"
            echo "" >> "$RC_FILE"
            echo "# Added by $APP_NAME installer" >> "$RC_FILE"
            echo "export PATH=\"\$PATH:$INSTALL_DIR\"" >> "$RC_FILE"
        fi
    else
        print_warn "Could not find shell rc file: $RC_FILE"
        print_info "Please manually add this to your PATH:"
        echo "export PATH=\"\$PATH:$INSTALL_DIR\""
    fi
}

# Main installation flow
main() {
    print_info "Welcome to Anvil installer!"
    echo ""

    detect_platform
    check_curl

    # Prompt user for installation method
    echo "How would you like to install Anvil?"
    echo "1) Download prebuilt binary (recommended)"
    echo "2) Clone repository and build from source"
    printf "Enter choice [1-2]: "
    read -r choice

    case "$choice" in
        1)
            install_binary
            ;;
        2)
            build_from_source
            ;;
        *)
            print_error "Invalid choice. Exiting."
            exit 1
            ;;
    esac

    setup_path
    create_desktop_entry
    create_macos_app

    echo ""
    print_info "Installation complete!"
    print_info "Run 'source $RC_FILE' or restart your terminal, then run: $APP_NAME"
    echo ""
    print_info "To use immediately in this session, run:"
    echo "  export PATH=\"\$PATH:$INSTALL_DIR\""
}

main
