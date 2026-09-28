# Publishing FocusDesk to the Chrome Web Store

FocusDesk is **offline-first**: data lives in `chrome.storage.local` on the user’s device. Backup is via **Export JSON** in Settings (no account required).

## What users experience

1. Install **FocusDesk** from the [Chrome Web Store](https://chromewebstore.google.com/).
2. Open a **new tab** — projects, tasks, notes, and planner work without sign-in or network.

## Publisher checklist

1. **Developer account** — [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) (one-time registration fee).
2. **Package** — ZIP the extension root (folder with `manifest.json`, `newtab.html`, `src/`, `assets/`). Exclude `.git`, tests, and dev-only files if you prefer a smaller upload.
3. **Listing** — Name, short description, screenshots (1280×800 or 640×400), category, icon assets.
4. **Privacy** — Single purpose: personal productivity on the New Tab. Permission: `storage` only (local data). Publish a short **privacy policy** stating data stays on-device unless the user exports a file.
5. **Review** — Explain that the extension overrides the New Tab and stores data locally; no remote servers.

## Permissions (current manifest)

| Permission | Why |
|------------|-----|
| `storage` | Save projects, tasks, notes, and settings in Chrome |

No `identity`, host permissions, or OAuth — simpler review and no Google Cloud setup.

## Tips

- Test the **same ZIP** you upload via **Load unpacked** before submitting.
- Mention **export/import** in the store description so users know how to back up or move data.
- Version bumps: update `version` in `manifest.json` for each store release.
