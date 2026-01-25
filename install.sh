#!/bin/bash

# Anvil CLI Installer
# Works on Windows (WSL), macOS, and Linux

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/jimmy-lew/anvil.git"
INSTALL_DIR="$HOME/.anvil"
BIN_DIR="$HOME/.local/bin"
CLI_NAME="anvil"

# Detect OS
OS="$(uname -s)"
case "$OS" in
  Darwin*)    OS="macos";;
  Linux*)     OS="linux";;
  *)          OS="unknown";;
esac

# Detect shell and config file
detect_shell() {
  if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
  elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
    # For macOS, check for .bash_profile
    if [ "$OS" = "macos" ]; then
      [ -f "$HOME/.bash_profile" ] && SHELL_RC="$HOME/.bash_profile"
    fi
  else
    SHELL_RC="$HOME/.profile"
  fi
}

# Print colored output
print_status() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check dependencies
check_dependencies() {
  local missing_deps=()
  
  if ! command_exists git; then
    missing_deps+=("git")
  fi
  
  if ! command_exists go; then
    missing_deps+=("go")
  fi
  
  if [ ${#missing_deps[@]} -ne 0 ]; then
    print_error "Missing dependencies: ${missing_deps[*]}"
    echo
    echo "Please install the missing dependencies:"
    
    for dep in "${missing_deps[@]}"; do
      case "$dep" in
        git)
          echo "  - git: https://git-scm.com/downloads"
          ;;
        go)
          echo "  - go: https://go.dev/doc/install"
          ;;
      esac
    done
    
    exit 1
  fi
}

# Clone or update repository
setup_repo() {
  print_status "Setting up Anvil repository..."
  
  if [ -d "$INSTALL_DIR" ]; then
    print_warning "Installation directory exists. Updating..."
    cd "$INSTALL_DIR"
    git pull origin main
  else
    print_status "Cloning repository..."
    git clone "$REPO_URL" "$INSTALL_DIR"
    cd "$INSTALL_DIR"
  fi
}

# Build CLI
build_cli() {
  print_status "Building Go CLI..."
  
  cd "$INSTALL_DIR/packages/cli"
  
  # Build the Go CLI
  go build -o "$BIN_DIR/$CLI_NAME" .
  
  if [ ! -f "$BIN_DIR/$CLI_NAME" ]; then
    print_error "Build failed - CLI not found"
    exit 1
  fi
}

# Create bin directory and setup CLI
setup_cli() {
  print_status "Setting up CLI executable..."
  
  # Create bin directory if it doesn't exist
  mkdir -p "$BIN_DIR"
}

# Update PATH in shell config
update_path() {
  print_status "Adding to PATH..."
  
  detect_shell
  
  # Check if bin directory is already in PATH
  if echo ":$PATH:" | grep -q ":$BIN_DIR:"; then
    print_success "CLI directory is already in PATH"
    return
  fi
  
  # Add to shell config
  echo "" >> "$SHELL_RC"
  echo "# Anvil CLI" >> "$SHELL_RC"
  echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$SHELL_RC"
  
  print_success "Added $BIN_DIR to PATH in $SHELL_RC"
}

# Create uninstall script
create_uninstall_script() {
  cat > "$INSTALL_DIR/uninstall.sh" << EOF
#!/bin/bash

# Anvil CLI Uninstaller

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
  echo -e "\${YELLOW}[INFO]\${NC} \$1"
}

print_success() {
  echo -e "\${GREEN}[SUCCESS]\${NC} \$1"
}

print_error() {
  echo -e "\${RED}[ERROR]\${NC} \$1"
}

print_status "Removing Anvil CLI..."

# Remove CLI executable
  rm -f "$BIN_DIR/$CLI_NAME"

# Remove installation directory
rm -rf "$INSTALL_DIR"

print_success "Anvil CLI uninstalled successfully!"
print_status "Please remove the following line from your shell config ($SHELL_RC):"
echo "export PATH=\"$BIN_DIR:\$PATH\""
EOF
  
  chmod +x "$INSTALL_DIR/uninstall.sh"
}

# Final verification
verify_installation() {
  print_status "Verifying installation..."
  
  # Try to run the CLI
  if "$BIN_DIR/$CLI_NAME" --version >/dev/null 2>&1; then
    print_success "Installation successful!"
    echo
    print_status "To use the CLI:"
    echo "  1. Restart your terminal or run: source $SHELL_RC"
    echo "  2. Run: $CLI_NAME --help"
    echo
    print_status "To uninstall, run: $INSTALL_DIR/uninstall.sh"
  else
    print_error "Installation verification failed"
    exit 1
  fi
}

# Main installation flow
main() {
  echo
  echo "🦾 Anvil CLI Installer"
  echo "======================="
  echo
  
  check_dependencies
  setup_repo
  build_cli
  setup_cli
  update_path
  create_uninstall_script
  verify_installation
}

# Run main function
main "$@"