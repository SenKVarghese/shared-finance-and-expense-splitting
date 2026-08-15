@echo off
echo =======================================================================
echo 📊 Shared Finance ^& Expense Splitting App Simulator - Git Publisher
echo =======================================================================
echo.
echo This script will help you initialize a Git repository locally and
echo prepare it to be published to GitHub.
echo.

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in your system PATH.
    echo Please install Git from https://git-scm.com/ and try again.
    echo.
    pause
    exit /b 1
)

:: Check if already initialized
if exist .git (
    echo [INFO] Git repository is already initialized in this directory.
) else (
    echo [ACTION] Initializing a new Git repository...
    git init
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to initialize Git repository.
        pause
        exit /b 1
    )
)

echo.
echo [ACTION] Staging files...
git add .

echo.
echo [ACTION] Creating initial commit...
git commit -m "Initial commit: Shared Finance & Expense Splitting App Simulator"

echo.
echo =======================================================================
echo 🎉 Git Repository Initialized and Files Committed!
echo =======================================================================
echo.
echo To publish this repository to GitHub, follow these steps:
echo.
echo 1. Go to https://github.com/new and create a new repository.
echo    - Suggest Name: shared-finance-and-expense-splitting
echo    - Do NOT initialize with a README, .gitignore, or License.
echo.
echo 2. Run the following commands in your command prompt:
echo.
echo    git branch -M main
echo    git remote add origin ^<YOUR_GITHUB_REPOSITORY_URL^>
echo    git push -u origin main
echo.
echo Replace ^<YOUR_GITHUB_REPOSITORY_URL^> with the URL of your new GitHub repo
echo (e.g., https://github.com/yourusername/shared-finance-and-expense-splitting.git)
echo.
echo =======================================================================
pause
