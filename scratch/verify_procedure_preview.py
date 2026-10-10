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
USER_DATA_DIR = os.path.join(BRAIN_DIR, "scratch", "edge_user_data_2")

async def run_cdp():
    req = urllib.request.Request("http://127.0.0.1:8000/api/auth/demo-login", data=b"{}", headers={"Content-Type": "application/json"})
    token_resp = urllib.request.urlopen(req)
    token_data = json.loads(token_resp.read().decode("utf-8"))
    token = token_data["access_token"]

    os.makedirs(USER_DATA_DIR, exist_ok=True)
    edge_proc = subprocess.Popen([
        EDGE_EXE,
        "--headless=new",
        "--remote-debugging-port=9223",
        f"--user-data-dir={USER_DATA_DIR}",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--window-size=1380,1400",
        "about:blank"
    ])
    time.sleep(2)

    try:
        tabs_resp = urllib.request.urlopen("http://127.0.0.1:9223/json")
        tabs = json.loads(tabs_resp.read().decode("utf-8"))
        ws_url = tabs[0]["webSocketDebuggerUrl"]

        async with websockets.connect(ws_url, max_size=25*1024*1024) as ws:
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

            await send_cmd("Page.navigate", {"url": "http://localhost:5173/"})
            await asyncio.sleep(2)

            set_token_js = f"""
                localStorage.setItem('caresaathi_token', '{token}');
                localStorage.removeItem('caresaathi_is_guest');
                window.location.href = '/dashboard';
            """
            await send_cmd("Runtime.evaluate", {"expression": set_token_js})
            await asyncio.sleep(2.5)

            async def scroll_to_preview():
                scroll_js = """
                    (() => {
                        window.scrollTo({ top: 480, behavior: 'instant' });
                    })()
                """
                await send_cmd("Runtime.evaluate", {"expression": scroll_js})
                await asyncio.sleep(0.5)

            async def capture(filename):
                shot_res = await send_cmd("Page.captureScreenshot", {"format": "png"})
                img_data = base64.b64decode(shot_res["data"])
                out_path = os.path.join(BRAIN_DIR, filename)
                with open(out_path, "wb") as f:
                    f.write(img_data)
                print(f"Captured screenshot: {filename}")

            # 1. Select Cataract Eye Surgery
            print("1. Cataract Eye Surgery...")
            await send_cmd("Runtime.evaluate", {"expression": """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cataract Eye Surgery'));
                    if (btn) btn.click();
                })()
            """})
            await scroll_to_preview()
            await asyncio.sleep(1)
            await capture("cataract_preview_detailed.png")

            # 2. Select Total Knee Replacement
            print("2. Total Knee Replacement...")
            await send_cmd("Runtime.evaluate", {"expression": """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Total Knee Replacement'));
                    if (btn) btn.click();
                })()
            """})
            await scroll_to_preview()
            await asyncio.sleep(1)
            await capture("knee_replacement_preview_detailed.png")

            # 3. Select Coronary Angioplasty (PTCA)
            print("3. Coronary Angioplasty...")
            await send_cmd("Runtime.evaluate", {"expression": """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Coronary Angioplasty'));
                    if (btn) btn.click();
                })()
            """})
            await scroll_to_preview()
            await asyncio.sleep(1)
            await capture("angioplasty_preview_detailed.png")

            # 4. Select Laser Lithotripsy
            print("4. Laser Lithotripsy...")
            await send_cmd("Runtime.evaluate", {"expression": """
                (() => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Laser Lithotripsy'));
                    if (btn) btn.click();
                })()
            """})
            await scroll_to_preview()
            await asyncio.sleep(1)
            await capture("lithotripsy_preview_detailed.png")

            # 5. Mobile responsive check (390px x 844px)
            print("5. Mobile Responsive View (390px)...")
            await send_cmd("Emulation.setDeviceMetricsOverride", {
                "width": 390,
                "height": 900,
                "deviceScaleFactor": 2,
                "mobile": True
            })
            await send_cmd("Runtime.evaluate", {"expression": "window.scrollTo({ top: 380, behavior: 'instant' });"})
            await asyncio.sleep(1)
            await capture("mobile_preview_390px_detailed.png")

            print("Done capturing detailed screenshots!")
    finally:
        edge_proc.terminate()

if __name__ == "__main__":
    asyncio.run(run_cdp())
