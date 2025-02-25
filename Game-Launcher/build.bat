pyinstaller --onefile --noconsole Launcher.py
move "dist\Launcher.exe" "."
rmdir /S /Q "build"
rmdir /S /Q "dist"