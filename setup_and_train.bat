@echo off
echo Setting up Skin Cancer Detection Project...
echo.

REM Create virtual environment if it doesn't exist
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    echo Virtual environment created.
) else (
    echo Virtual environment already exists.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install requirements
echo Installing requirements...
pip install -r requirements.txt

REM Run setup script
echo Running setup script...
python setup.py

REM Train model if setup was successful
if %ERRORLEVEL% EQU 0 (
    echo Starting model training...
    python train.py --epochs 50 --fine_tune --train_hybrid
) else (
    echo Setup failed. Please fix the issues and try again.
)

echo.
echo Process complete.
pause