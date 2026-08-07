@echo off
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --no-sandbox --disable-gpu --virtual-time-budget=15000 --run-all-compositor-stages-before-draw --screenshot="%~dp0cascade_gameplay.png" --window-size=1280,720 "http://localhost:5173/physica/?auto=1" 2>&1
