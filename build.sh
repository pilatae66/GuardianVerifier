#!/bin/bash

# Guardian Verification System - Build Helper Script
# Usage: ./build.sh [option]
# Options: test, prod, prod-win, prod-mac, prod-linux, clean, all

set -e  # Exit on error

echo "=================================="
echo "Guardian Verification System"
echo "Build Helper"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Node.js and npm are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    
    print_success "Node.js $NODE_VERSION"
    print_success "npm $NPM_VERSION"
    echo ""
}

# Install dependencies
install_deps() {
    print_info "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
    echo ""
}

# Clean previous builds
clean() {
    print_info "Cleaning previous builds..."
    rm -rf build dist
    print_success "Build artifacts cleaned"
    echo ""
}

# Build for testing
build_test() {
    print_info "Building for testing..."
    npm run test-build
    print_success "Testing build completed"
    echo ""
    echo "Build location: ./build"
    echo "Total size: $(du -sh build 2>/dev/null | cut -f1)"
    echo ""
}

# Build for production (auto-detect OS)
build_prod() {
    print_info "Building for production..."
    npm run prod-build
    print_success "Production build completed"
    echo ""
    echo "Build location: ./dist"
    echo "Files created:"
    ls -lh dist/ 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    echo ""
}

# Build for Windows
build_prod_win() {
    print_info "Building for Windows..."
    npm run prod-build-win
    print_success "Windows build completed"
    echo ""
    echo "Build location: ./dist"
    ls -lh dist/*.exe 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    echo ""
}

# Build for macOS
build_prod_mac() {
    print_info "Building for macOS..."
    npm run prod-build-mac
    print_success "macOS build completed"
    echo ""
    echo "Build location: ./dist"
    ls -lh dist/*.dmg 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    echo ""
}

# Build for Linux
build_prod_linux() {
    print_info "Building for Linux..."
    npm run prod-build-linux
    print_success "Linux build completed"
    echo ""
    echo "Build location: ./dist"
    ls -lh dist/*.AppImage 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
    echo ""
}

# Show help
show_help() {
    echo "Usage: ./build.sh [option]"
    echo ""
    echo "Options:"
    echo "  test           Build for testing (React only)"
    echo "  prod           Build for production (all platforms)"
    echo "  prod-win       Build for Windows only"
    echo "  prod-mac       Build for macOS only"
    echo "  prod-linux     Build for Linux only"
    echo "  clean          Remove build artifacts"
    echo "  all            Full clean build for production"
    echo "  help           Show this help message"
    echo ""
}

# Main script
main() {
    check_dependencies
    
    case "${1:-help}" in
        test)
            install_deps
            build_test
            ;;
        prod)
            install_deps
            build_prod
            ;;
        prod-win)
            install_deps
            build_prod_win
            ;;
        prod-mac)
            install_deps
            build_prod_mac
            ;;
        prod-linux)
            install_deps
            build_prod_linux
            ;;
        clean)
            clean
            ;;
        all)
            install_deps
            clean
            build_prod
            ;;
        help)
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
