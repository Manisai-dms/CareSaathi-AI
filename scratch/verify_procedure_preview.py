import asyncio
import base64
import json
import os
import subprocess
import time
import urllib.request
import websockets

BRAIN_DIR = r"C:\Users\SANTHOSH KUMAR\.gemini\antigravity-ide\brain\18d9ca4c-1ee1-4ba2-9683-c4e950297f61"
EDGE_EXE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
USER_DATA_DIR = os.path.join(BRAIN_DIR, "scratch", "edge_user_data")

async def run_cdp():
    # 1. Fetch demo token from backend
    req = urllib.request.Request("http://127.0.0.1:8000/api/auth/demo-login", data=b"{}", headers={"Content-Type": "application/json"})
    token_resp = urllib.request.urlopen(req)
    token_data = json.loads(token_resp.read().decode("utf-8"))
    token = token_data["access_token"]
    print("Obtained demo auth token successfully.")

    # 2. Launch headless Edge with remote debugging port
    os.makedirs(USER_DATA_DIR, exist_ok=True)
    edge_proc = subprocess.Popen([
        EDGE_EXE,
        "--headless=new",
        "--remote-debugging-port=9222",
        f"--user-data-dir={USER_DATA_DIR}",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--window-size=1280,1080",
        "about:blank"
    ])
    print("Launched Edge with CDP on port 9222.")
    time.sleep(2)

    try:
        # 3. Get websocket debugger URL
        tabs_resp = urllib.request.urlopen("http://127.0.0.1:9222/json")
        tabs = json.loads(tabs_resp.read().decode("utf-8"))
        ws_url = tabs[0]["webSocketDebuggerUrl"]
        print(f"Connecting to CDP websocket: {ws_url}")

        async with websockets.connect(ws_url, max_size=20*1024*1024) as ws:
            msg_id = 0
            async def send_cmd(method, params=None):
                nonlocal msg_id
                msg_id += 1
                payload = {"id": msg_id, "method": method, "params": params or {}}
                await ws.send(json.dumps(payload))
                while True:
                    res = json.loads(await ws.recv())
                    if res.get("id") == msg_id:
                        return res.get("result", {})

            await send_cmd("Page.enable")
            await send_cmd("Runtime.enable")

            # Navigate to frontend base URL
            print("Navigating to http://localhost:5173/ ...")
            await send_cmd("Page.navigate", {"url": "http://localhost:5173/"})
            await asyncio.sleep(2)

            # Set auth token in localStorage and redirect to dashboard
            print("Injecting auth token into localStorage...")
            set_token_js = f"""
                localStorage.setItem('caresaathi_token', '{token}');
                localStorage.removeItem('caresaathi_is_guest');
                window.location.href = '/dashboard';
            """
            await send_cmd("Runtime.evaluate", {"expression": set_token_js})
            await asyncio.sleep(3)

            # Wait for dashboard to settle
            print("Dashboard loaded. Checking Step 1 and Condition Preview...")
            check_js = """
                (() => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    const commonCardNames = buttons
                        .map(b => b.innerText)
                        .filter(t => t.includes('Cataract') || t.includes('Knee') || t.includes('Angioplasty') || t.includes('Lithotripsy'));
                    return {
                        title: document.title,
                        cardsFound: commonCardNames.length,
                        bodyTextPreview: document.body.innerText.substring(0, 300)
                    };
                })()
            """
            eval_res = await send_cmd("Runtime.evaluate", {"expression": check_js, "returnByValue": True})
            print("Eval result on dashboard:", eval_res.get("result", {}).get("value"))

            # Helper to take screenshot and save
            async def capture(filename):
                shot_res = await send_cmd("Page.captureScreenshot", {"format": "png"})
                img_data = base64.b64decode(shot_res["data"])
                out_path = os.path.join(BRAIN_DIR, filename)
                with open(out_path, "wb") as f:
                    f.write(img_data)
                print(f"Captured screenshot: {out_path}")

            # Test 1: Cataract Eye Surgery
            print("Selecting Cataract Eye Surgery card...")
            click_cataract = """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cataract Eye Surgery'));
                    if (btn) { btn.click(); return 'Clicked Cataract'; }
                    return 'Not found';
                })()
            """
            await send_cmd("Runtime.evaluate", {"expression": click_cataract})
            await asyncio.sleep(1.5)
            await capture("preview_cataract_desktop.png")

            # Test 2: Click gallery stage in preview (Stage 2 / Phacoemulsification)
            print("Clicking Stage 2 gallery thumbnail...")
            click_stage2 = """
                (() => {
                    const btns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Phacoemulsification') || b.innerText.includes('Stage'));
                    if (btns.length > 0) { btns[btns.length - 1].click(); return 'Clicked stage thumbnail'; }
                    return 'Not found';
                })()
            """
            await send_cmd("Runtime.evaluate", {"expression": click_stage2})
            await asyncio.sleep(1)
            await capture("preview_cataract_stage2.png")

            # Test 3: Total Knee Replacement
            print("Selecting Total Knee Replacement card...")
            click_tkr = """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Total Knee Replacement'));
                    if (btn) { btn.click(); return 'Clicked TKR'; }
                    return 'Not found';
                })()
            """
            await send_cmd("Runtime.evaluate", {"expression": click_tkr})
            await asyncio.sleep(1.5)
            await capture("preview_knee_replacement.png")

            # Test 4: Coronary Angioplasty (PTCA)
            print("Selecting Coronary Angioplasty card...")
            click_angio = """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Coronary Angioplasty'));
                    if (btn) { btn.click(); return 'Clicked Angio'; }
                    return 'Not found';
                })()
            """
            await send_cmd("Runtime.evaluate", {"expression": click_angio})
            await asyncio.sleep(1.5)
            await capture("preview_angioplasty.png")

            # Test 5: Laser Lithotripsy (Kidney Stones)
            print("Selecting Laser Lithotripsy card...")
            click_litho = """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Laser Lithotripsy'));
                    if (btn) { btn.click(); return 'Clicked Litho'; }
                    return 'Not found';
                })()
            """
            await send_cmd("Runtime.evaluate", {"expression": click_litho})
            await asyncio.sleep(1.5)
            await capture("preview_lithotripsy.png")

            # Test 6: Mobile view (~390px width)
            print("Emulating Mobile View (390px x 844px)...")
            await send_cmd("Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 2,
                "mobile": True
            })
            await asyncio.sleep(1.5)
            await capture("preview_mobile_390px.png")

            print("All verification steps completed successfully!")
    finally:
        edge_proc.terminate()
        print("Terminated Edge process.")

if __name__ == "__main__":
    asyncio.run(run_cdp())
