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
USER_DATA_DIR = os.path.join(BRAIN_DIR, "scratch", "edge_user_data_focused")

async def run():
    # Demo token
    req = urllib.request.Request("http://127.0.0.1:8000/api/auth/demo-login", data=b"{}", headers={"Content-Type": "application/json"})
    token_resp = urllib.request.urlopen(req)
    token = json.loads(token_resp.read().decode("utf-8"))["access_token"]

    os.makedirs(USER_DATA_DIR, exist_ok=True)
    edge_proc = subprocess.Popen([
        EDGE_EXE,
        "--headless=new",
        "--remote-debugging-port=9225",
        f"--user-data-dir={USER_DATA_DIR}",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--window-size=1280,1200",
        "about:blank"
    ])
    time.sleep(2)

    try:
        tabs_resp = urllib.request.urlopen("http://127.0.0.1:9225/json")
        ws_url = json.loads(tabs_resp.read().decode("utf-8"))[0]["webSocketDebuggerUrl"]

        async with websockets.connect(ws_url, max_size=30*1024*1024) as ws:
            msg_id = 0
            async def send_cmd(method, params=None):
                nonlocal msg_id
                msg_id += 1
                await ws.send(json.dumps({"id": msg_id, "method": method, "params": params or {}}))
                while True:
                    res = json.loads(await ws.recv())
                    if res.get("id") == msg_id:
                        return res.get("result", {})

            await send_cmd("Page.enable")
            await send_cmd("Runtime.enable")

            # Load page & auth
            await send_cmd("Page.navigate", {"url": "http://localhost:5173/"})
            await asyncio.sleep(2)
            await send_cmd("Runtime.evaluate", {"expression": f"localStorage.setItem('caresaathi_token', '{token}'); window.location.href = '/dashboard';"})
            await asyncio.sleep(2.5)

            async def capture_focused(filename):
                # Scroll into view
                await send_cmd("Runtime.evaluate", {"expression": """
                    (() => {
                        const preview = document.querySelector('div[aria-live="polite"]');
                        if (preview) {
                            preview.scrollIntoView({ behavior: 'instant', block: 'center' });
                        } else {
                            window.scrollBy(0, 500);
                        }
                    })()
                """})
                await asyncio.sleep(0.8)
                shot = await send_cmd("Page.captureScreenshot", {"format": "png"})
                out = os.path.join(BRAIN_DIR, filename)
                with open(out, "wb") as f:
                    f.write(base64.b64decode(shot["data"]))
                print(f"Saved: {filename}")

            # 1. Cataract Eye Surgery
            await send_cmd("Runtime.evaluate", {"expression": """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cataract Eye Surgery'));
                    if (btn) btn.click();
                })()
            """})
            await asyncio.sleep(0.5)
            await capture_focused("focused_cataract_preview.png")

            # 2. Total Knee Replacement
            await send_cmd("Runtime.evaluate", {"expression": """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Total Knee Replacement'));
                    if (btn) btn.click();
                })()
            """})
            await asyncio.sleep(0.5)
            await capture_focused("focused_knee_preview.png")

            # 3. Coronary Angioplasty (PTCA)
            await send_cmd("Runtime.evaluate", {"expression": """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Coronary Angioplasty'));
                    if (btn) btn.click();
                })()
            """})
            await asyncio.sleep(0.5)
            await capture_focused("focused_angioplasty_preview.png")

            # 4. Laser Lithotripsy
            await send_cmd("Runtime.evaluate", {"expression": """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Laser Lithotripsy'));
                    if (btn) btn.click();
                })()
            """})
            await asyncio.sleep(0.5)
            await capture_focused("focused_lithotripsy_preview.png")

            # 5. Mobile view (390px width x 844px)
            await send_cmd("Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 844,
                "deviceScaleFactor": 2,
                "mobile": True
            })
            await asyncio.sleep(0.5)
            await capture_focused("focused_mobile_preview.png")

            print("Captured all focused screenshots!")
    finally:
        edge_proc.terminate()

if __name__ == "__main__":
    asyncio.run(run())
