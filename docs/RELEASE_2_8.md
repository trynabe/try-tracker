# Try-Tracker 2.8.0

Release prepared on 1 November 2026.

## Main interface

- The redesigned UI is now the default at `/` for desktop and mobile. The version badge reads `2.8`; the browser title remains `Try-Tracker`.
- `/preview/2.6` and its trailing-slash form remain compatible with existing preview links. `/classic` (also with a trailing slash) selects the original presentation for comparison. All paths use the same account and workspace; saving changes real data.
- The internal `v26` identifier and existing CSS filenames are retained. There are no API, database schema, backup-format or synchronization changes, and no new dependencies.

## UI changes

- Desktop floating icon Dock and compact top bar, with profile/settings in the header, consistent spacing, matte surfaces, light/dark/system themes and the existing accent preference.
- Mobile menu opens by swiping left on the page, including from its center, or swiping right from the left screen edge. It closes by swiping left, choosing a page, tapping the backdrop or pressing Escape. Form controls, dialogs and horizontal scroll areas keep their own interactions. Transform-based transitions support reduced motion. Dock buttons and the mobile add button share 40 × 40px square proportions and matching corner radii.
- Responsive habit date selection and heatmap sizing, compact Focus timer with an in-place category picker and session history, and consistent creation buttons/dialogs.
- The Today page shows a seven-day line/area progress overview. Statistics compares habits, completed tasks and focus time with the preceding period, using the existing records. Empty habit schedules appear as gaps rather than zero completion.
- Note editor fields, folder dropdown and task priority controls use consistent sizing and typography. Creation dialogs retain their close button and Escape behavior after removal of the requested Cancel buttons.

## Validation

- `npm test`: **97 passed**, zero failures, skips or cancellations. This includes the existing domain/backup/calendar tests and added coverage for accent contrast, daily chart values, edge gestures and release routing.
- `npm run build`: passed. Vite transformed 1,688 modules. Output: 238.94kB CSS (39.79kB gzip), 781.99kB JavaScript (228.52kB gzip). The large-chunk warning remains.
- `git diff --check`: passed.
- Release smoke checks on localhost: `/` at 1366 × 768 shows the eight-page desktop Dock and `2.8` badge; `/preview/2.6` selects the same UI; `/classic` selects the original UI. At 390 × 844, `/` selects the mobile edge Dock, with all eight buttons measuring 40 × 40px. Neither tested viewport has horizontal document overflow. No browser console warnings/errors were recorded during these checks.
- These release smoke checks did not add/edit records or start/stop the user's timer. Earlier responsive, keyboard, theme and interaction checks are recorded in [the preview development history](DESKTOP_26_PREVIEW.md). Physical-device Safari and live cloud synchronization were not revalidated for this release.
- Local release screenshots are stored in the task artifact folder `try-tracker-2.8/desktop-main.png` and `try-tracker-2.8/mobile-main.png`; they are not included in the repository.
