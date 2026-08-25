@echo off
cls

title Pushing files to GitHub

echo   ____ ___ _____        _    _ ____  ____      _  _____ _____
echo  / ___^|_ _^|_   _^|      ^| ^|  ^| ^|  _ \^|  _ \    / \^|_   _^| ____^|
echo ^| ^|  _ ^| ^|  ^| ^|        ^| ^|  ^| ^| ^|_  ^| ^| ^| ^|  / _ \ ^| ^| ^|  _^|
echo ^| ^|_^| ^|^| ^|  ^| ^|        ^| ^|__^| ^|  __/^| ^|_^| ^| / ___ \^| ^| ^| ^|___
echo  \____^|___^| ^|_^|         \____/^|_^|   ^|____/ /_/   \_\_^| ^|_____^|
echo.


rem Initializing to git

if not exist ".git" (
    echo ---------------------------
    echo    Initializing to Git...
    echo ---------------------------
    echo.
    git init
    echo.
)

rem Showing the files that need to be staged
echo --------------------------------------
echo    Showing The Repository Status...
echo --------------------------------------
git status -s
echo.

rem Staging files to github
echo -----------------------------------------
echo    Adding All Files To Staging Area...
echo -----------------------------------------
git add .
echo.

rem Commit Changes
echo ----------------------------
echo    Committing Changes...
echo ----------------------------
set /p "commitMsg=Enter Your Commit Message or (click enter to use default): "
if "%commitMsg%"=="" set "commitMsg=Update Files"
git commit -m "%commitMsg%"
echo.

rem Push changes to repository
echo --------------------------------------
echo    Pushing Changes To Repository...
echo --------------------------------------
git push
echo.

rem Check the status of the repository
echo --------------------------------------
echo    Checking The Repository Status...
echo --------------------------------------
git status
echo.

echo ============================================
echo    All Operations Completed Successfully.
echo ============================================
echo.
pause