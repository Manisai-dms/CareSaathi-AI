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
USER_DATA_DIR = os.path.join(BRAIN_DIR, "scratch", "edge_user_data_tall")

async def run():
    req = urllib.request.Request("http://127.0.0.1:8000/api/auth/demo-login", data=b"{}", headers={"Content-Type": "application/json"})
    token = json.loads(urllib.request.urlopen(req).read().decode("utf-8"))["access_token"]

    os.makedirs(USER_DATA_DIR, exist_ok=True)
    edge_proc = subprocess.Popen([
        EDGE_EXE,
        "--headless=new",
        "--remote-debugging-port=9222",
        f"--user-data-dir={USER_DATA_DIR}",
        "--disable-gpu",
        "--window-size=1280,1800",
        "about:blank"
    ])
    time.sleep(2)

    try:
        tabs = json.loads(urllib.request.urlopen("http://127.0.0.1:9222/json").read().decode("utf-8"))
        ws_url = tabs[0]["webSocketDebuggerUrl"]

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

            await send_cmd("Page.navigate", {"url": "http://localhost:5173/"})
            await asyncio.sleep(2)
            await send_cmd("Runtime.evaluate", {"expression": f"localStorage.setItem('caresaathi_token', '{token}'); window.location.href = '/dashboard';"})
            await asyncio.sleep(3)

            async def capture(filename):
                shot = await send_cmd("Page.captureScreenshot", {"format": "png"})
                with open(os.path.join(BRAIN_DIR, filename), "wb") as f:
                    f.write(base64.b64decode(shot["data"]))
                print(f"Captured: {filename}")

            # 1. Click Cataract
            await send_cmd("Runtime.evaluate", {"expression": """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cataract Eye Surgery'));
                    if (btn) btn.click();
                })()
            """})
            await asyncio.sleep(1.2)
            await capture("cataract_full_view.png")

            # 2. Click Total Knee Replacement
            await send_cmd("Runtime.evaluate", {"expression": """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Total Knee Replacement'));
                    if (btn) btn.click();
                })()
            """})
            await asyncio.sleep(1.2)
            await capture("knee_replacement_full_view.png")

            # 3. Mobile View (390 x 1400)
            await send_cmd("Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 1400,
                "deviceScaleFactor": 2,
                "mobile": True
            })
            await asyncio.sleep(1.2)
            await capture("mobile_390px_full_view.png")

            print("Done capturing tall screenshots!")
    finally:
        edge_proc.terminate()

if __name__ == "__main__":
    asyncio.run(run())
