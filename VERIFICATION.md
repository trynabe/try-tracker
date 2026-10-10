# Verification — 2026-10-10

## Mobile date strip — 2026-10-11

- Mobile uses native horizontal scrolling with snapping, touch panning and optional mouse dragging. Seven dates remain visible. Browsing leaves the selected date unchanged until a date is tapped, and dragging suppresses accidental selection. Arrows browse a week; Today recenters the selected day even when Today was already selected. Future dates remain disabled.
- Loads another 28 dates when browsing near either edge, compensating for prepended width so visible dates stay in place. Verified a prepend from September to August and an append from September to October, along with date selection, keyboard navigation, the date input reflecting selection and Today returning to the current date. No habit progress or preferences were edited.
- Responsive Chromium checks at 320px, 390px and 430px: seven visible dates, selected day retained and no document overflow. At 900px, desktop retains the seven-day picker. Mouse dragging and horizontal wheel input were verified; physical phone gestures remain untested. Screenshot: outputs/mobile-date-scroll.png.
- Automated suite: 42 tests passing, including future limits, leap days and year boundaries. Production build passed with the existing large chunk warning. Changes remain local; no commit, push or deployment.

## Floating More menu

- 2026-10-11: removed visible labels from the overflow buttons, retaining translated accessible names and hover titles. Buttons and icons match the nav at 48 × 48px and 23 × 23px. The menu is anchored to the More button, and all overflow buttons share its horizontal center, including while scaling during animations. At 320px, 390px, 430px and 700px, the measured center difference was 0px with no horizontal overflow. The gap above the nav remains 12px; short landscape screens scroll the menu. Navigation to Notes and the reverse closing animation still work. Screenshot: outputs/mobile-more-aligned.png. Local build passed; no push or deployment.
- Closing now reverses the bounce and stagger order: buttons remain mounted while shrinking back down, then disappear after the last animation completes. Closing buttons are inert and hidden from assistive technology; the backdrop fades away. A cleanup timeout handles interrupted animations, and rapid reopening cancels pending dismissal. Reduced motion and desktop changes close immediately. Browser verification covered the closing animation, final removal, reverse delays and reopening during dismissal. Animation preview: outputs/mobile-more-reverse.gif.
- More now opens a right-aligned column above the mobile navigation. It contains only pages absent from the three displayed shortcuts, including default filler shortcuts. The closest button appears first, followed by a staggered upward bounce. Reduced motion disables animations.
- Navigation closes the menu; tapping More again, tapping outside and Escape also dismiss it. Arrow keys move focus, Escape restores focus to More, and changing to the desktop breakpoint closes the menu. No stored user data or navigation preferences were changed during verification.
- Browser checks at 320 × 568 and 390 × 844: all four overflow pages fit above the bar without horizontal overflow. At 700 × 320, the menu scrolls within the available height. At 900 × 700, the mobile nav and popup are hidden. Verified navigation to Notes, repeated toggling, outside dismissal and keyboard navigation. Screenshot: outputs/mobile-more-bounce.png.
- Automated suite: 40 tests passing, including reordered shortcuts and default fillers. Production build passed with the existing large chunk warning. All changes remain local; no commit, push or deployment.

## Mobile navigation settings overflow

- Reproduced intrinsic grid sizing pushing the right-hand labels beyond the grid's right edge. Constrained both columns with minmax(0,1fr), allowed label text to shrink, and kept icons and ordinal badges fixed.
- Mobile rows use compact gaps and padding. Screens up to 360px use one column; wider mobile screens retain two columns. At 320px, 390px and 430px, all labels fit inside the grid and document width has no horizontal overflow. Menu names displayed on one line at 390px after the final spacing adjustment. Screenshot: outputs/mobile-menu-overflow-fixed.png.
- Local UI layout changes only; no push or deployment.

## Accent palette — 9 presets and custom color

- 37 automated tests pass, including all nine presets, custom color backup round-trip, invalid values, legacy rainbow migration and readable text contrast.
- Local demo browser: verified 10 choices in two rows, invalid HEX disables Save, custom #14b8a6 saves and survives reload, and the picker retains that value. Canceled a subsequent draft and restored the original Blue preset after testing. Browser warning/error logs were empty. Screenshot: outputs/accent-nine-custom.png.
- Production build passes with the existing chunk-size warning. Live Supabase writes and physical mobile color pickers remain untested. No commit, push or deployment was performed.

## Trash in Settings — local changes only

- Automated suite: 33 tests passing. Production build passing, with the existing large JavaScript chunk warning.
- Regression coverage: habit history/IDs/revisions survive trash and restore; backup round-trip retains deleted records; legacy backups remain active; deleted records leave analytics; permanent deletion only accepts trashed records; overnight schedule conflicts and duplicate active category names block restoration.
- Local demo browser: moved the existing note to trash, verified it disappeared from Notes, inspected Settings → Trash and its deletion date, opened and canceled permanent-deletion confirmation, restored the note, and verified its original text and date after reload. The note was restored at the end of testing; no existing records were permanently deleted.
- Inspected desktop layout and mobile viewport 390 × 844 (375 CSS px content width after scrollbar). Search and restore worked on mobile; document scroll width equaled client width. Browser warning/error logs were empty. Screenshots: outputs/trash-settings.png and outputs/trash-settings-mobile.png.
- Live Supabase writes, cross-device revision conflicts and physical iPhone Safari were not tested. The existing database schema is unchanged. No commit, push or deployment was performed.

Mobile scroll endpoint: production build passing.

- Mobile content clearance now uses the same 62px navigation height and 14px + safe-area bottom offset as the fixed nav, plus the shared 12px row spacing. Removed the former unconditional 156px bottom padding. Extra clearance is retained only while the floating focus timer is present. Set mobile root overscroll-behavior-y to none; physical Safari bounce behavior remains untested (reference: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior).
- Replaced the backup file input's visually-hidden class with the hidden attribute. Its generic 48px input minimum height previously contributed scroll overflow even though the control was clipped. The input now has display:none and zero height; its ref, accepted formats, import button click handler, and import change handler remain unchanged.
- Chromium at 390x844: measured the Today page after scrolling to the actual bottom. The gap from the final card to the nav reduced from 128.3px to 12.3px. Width checks at 320px, 390px, and 430px stayed within 1px of the 12px target (layout rounding), with no horizontal overflow.
- Inspected the bottom layout of Habits, Tasks, Focus, Schedule, Insights, and Settings at 390px: approximately 12px clearance and zero file-input height. The short Notes page has no scrollable overflow. Desktop at 1280px retained 50px content padding, hidden mobile nav, and auto root overscroll behavior. Browser warning/error logs were empty; no records or preferences were edited.
- Screenshot: outputs/mobile-scroll-end-fixed.png. Physical iPhone Safari and safe-area geometry remain untested. The build retains the existing large JavaScript chunk warning.

## Earlier settings and shared native date fields — 2026-10-10

Settings birth date and shared native date fields: production build passing.

- Extracted the padded wrapper into DateInput and applied it to the birth date, task due date, and habit history date. All inputs remain native type=date controls; labels, values, handlers, autocomplete, names, and date constraints are retained. Padding and the border belong to the wrapper, while the native input has zero padding and stays within the available width and height.
- Chromium checks at 320px, 390px (iPhone 13 dimensions), 430px, and 1280px confirmed equal birth-date and gender widths, matching top edges, and matching heights (50px mobile / 48px desktop). Checked blank and populated birth dates, valid keyboard input, the minimum/maximum validity constraints, and Cancel restoring the empty draft. No account details or passwords were saved.
- English settings at 320px exposed a pre-existing overflow in the bottom-tab selection grid. Those options now use one column below 361px. The final English layout has no document overflow at 320px or 390px.
- Task due-date fields stayed inside their wrappers at 320px, 390px, and 1280px. Habit history date and Today remained 48px tall on the same row without overlap at those sizes. Browser warning/error logs were empty. QA language was restored; habit/task records were untouched.
- Screenshot: outputs/iphone-settings-date-fixed.png. Physical iPhone Safari remains untested. The build retains the existing large JavaScript chunk warning.

## Earlier habit history date sizing — 2026-10-10

iOS habit date field sizing: production build passing.

- Moved the historical date field's border and padding to a fixed 48px wrapper. The native date input retains its type, maximum date, label, and change handler, with zero padding/border and a constrained 46px inner height. Added WebKit value sizing and moved the focus outline to the wrapper. Today remains 48px high and preserves the right-edge desktop position.
- This targets the padded native-control sizing issue described in WebKit report https://bugs.webkit.org/show_bug.cgi?id=301648; the screenshot is consistent with it, but the exact Safari version and cause on the user's phone were not confirmed.
- Chromium responsive checks at 320px, 390px (844px height), 430px, and 1280px measured both outer controls at 48px with matching top edges. Mobile controls maintained a 10px gap; the inner native input stayed inside its wrapper with zero padding and 16px text. Checked English at 320px and 390px with the same results; no horizontal document overflow occurred.
- Verified changing the native date with keyboard input, the selected strip/heading updating to the previous day, and Today restoring the current date. Future dates remain disabled. Browser warning/error logs were empty. Screenshot: outputs/iphone-habit-date-fixed.png. QA language was restored and no habit/task records were changed. Physical iPhone Safari remains untested; build retains the existing large JavaScript chunk warning.

## Earlier task actions on the same row — 2026-10-10

Task actions on the same row: production build passing.

- Mobile Tasks and Today now retain three columns for completion, title/metadata, and edit/delete actions. Removed the mobile action placement below the title so all three groups share the same vertical center. Subtasks remain in a separate lower row; desktop placement is unchanged.
- Checked both pages at 320px, 390px, and 1280px. Every action group occupies grid row 1, vertical centers differ by less than 0.01px, and neither titles nor documents overflow horizontally. The title area does not overlap actions, actions remain inside each row, and subtasks remain below the header. Mobile action buttons retain their 40px dimensions.
- Browser warning/error logs were empty. Screenshot: outputs/task-actions-same-row.png. No records were changed. Physical iPhone Safari remains untested; build retains the existing large JavaScript chunk warning.

## Earlier task header alignment — 2026-10-10

Aligned task rows on Today and Tasks: production build and 26 automated tests passing.

- Both pages now use the same grid alignment: completion controls center on the title/metadata block, and edit/delete actions align to the right edge. Moved task subtasks into their own grid row so their height cannot shift the completion control. Mobile actions retain their lower row with a 12px row gap; desktop actions remain beside the title.
- Checked Today and Tasks at 320px, 390px, and 1280px. Completion controls and title/metadata centers differed by less than 0.01px; horizontal gaps matched between pages (10px mobile, 12px desktop), and actions aligned to their row's right edge. No document horizontal overflow occurred. The two existing subtasks retained their completion states and appeared below the task header; opened and canceled an edit form without changing records.
- Browser warning/error logs were empty. Screenshots: outputs/today-tasks-aligned.png and outputs/task-list-aligned.png. Physical iPhone Safari remains untested; build retains the existing large JavaScript chunk warning.

## Earlier Notes search spacing — 2026-10-10

Notes search icon spacing: production build passing.

- Replaced absolute icon positioning in the shared search field with a flex layout. The icon and input now have a 10px gap, with zero inner input side padding so existing theme styles cannot place text under the icon. Added a shared focus outline. Mobile fields are 48px high with 16px text.
- Checked Notes at 320px, 390px, and 1280px: measured a 10px icon/input gap, vertically centered icon, and no horizontal document overflow. Verified a matching title query, an unmatched query with the empty state, and clearing the query to restore notes. Checked Tasks at 320px with a query and its Clear action: the icon gap remained 10px, the 44px Clear target remained visible, and all rows returned when cleared.
- Browser warning/error logs were empty. Screenshot: outputs/notes-search-spacing.png. No records were changed. Changes remain local; no push or deployment. Physical iPhone Safari remains untested; build retains the existing large JavaScript chunk warning.

## Earlier rightmost Settings button — 2026-10-10

Rightmost header Settings button: production build passing.

- Removed the Settings / mobile bottom menu shortcut from the More sheet. Added a labeled gear button after Profile as the rightmost header action, with the same size and rounded shape as Profile. The gear highlights the active Settings page and exposes `aria-current="page"`.
- Checked 320px, 390px, and 1280px: the gear is the last header action, positioned after Profile with the same dimensions and vertical center; no document horizontal overflow occurred. Verified that the gear opens Settings and Profile still opens Profile. The More sheet retains all seven page shortcuts and no longer shows its Settings footer button.
- Browser warning/error logs were empty. Screenshot: outputs/settings-gear-right.png. No records or preferences were changed. Changes remain local; no push or deployment. Build retains the existing large JavaScript chunk warning.

## Earlier single-row focus categories — 2026-10-10

Single-row focus categories: production build passing.

- Focus category rows now always use three columns for the icon, name/time, and action group. Removed the narrow-container rule that moved actions below the name. Long titles truncate with an ellipsis and retain the full name in their title and edit form. Active rows retain the same horizontal padding as inactive rows, preventing the controls from squeezing the timer text.
- Checked 320px, 390px, 600px, 850px, and 1280px: icons, name/time blocks, and action groups shared the same vertical center; all actions remained inside each row; elapsed time and the document did not overflow horizontally. Mobile action buttons remain 44px square; the narrowest layout removes only the space between their touch targets.
- Opened and canceled a category edit form without changing records. Browser warning/error logs were empty. Screenshot: outputs/focus-categories-single-row.png. Changes remain local; no push or deployment. Physical iPhone Safari remains untested; build retains the existing large JavaScript chunk warning.

## Earlier shared row spacing — 2026-10-10

Shared desktop/mobile row spacing: production build passing.

- Added a shared `--row-space: 12px` stylesheet loaded after the existing responsive styles. Page sections, stacked panels, card-grid rows, repeated list rows, filters, form rows, and sidebar navigation now share this vertical spacing. Removed conflicting margins where they would double the gap. Existing horizontal column spacing, heatmap cell spacing, and control sizes are preserved.
- Checked Today, Habits, Tasks, Focus, Schedule, Notes, Insights, and Settings at 320px, 390px, and 1280px. Direct page-section gaps measured 12px and applicable grids computed a 12px row gap; no document horizontal overflow occurred. Also checked Profile at 390px and 1280px and visually checked the desktop focus timer and category layout.
- Opened and canceled all five distinct add editors (habit, task, focus category, activity, and note) at 320px and 1280px. Form-section gaps measured 12px, no modal body overflow occurred, and Cancel/Save remained equal-width and 48px high. Profile settings fieldset gaps measured 12px at 390px. Login card rows measured 12px at 320px and 1280px without horizontal overflow; no credentials were entered or submitted.
- Browser warning/error logs were empty. Screenshots: outputs/spacing-12px-desktop.png and outputs/spacing-12px-mobile.png. QA used the separate localhost demo origin and preserved records; the user preview remains on 127.0.0.1. Changes remain local; no push or deployment. Physical iPhone Safari remains untested; build retains the existing large JavaScript chunk warning.

## Earlier mobile task filter spacing — 2026-10-10

Mobile task filter spacing: production build passing.

- Unified the four vertical gaps from the summary card through search, status filters, quick filters, and the task list using one 12px spacing variable. The gap between the two quick filters follows the same value. Increased the space between status labels and counts to 6px and adjusted their inner padding.
- Quick filter buttons now match the 48px search field height. Checked 320px, 390px, and 600px: all four vertical gaps measured 12px, both quick filters measured 48px high, and neither button text nor the document overflowed horizontally.
- Verified the selected High priority filter and captured outputs/task-filters-spacing.png. Browser warning/error logs were empty. No task records were changed. Changes remain local; no push or deployment. Build retains the existing large JavaScript chunk warning.

## Earlier mobile task filter redesign — 2026-10-10

Mobile task filter redesign: production build passing.

- Replaced the five wrapping task pills on mobile with a search field above three equal status segments and two equal quick filters. Status buttons are 56px high; quick filters are 44px high; the search field is 48px high. Counts reflect the current search while preserving the existing exclusive filter behavior.
- Search uses a flex layout to prevent the icon overlapping the text, a 16px mobile font, and a labeled Clear search action. Filter buttons expose their pressed state. Thai and English labels are supported.
- Checked Thai at 320px and 390px and English at 320px: equal button widths within each row, no button text overflow, and no document horizontal overflow. Also checked the desktop layout near 700px and at 1280px; desktop filters remain compact and the search icon is vertically centered.
- Verified all five filters, searching by tag, combining search with Completed, clearing the search, and an unmatched query with zero counts and an empty list. Browser warning/error logs were empty. Screenshot: outputs/task-filters-mobile-redesign.png. No task records were changed; the QA language preference was restored.
- Changes remain local; no push or deployment. Physical iPhone Safari remains untested; build retains the existing large JavaScript chunk warning.

## Earlier equal editor buttons — 2026-10-10

Equal Cancel/Save buttons: production build passing.

- Shared modal footers and inline form footers now use two equal-width columns. This applies to all entity add/edit editors and profile forms.
- Opened the add editors from Today, Habits, Tasks, Focus, Notes, and Schedule at 320px. Cancel and Save each measured 122.2 × 48px and stayed visible with no document horizontal overflow. In the task editor, both buttons measured 157 × 48px at 390px and 230 × 48px at 1280px.
- Canceled all editor checks without changing records. Browser warning/error logs were empty. Screenshot: outputs/editor-buttons-equal.png. Changes remain local; no push or deployment. Physical iPhone Safari remains untested; build retains the existing large JavaScript chunk warning.

## Earlier five-button contextual mobile navigation — 2026-10-10

Five equal mobile navigation buttons with contextual Add: production build passing; 26 automated tests passing.

- Mobile navigation always has five buttons: three ordered shortcuts, a central Add action, and More. All five buttons measure 48 × 48px with a 14px corner radius. The central action sits on the same row without a circular shape, raised position, or halo.
- The central Add action uses the current page's existing editor: Tasks on Today/Tasks, Habits on Habits, focus categories on Focus, notes on Notes, and activities on Schedule. Schedule carries over the selected weekday. Pages without a create action keep Add disabled; verified this on Insights. Removed the duplicate mobile heading add actions; desktop add actions remain available.
- Selected shortcut preferences remain in their original order; the first three appear in the bar, filled with default pages if fewer than three are selected. More still opens all pages. Updated the Thai/English navigation settings description.
- Checked 320px, 390px, and 600px: exactly five equal 48px buttons with a 14px radius, centered Add, and no document horizontal overflow. At 1280px, the mobile bar remained hidden.
- Opened and canceled the correct editor from all six pages with create actions. Selecting Tuesday on Schedule and then Add activity set the form weekday to Tuesday (2). Browser warning/error logs were empty. No user records were changed for verification.
- Screenshot: outputs/mobile-nav-contextual.png. Changes remain local; no push or deployment. Physical iPhone Safari remains untested; build retains the existing large JavaScript chunk warning.

## Earlier mobile navigation with central Add task — 2026-10-10

Mobile navigation with central Add task: production build passing; 26 automated tests passing.

- Replaced the mobile tab bar with a symmetric layout and a raised 56px Add task button at its center. It opens the existing task editor from any page. Today and Tasks use the central action; other pages retain their own entity add action beside the heading.
- Preserved the selected shortcut order and the 1–5-page preferences. Narrow bars show the first three shortcuts, with all seven pages and Settings available through More. Wider bars display all selected shortcuts. Updated the Thai/English settings description to explain this behavior.
- Checked 320px, 390px, and 600px: the Add button measured 56 × 56px and was centered exactly; navigation touch targets were at least 46 × 48px with no document horizontal overflow. At 1280px, the mobile bar remained hidden and the desktop add action remained visible.
- Verified navigation to Habits and Tasks, opening/canceling Add task from Habits and Schedule, and opening Schedule through More. More displayed all seven pages and marked itself active for an overflow page. Browser warning/error logs were empty. No user records were changed for verification.
- Screenshot: outputs/mobile-nav-center-task.png. Changes remain local; no push or deployment. Physical iPhone Safari remains untested; build retains the existing large JavaScript chunk warning.

## Earlier habit date toolbar — 2026-10-10

Habit date toolbar: production build passing.

- Moved Today to the right edge of the Habits date toolbar on desktop. The date input remains 320px wide; both controls are 48px high.
- Checked alignment at 850px and 1280px, and retained the mobile layout at 390px. No document horizontal overflow occurred; browser warning/error logs were empty. Screenshot: outputs/habit-date-button-aligned.png. Changes remain local.
- Mobile Today and date controls now both measure 48px high and align on the same row at 320px and 390px. No document horizontal overflow occurred. Screenshot: outputs/habit-date-button-mobile.png.

## Earlier Today history and desktop layout — 2026-10-10

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
