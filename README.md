# FocusDesk

FocusDesk is a **Manifest V3** Chrome extension that replaces the New Tab page with a local-first personal project management dashboard. **No account, no cloud** — data stays in Chrome on your device.

## Interface styles

Use the **Theme** panel at the bottom of the sidebar (below Settings):

- **Style:** Liquid Glass, Minimal, or Retro
- **Colors:** Light, Dark, or System

## Features

- Dashboard with live stats, today's focus, projects, deadlines, and activity feed
- Projects (grid/list, filters, detail view with tasks and notes)
- Tasks (list + Kanban with drag-and-drop and keyboard status selectors)
- My Day planner (per-date tasks, focus, and notes)
- Monthly calendar with tasks by due date
- Notes with search and optional project link
- Global search and Quick Add (task, project, note)
- Reports from real stored data
- Settings (defaults, export/import, reset, optional demo data)
- Data stored in `chrome.storage.local` (offline)

## Install (Load unpacked)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder: `FocusDesk` (the directory containing `manifest.json`)
5. Open a **new tab** — FocusDesk should load as your New Tab page

No build step is required for normal use.

### Optional: regenerate icons

```bash
node scripts/generate-icons.mjs
```

### Optional: run unit tests

```bash
node tests/run-tests.mjs
```

## Usage tips

- Use **Quick Add** in the header for fast capture.
- **Export JSON** in Settings before major changes or browser profile resets.
- **Load demo data** in Settings to explore; items are labeled `[Demo]` and can be removed without touching your own data.

## Publishing

See [docs/CHROME_WEB_STORE.md](docs/CHROME_WEB_STORE.md) for a Chrome Web Store checklist (offline-only build).

## Permissions

- `storage` — local persistence only

## Project structure

```text
FocusDesk/
├── manifest.json
├── newtab.html
├── assets/icons/
├── src/
│   ├── app.js
│   ├── router.js
│   ├── components/
│   ├── models/
│   ├── pages/
│   ├── state/
│   ├── storage/
│   ├── styles/
│   └── utils/
├── scripts/
├── tests/
└── README.md
```

## Known limitations

- Data is **not** synced across devices; use export/import to move backups.
- No browser push notifications or background reminders in this MVP.
- Notes use plain text / light Markdown-style content (no rich editor).
- Calendar shows tasks by due date only (no external calendar integration).

## License

Personal use / MIT (add your preferred license as needed).
