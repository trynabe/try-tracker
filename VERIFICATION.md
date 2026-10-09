# Verification — 2026-10-10

HabitKit-inspired redesign: 25 automated tests passing; production build passing.

- Updated the shared visual system across Today, Habits, Tasks, Focus, Schedule, Notes, Insights, Profile, Settings, Auth, and editor dialogs. Existing account, cloud storage, backup, task, schedule, note, and timer handlers remain connected.
- Habit cards show 20 Monday-first weeks of actual logs, partial completion, inactive days, current/best streaks, and daily or weekly cadence. Selecting a tile opens that historical date. Card/list switching retains the existing count, reset, edit, and delete controls.
- Habit colors and optional descriptions persist through edits and backups. Legacy emoji and normalized icon IDs use the same fallback colors.
- Editor Save/Cancel controls remain visible outside the scrollable form body. A saved activity retained its weekday, 09:00–10:00 time, and chosen green tag. Start/end/day fields were all 50px high at 320px width, including a reduced 500px viewport height.
- In an isolated localhost demo, verified habit creation, color selection, completion, editing without losing its completed log, historical date selection, card/list switching, and stopwatch start/pause/resume/save. User data on 127.0.0.1 was not used for these mutations.
- All eight workspace pages rendered without document horizontal overflow at 320px and 1280px. Profile rendered at desktop size; mobile layouts and form widths were inspected at 390px. Checked Thai/English and dark/light themes.
- Mobile Focus panels stretch across the available width; category delete controls remain at the right. Schedule retains seven short weekday buttons and seven tag colors plus a circular custom-color control.
- Mobile add buttons now sit beside the page title so they do not cover history tiles or row controls. Verified that the moved habit button opens the complete editor.
- Browser warning/error logs were empty after the final edit/save check.

Limitations: physical iPhone Safari, live Supabase/Auth, notification permission delivery, and a full Pomodoro/break cycle were not tested in this redesign run. Build retains the existing large JavaScript chunk warning. No push or deployment was performed.

## Previous verification — 2026-10-05

Automated checks: 20 tests passing; production build passing.

Fixed and reproduced:
- Duplicate subtask names reused the same ID after editing, so checking one checked both. Each occurrence now keeps a distinct ID and its completion state. Verified in the browser and covered by two regression tests.
- Resuming a timer could display one second less until the next clock tick. Elapsed time now clamps the sampled running interval to zero; covered by a regression test.

Browser verification in local demo:
- All eight main menu pages rendered at 1280px desktop and 390 x 844 mobile; no document horizontal overflow detected.
- Task creation, editing, independent subtasks, completion, and confirmed deletion.
- Count habit stayed in position after partial increment, then moved to the bottom when complete.
- Note creation, search, edit, and persistence after reload.
- Overnight schedule split between Monday and Tuesday; one-hour budget on each day. A conflicting Tuesday interval was rejected.
- Stopwatch start, pause, persisted paused state after reload, resume, and save.
- Profile mobile layout, canceling photo dialog, profile-to-settings edit-account link, and mobile More navigation.
- At 320px, the habit weekday buttons stayed on one row and the last Habit Ideas category scrolled fully into view.
- Mobile add controls are 52px circles with a 16px gap above the bottom navigation on all six applicable pages.
- JSON backup downloaded and imported successfully. Only this run's QA-1005 records were removed with user authorization. Exported final data matched the normalized retained backup exactly; no QA-1005 records remain.
- Fresh verification tab had no console errors or warnings on the dashboard.

Limitations:
- Supabase URL and key are unset locally. Live Auth, email delivery, password changes, RLS isolation, and cross-device cloud sync remain unverified.
- Mobile checks used a browser viewport; physical mobile Safari/Chrome remains unverified.
- Deployed hosting, background notifications, and a full timed Pomodoro/break cycle were not tested in this browser run. The duration and midnight-splitting logic is covered by automated tests.
