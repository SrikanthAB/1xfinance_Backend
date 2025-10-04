@echo off
setlocal enabledelayedexpansion

REM Create abis directory if it doesn't exist
if not exist "abis" mkdir abis

REM Find all .sol files in the src directory
for /r "src" %%f in (*.sol) do (
    echo Generating ABI for %%~nf...
    solc --abi "%%f" --overwrite -o abis
    if errorlevel 1 (
        echo Failed to generate ABI for %%~nf
    ) else (
        echo Successfully generated ABI for %%~nf
    )
)

echo.
echo All ABIs have been generated in the 'abis' directory.
pause
