@echo off
REM Build verification script for Arrows Frontend (Windows)
REM Run this after `npm run build` to verify chunks are correctly generated

setlocal enabledelayedexpansion

set DIST_DIR=dist
set ASSETS_DIR=%DIST_DIR%\assets

echo ======================================
echo Chunk Build Verification
echo ======================================
echo.

REM Check if dist folder exists
if not exist "%DIST_DIR%" (
    echo X ERROR: dist/ folder not found. Run 'npm run build' first.
    exit /b 1
)

echo + dist/ folder exists

REM Check if assets folder exists
if not exist "%ASSETS_DIR%" (
    echo X ERROR: dist/assets/ folder not found.
    exit /b 1
)

echo + dist/assets/ folder exists
echo.

REM Count JS files
setlocal
for /f %%A in ('dir /b "%ASSETS_DIR%\*.js" 2^>nul ^| find /c /v ""') do set JS_FILES=%%A
echo JavaScript files: !JS_FILES!

if !JS_FILES! lss 5 (
    echo W WARNING: Expected at least 5 JS chunk files (main, vendor, utils, etc.)
    echo   Found only: !JS_FILES!
)

echo.
echo Checking for expected chunks:

setlocal enabledelayedexpansion
set "CHUNKS=index- react-vendor- mui-vendor- chart-vendor- utils-"
set FOUND_COUNT=0

for %%C in (%CHUNKS%) do (
    if exist "%ASSETS_DIR%\*%%C*.js" (
        for %%F in (%ASSETS_DIR%\*%%C*.js) do (
            echo   + Found: %%~nxF
            set /a FOUND_COUNT+=1
        )
    ) else (
        echo   W Missing: %%C*
    )
)

echo.
echo Critical chunks - MUST EXIST:

setlocal enabledelayedexpansion
set "CRITICAL=JobOpenings- Candidates- Dashboard-"
set CRITICAL_COUNT=0

for %%C in (%CRITICAL%) do (
    if exist "%ASSETS_DIR%\*%%C*.js" (
        for %%F in (%ASSETS_DIR%\*%%C*.js) do (
            echo   + Found: %%~nxF
            set /a CRITICAL_COUNT+=1
        )
    ) else (
        echo   X MISSING: %%C* - This will cause 404 errors in production!
    )
)

echo.
echo File listings:
echo ===============

echo.
echo All JavaScript files in dist/assets:
dir /s "%ASSETS_DIR%\*.js" 2>nul

echo.
echo ======================================
if !CRITICAL_COUNT! equ 3 (
    echo + Build verification PASSED
    echo ======================================
    exit /b 0
) else (
    echo X Build verification FAILED
    echo Some critical chunks are missing.
    echo Check vite.config.js manualChunks configuration.
    echo ======================================
    exit /b 1
)
