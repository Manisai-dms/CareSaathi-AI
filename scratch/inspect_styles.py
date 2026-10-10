import asyncio
import json
import urllib.request
import websockets

async def inspect():
    tabs = json.loads(urllib.request.urlopen('http://127.0.0.1:9222/json').read().decode('utf-8'))
    ws = await websockets.connect(tabs[0]['webSocketDebuggerUrl'])
    expr = """
        (() => {
            const el = document.querySelector('[aria-live="polite"]');
            if (!el) return 'NO_EL';
            const child = el.firstElementChild;
            const inner = child ? child.firstElementChild : null;
            return {
                outerOpacity: window.getComputedStyle(el).opacity,
                childOpacity: child ? window.getComputedStyle(child).opacity : 'none',
                innerOpacity: inner ? window.getComputedStyle(inner).opacity : 'none',
                innerDisplay: inner ? window.getComputedStyle(inner).display : 'none',
                innerColor: inner ? window.getComputedStyle(inner).color : 'none',
                innerTextLength: el.innerText.length,
                innerHTML: el.innerHTML.substring(0, 300)
            };
        })()
    """
    await ws.send(json.dumps({'id': 1, 'method': 'Runtime.evaluate', 'params': {'expression': expr, 'returnByValue': True}}))
    res = json.loads(await ws.recv())
    print("Inspection result:", res.get("result", {}).get("result", {}).get("value"))
    await ws.close()

asyncio.run(inspect())
