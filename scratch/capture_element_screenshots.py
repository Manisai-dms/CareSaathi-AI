import asyncio
import base64
import json
import os
import urllib.request
import websockets

BRAIN_DIR = r"C:\Users\SANTHOSH KUMAR\.gemini\antigravity-ide\brain\18d9ca4c-1ee1-4ba2-9683-c4e950297f61"

async def capture_all():
    tabs = json.loads(urllib.request.urlopen('http://127.0.0.1:9222/json').read().decode('utf-8'))
    ws = await websockets.connect(tabs[0]['webSocketDebuggerUrl'], max_size=30*1024*1024)

    msg_id = 0
    async def send_cmd(method, params=None):
        nonlocal msg_id
        msg_id += 1
        await ws.send(json.dumps({'id': msg_id, 'method': method, 'params': params or {}}))
        while True:
            res = json.loads(await ws.recv())
            if res.get('id') == msg_id:
                return res.get('result', {})

    await send_cmd('Page.enable')
    await send_cmd('Runtime.enable')

    async def shoot(procedure_name, filename):
        # Click procedure button
        click_js = f"""
            (() => {{
                const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('{procedure_name}'));
                if (btn) btn.click();
                const preview = document.querySelector('[aria-live="polite"]');
                if (preview) {{
                    preview.scrollIntoView({{ behavior: 'instant', block: 'start' }});
                }}
            }})()
        """
        await send_cmd('Runtime.evaluate', {'expression': click_js})
        await asyncio.sleep(1.2)
        shot = await send_cmd('Page.captureScreenshot', {'format': 'png'})
        path = os.path.join(BRAIN_DIR, filename)
        with open(path, 'wb') as f:
            f.write(base64.b64decode(shot['data']))
        print(f"Captured {filename}")

    # Reset desktop metrics
    await send_cmd('Emulation.clearDeviceMetricsOverride')
    await asyncio.sleep(0.5)

    await shoot('Cataract Eye Surgery', 'cataract_preview_box.png')
    await shoot('Total Knee Replacement', 'knee_preview_box.png')
    await shoot('Coronary Angioplasty', 'angioplasty_preview_box.png')
    await shoot('Laser Lithotripsy', 'lithotripsy_preview_box.png')

    # Mobile test
    await send_cmd('Emulation.setDeviceMetricsOverride', {
        'width': 390,
        'height': 844,
        'deviceScaleFactor': 2,
        'mobile': True
    })
    await asyncio.sleep(0.5)
    await shoot('Cataract Eye Surgery', 'mobile_preview_box.png')

    await ws.close()
    print("All preview box screenshots captured successfully!")

if __name__ == '__main__':
    asyncio.run(capture_all())
