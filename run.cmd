@echo off
:: Headless pipeline launcher — works from any terminal (cmd, PS5, PS7).
:: Requires PowerShell 7+ (pwsh). Install via: winget install Microsoft.PowerShell

where pwsh >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: PowerShell 7 ^(pwsh^) not found in PATH.
    echo  Install it with:  winget install Microsoft.PowerShell
    echo.
    exit /b 1
)

pwsh -File "%~dp0run.ps1" %*
