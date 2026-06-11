@echo off
title VexonMart Git Updater
echo ========================================
echo    Pushing VexonMart to GitHub
echo ========================================
echo.

:: Check if git is initialized
if not exist ".git" (
    echo First run: Initializing git repository...
    git init
    echo.
)

:: Show what's changed
echo Files to be committed:
git status --short
echo.

:: Stage all changes
echo Staging files...
git add .
echo.

:: Commit with message
set /p commitMsg="Enter commit message (or press Enter for 'Update Files'): "
if "%commitMsg%"=="" set "commitMsg=Update Files"
git commit -m "%commitMsg%"
echo.

:: Push to GitHub
echo Pushing to GitHub...
git push
echo.

:: Show final status
echo Final status:
git status
echo.

echo ========================================
echo    Done! Check GitHub for changes.
echo ========================================
pause