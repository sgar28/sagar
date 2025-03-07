@echo off
echo Building ParkMaster for production...

:: Build the application
call npm run build

:: Check if build was successful
if errorlevel 1 (
    echo Build failed! Please check the errors above.
    exit /b 1
)

:: Start the production server
echo Starting ParkMaster server...
node deploy.js
