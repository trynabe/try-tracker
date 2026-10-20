# Try-Tracker 2.5

A bilingual personal discipline workspace built with React + Vite and Supabase. Designed for desktop and iPhone 13 (390 × 844 CSS pixels).

## Run locally

Requires Node.js 20.19+ or 22.12+.

1. Open a terminal in this folder.
2. Run npm install (dependencies are already installed in this checkout).
3. Run npm run dev.
4. Open http://127.0.0.1:5173.

Double-click start-try-tracker.cmd as an alternative. The browser must open the server URL; opening index.html directly does not run the app.

## Connect Supabase — ขั้นตอนเชื่อมต่อ

1. Create a project at https://supabase.com/dashboard. Keep its database password private.
2. In SQL Editor, run supabase/schema.sql. This creates per-user records, row-level security, and atomic mutation/restore functions.
3. Find Project URL and Publishable key in the project connection/API settings. A legacy anon key also works. Do not use a service_role or secret key in this client.
4. Copy .env.example to .env.local and fill VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
5. In Authentication → URL Configuration, set Site URL and allowed redirect URLs to http://127.0.0.1:5173 for local testing. Add your production origin when deploying later.
6. Restart npm run dev. Create an account, confirm the email if confirmation is enabled, then sign in with email and password.
7. Test with two accounts: each account must see only its own records. Test save/reload, another device, email confirmation and password reset before launch.

The backend integration and SQL schema are implemented, and this checkout has a Supabase URL and publishable key configured. The shared course catalog has been seeded and verified through the public Data API; its read-only client grants and RLS are verified. Full authentication, private record isolation, cross-device synchronization and production deployment still require end-to-end verification.

### Shared course catalog

The `course_catalog` table stores shared course codes and full names. New database installations receive ten MyCourses course names from `supabase/schema.sql`. For an existing database, run `supabase/migrations/202610110001_course_catalog.sql` once in its SQL Editor. Repeating the migration preserves administrator edits. Anonymous and signed-in clients may read this catalog; browser clients cannot insert, update or delete courses. Add or correct names through the Supabase Table Editor using an administrator account.

Calendar loads the catalog independently of private account records and matches course codes in ICS titles/categories (including `691_ITDS211`). Names appear in import previews, date cells, agendas and event details. Existing imports also acquire names without another import. A course list appears in Calendar only when saved ICS events identify courses; it lists each imported course once and excludes unrelated catalog entries. Removing all imports hides the list. Calendar uses only saved ICS events and their actual dates. It never pulls in weekly Schedule activities or Tasks, even when a course code matches. The Schedule and Tasks pages retain their own records and controls. Source titles, IDs and descriptions stay intact, so backups and duplicate detection are unchanged. Unknown or ambiguous codes keep the source title. The bundled ten-course fallback lets demo/offline use work when the catalog is unavailable. Deployment must use the same Supabase project environment variables to read this catalog; a different project needs the migration too.

### Storage and synchronization

Without Supabase configuration, the app opens in clearly labeled demo mode. Demo records remain local to this browser. Connected accounts read and write Supabase records; data is refreshed when the window becomes active and every 30 seconds while visible. Updates include a revision check so stale edits do not silently overwrite changes from another device. Cloud errors keep the current screen available and show an error. A failed mutation does not pretend to have saved.

Active timers are device-local, per account, and persist across reloads. Saved focus sessions synchronize through Supabase. The app does not start a timer on a different device automatically. A stopwatch uses wall-clock time while away; use Pause to exclude breaks. Pomodoro duration is capped to its selected focus length and completes on returning if a mobile browser suspended the app. Notifications work while the app is running and only when supported/allowed by the browser; no push service or closed-app reminders are installed.

### Move old data

In the original app, export your JSON backup. In Try-Tracker, open Settings → Import backup. Versions 1.0 and 2.0 are supported. Import replaces the current workspace after confirmation. Export current data first. Legacy password hashes are not migrated: create a Supabase account and import your habits/tasks/notes/schedule/focus data into that account. Demo data can also be exported and imported into a connected account.

## Product scope

- Today dashboard with habits, tasks, focus and schedule.
- Habits: all 60 original suggestions in 6 categories, custom icons/name, historical progress with a swipeable mobile date strip, daily count targets, units, repeat weekdays, edit/delete, current and best streaks.
- Tasks: priority, tags, completion/reopen, filters, sorting, progress, edit/delete, deadlines, subtasks and search.
- Focus: five starting categories, custom categories, category totals, start/stop, editing, session history, durable wall-clock timing, pause/resume, Pomodoro/break mode and midnight splitting.
- Schedule: daily/weekly 24-hour grid, colored categories, selected day budget, current-time indicator, edit/delete, overnight visualization, overlap prevention and click-to-focus.
- Calendar: a Monday-first monthly view of imported ICS events only. Select a date to view event details. Includes month/today navigation, all-day and overnight events, keyboard date navigation, and a compact phone layout. Weekly Schedule activities and Tasks are separate and do not appear here; recurrence appears only when explicitly specified by the ICS file.
- Calendar imports: select **Import .ics** in Calendar, review new/updated/unchanged events, then confirm. Imports keep dates, local times, all-day spans, titles, descriptions, locations and categories. Reimporting matches UID/occurrence identifiers. Daily/weekly/monthly/yearly repeats expand only within the explicitly selected date range (up to three years), including exclusions and individual rescheduling. Maximum 2 MB per file, 2,000 source events and 5,000 stored occurrences. Imported events persist with the existing profile record in local/cloud storage and JSON backups; no database migration is needed. File imports do not auto-sync. An imported event can be opened for details or removed, then restored by reimporting the original file.
- Notes: create/edit/delete, search, date, expand/collapse and clipboard copy.
- Insights: 7/30-day periods, discipline score, habit rate, completed tasks, best weekday, completion chart, actual versus planned time, grouped session history.
- Profile: profile-photo and cover-image upload with 1–4× zoom, drag positioning, keyboard adjustment, reset and a preview before saving. Existing pictures can be adjusted again. Each picture's zoom and position persist with the profile and in backups; older pictures keep their centered framing. Includes account details, joined date, quick statistics and score levels. Account editing and password changes are available in Settings.
- Settings: Thai/English, light/dark/system, nine accent colors plus a custom color picker with HEX input, JSON backup/import and browser notifications. Custom accents persist per account and in backups; the former rainbow option retains its original color as a custom accent when imported.
- Settings → Trash: deleted habits, tasks, notes, schedule activities and focus categories retain their original data until restored or permanently deleted. Search by name/type, see deletion dates and confirm permanent deletion. There is no automatic expiry. Trash is included in JSON backups and uses existing per-account cloud records without a database migration. Restoring overlapping activities or duplicate category names is blocked until the active item is adjusted. Saved focus sessions remain intact when a category is deleted.
- Supabase Auth: account creation, email/password login, session persistence, sign-out and email-verified password recovery.

Original reference: https://github.com/trynabe/trynabe.github.io (reviewed commit 61ac2ee). This is a rebuild preserving the product features rather than embedding the original single HTML file.

## Validation

npm test — date boundaries, weekday streaks, midnight sessions, suspended Pomodoro, legacy migration, malformed backups, and actual/planned analytics.

npm run build — production bundle.

The responsive UI was inspected in a browser at the iPhone 13 breakpoint and desktop sizes. This is browser viewport verification, not a physical iPhone/Safari device test. Notifications and account email flows require a real Supabase project/browser permissions to verify.

## Vercel later

This project uses Vite. Build command: npm run build. Output directory: dist. Set the same VITE_SUPABASE_* variables in Vercel before building, then add the deployed origin to Supabase Auth URLs. vercel.json includes SPA rewrites. Deployment is intentionally deferred.

For an iPhone, open the deployed HTTPS URL in Safari. The current loopback preview URL works on this computer only. User data entered in demo mode is local to each browser; use Supabase to share data between your phone and computer.

### Mobile navigation
On phones, choose and order 1–5 of the eight workspace pages in Settings → Mobile bottom navigation. The bar displays the first three shortcuts, filling any gaps with default pages, plus a contextual Add button and More. More opens a column of icon buttons centered above its trigger for pages absent from those three shortcuts. Buttons bounce into view in sequence and shrink back down in reverse order when closed; reduced motion skips both animations. Selecting a page, tapping More again or tapping outside closes the menu. Escape also closes it, and arrow keys move between menu items. Reopening during the closing animation cancels dismissal. Preferences are stored per account and included in backups. Desktop keeps its sidebar.
