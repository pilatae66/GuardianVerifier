@echo off
REM Guardian Verification System - Build Helper Script (Windows)
REM Usage: build.bat [option]
REM Options: test, prod, prod-win, clean, all

setlocal enabledelayedexpansion

cls
echo ==================================
echo Guardian Verification System
echo Build Helper
echo ==================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i

echo [OK] Node.js %NODE_VERSION%
echo [OK] npm %NPM_VERSION%
echo.

REM Parse command line argument
set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=help

REM Main build logic
if "%BUILD_TYPE%"=="test" (
    goto build_test
) else if "%BUILD_TYPE%"=="prod" (
    goto build_prod
) else if "%BUILD_TYPE%"=="prod-win" (
    goto build_prod_win
) else if "%BUILD_TYPE%"=="clean" (
    goto clean_build
) else if "%BUILD_TYPE%"=="all" (
    goto build_all
) else if "%BUILD_TYPE%"=="help" (
    goto show_help
) else (
    echo [ERROR] Unknown option: %BUILD_TYPE%
    goto show_help
)

:build_test
echo [INFO] Building for testing...
call npm run test-build
if errorlevel 1 (
    echo [ERROR] Test build failed
    exit /b 1
)
echo [OK] Testing build completed
echo.
echo Build location: .\build
echo.
goto end

:build_prod
echo [INFO] Installing dependencies...
call npm install
echo [INFO] Building for production...
call npm run prod-build
if errorlevel 1 (
    echo [ERROR] Production build failed
    exit /b 1
)
echo [OK] Production build completed
echo.
echo Build location: .\dist
echo Files created:
dir /b dist\*.exe 2>nul || echo No .exe files found
echo.
goto end

:build_prod_win
echo [INFO] Installing dependencies...
call npm install
echo [INFO] Building for Windows...
call npm run prod-build-win
if errorlevel 1 (
    echo [ERROR] Windows build failed
    exit /b 1
)
echo [OK] Windows build completed
echo.
echo Build location: .\dist
echo Files created:
dir /b dist\*.exe 2>nul || echo No .exe files found
echo.
goto end

:clean_build
echo [INFO] Cleaning previous builds...
if exist build (
    rmdir /s /q build
)
if exist dist (
    rmdir /s /q dist
)
echo [OK] Build artifacts cleaned
echo.
goto end

:build_all
echo [INFO] Installing dependencies...
call npm install
echo [INFO] Cleaning previous builds...
if exist build (
    rmdir /s /q build
)
if exist dist (
    rmdir /s /q dist
)
echo [INFO] Building for production...
call npm run prod-build
if errorlevel 1 (
    echo [ERROR] Production build failed
    exit /b 1
)
echo [OK] Full build completed
echo.
echo Build location: .\dist
echo Files created:
dir /b dist\*.exe 2>nul || echo No .exe files found
echo.
goto end

:show_help
echo Usage: build.bat [option]
echo.
echo Options:
echo   test       Build for testing (React only)
echo   prod       Build for production (Windows)
echo   prod-win   Build for Windows installer
echo   clean      Remove build artifacts
echo   all        Full clean build for production
echo   help       Show this help message
echo.
goto end

:end
endlocal
