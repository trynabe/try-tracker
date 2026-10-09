# Verification — 2026-10-10

Today history and desktop layout: production build passing.

- Restored habit heatmaps, current/best streaks, and edit/delete controls on Today. Selecting a history tile opens that date on Habits.
- Desktop Today places habit cards side by side in a full-width section, followed by equal-width Tasks, Notes, and Schedule panels. Cards stretch to the same height within each row; secondary panels use content-sized rows rather than inheriting the old equal-row layout. Narrow layouts use two columns or a single column according to available space.
- Checked Today at 1000px, 1280px, and 1600px, plus 320px and 390px. No document horizontal overflow occurred. On desktop, secondary panels aligned with equal widths and heights; mobile habit cards used the full section width. Also checked the user's two-card layout at 1440px with empty Tasks and Schedule panels: all three secondary panels measured 352 × 280px.
- Verified opening/canceling a habit editor, opening/canceling a note editor, and selecting the October 6 book history tile from Today. Historical selection opened Habits at October 6. Fresh warning/error logs were empty. No user records were changed for verification.
- Screenshot: outputs/today-desktop-aligned.png. Changes remain local; no push or deployment. Physical iPhone Safari remains untested; build retains the existing large JavaScript chunk warning.

## Earlier Habits history restoration — 2026-10-10

Habit history returned to Habits: production build passing; 26 automated tests passing.

- Moved the history cards, streak chips, date strip, date picker, and historical recording controls back to Habits. Removed the View history in Insights shortcut. All habits remain available for editing, including habits not scheduled for the selected date; recording controls respect the habit schedule and creation date in both card and list views.
- Insights retains completed-task and focus-session history with two tabs. Habit history cards no longer appear there.
- Verified tile selection for October 6, return to Today, card/list switching, edit/delete controls, and both remaining Insights history tabs. Checked Habits and Insights at 320px and Habits at 1280px without document horizontal overflow. Fresh browser warning/error logs were empty. No user records were changed for verification.
- Screenshot: outputs/habits-history-restored.png. Changes remain local; no push or deployment.

## Earlier Focus category fix and consolidated history — 2026-10-10

Focus category layout fix and consolidated usage history: 26 automated tests passing; production build passing.

- Focus category rows reserve space for the name. In narrow category panels, Start/Edit/Delete move to a second row aligned to the right; wider panels retain one row. The layout responds to the panel width, including narrow desktop columns. Mobile buttons remain 44 × 44px.
- Checked Thai category names at 320px, 390px, 851px, 1102px, 1280px, and 1600px. Names stayed readable and delete buttons stayed at the right. A long Thai category name wrapped onto two normal lines at 320px; its original name was restored after testing.
- Moved habit heatmaps, current/best streaks, historical date selection, completed-task history, and saved focus history into the Habits/Tasks/Focus history tabs on Insights. Today and Habits show current-day records; Focus shows the active timer and categories. Habit card/list selection and edit/delete/count/reset controls remain available.
- Historical habit editing updates the selected date while preserving today's value. Verified a partial increment on October 6, its heatmap state, reset back to the original value, and today's unchanged October 10 value. Future days, dates before creation, and unscheduled days cannot be changed through the history cards.
- Completed-task history uses completion dates, newest first, with a created-date fallback for legacy completed tasks. A regression test covers 7/30-day filtering, older-created tasks completed recently, future dates, and preserving the source task order.
- Verified all three history tabs at 320px and 1280px, 7/30-day focus history, the Habits-to-Insights shortcut, and Thai/English labels. No document horizontal overflow occurred. A fresh browser document loaded Insights and retained the restored demo values with no warning/error logs.
- Browser mutations used the separate localhost demo. User records on 127.0.0.1 were not modified for testing. Screenshots are saved in outputs/focus-layout-mobile-fixed.png and outputs/insights-history.png.

Limitations: physical iPhone Safari and live cloud synchronization were not tested in this fix. Build retains the existing large JavaScript chunk warning. No push or deployment was performed.

## Earlier HabitKit-inspired redesign — 2026-10-10

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
