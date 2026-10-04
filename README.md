# FocusDesk



A lightweight **New Tab** notepad for tasks and projects — write first, organize later.



## Features



- **Tasks** tab: My Pad notepad (Enter for next line, checkbox to complete)

- **Projects** tab: simple project sections with progress and inline tasks

- Optional time estimates, project assignment, due dates (inline popovers — no modals)

- Remaining work total at the bottom

- Retro light appearance (fixed)

- Data in `chrome.storage.local` (offline)



## Install



1. `chrome://extensions` → Developer mode → **Load unpacked** → this folder

2. Open a **new tab**



## Test in Cursor / any browser (dev mode)

Normal browser tabs cannot load the extension. Dev mode uses **localStorage** (you’ll see **FocusDesk · dev** in the header).

```bash
node scripts/dev-server.mjs
```

Open **http://localhost:3456/newtab.html** (or http://localhost:3456/).

## Develop

```bash
node tests/run-tests.mjs
node scripts/generate-icons.mjs
```



## License



MIT (or your choice).


