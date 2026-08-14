@echo off
set CHROME="C:\Program Files\Google\Chrome\Application\chrome.exe"
%CHROME% --headless --no-sandbox --disable-gpu --virtual-time-budget=10000 --screenshot="%~dp0cascade_initial.png" --window-size=1280,720 "http://localhost:5173/physica/"
