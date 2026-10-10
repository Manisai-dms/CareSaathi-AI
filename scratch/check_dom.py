import asyncio
import json
import urllib.request
import websockets

async def check():
    tabs = json.loads(urllib.request.urlopen('http://127.0.0.1:9222/json').read().decode('utf-8'))
    ws = await websockets.connect(tabs[0]['webSocketDebuggerUrl'])
    await ws.send(json.dumps({'id': 1, 'method': 'Runtime.evaluate', 'params': {
        'expression': 'document.querySelector("[aria-live=\'polite\']") ? document.querySelector("[aria-live=\'polite\']").innerText : "NOT_FOUND"',
        'returnByValue': True
    }}))
    res = json.loads(await ws.recv())
    print("Found text:", res.get("result", {}).get("result", {}).get("value"))
    await ws.close()

asyncio.run(check())
