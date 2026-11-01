# Try-Tracker 2.6 — Preview development history

The preview was adopted as the main desktop and mobile interface in **Try-Tracker 2.8.0** on 1 November 2026. Open `/` for the new UI; `/preview/2.6` remains an alias and `/classic` retains the original presentation. All paths share the same workspace. See [2.8 release notes](RELEASE_2_8.md).

The entries below are chronological development and verification records from the preview phase. Earlier descriptions of sizes, mobile navigation, preview-only routing and package versions describe those earlier revisions, rather than the final release.

Run `npm run dev -- --port 5187 --strictPort` and open `http://127.0.0.1:5187/preview/2.6`.

## Presentation and compatibility

- Opt-in desktop presentation above 700 CSS pixels: satin surfaces, thin borders, static highlights, a 68px floating icon dock with 8px horizontal padding, compact summary cards and consistent forms. The narrower rail retains the existing button sizes.
- The dock is vertically centered and sized to its eight workspace pages. It retains page order and groups the first four pages separately from the four planning/history pages. Profile and settings sit side by side at the top right, in that order. Task counts remain on their icon; the Insights tooltip includes the discipline score and level. Names appear on hover/focus; Escape dismisses the custom tooltip. A short window uses a compact dock, with scrolling at very small heights.
- A floating 72px header spans the content column. It combines a two-line brand/page identity, an accent-tinted Preview badge, a save-status dot and one inset group for language, profile and settings. Surfaces use static gradients and subtle shadows.
- Shared 24px tokens control the dock's left edge, the header's top/right edges, the dock-to-content gutter and the header-to-content gap. Header padding is symmetric; dock padding follows the control size so its first/last buttons have the same inset as the side buttons. Main content keeps its 1600px maximum width.
- Light/dark/system themes and existing accent preferences are preserved. Accent text receives a contrast adjustment; the stored accent and button fill retain the user's selected color.
- Desktop Focus reuses existing session history in a keyboard-accessible scroll region. Data, sorting, timer behavior, API calls and persistence remain unchanged.
- Preview and classic URLs use the same workspace and account. Saving in the preview saves real workspace changes. No schema, backup or Supabase changes are required.
- At 700px and below, the existing mobile presentation and navigation are used. Desktop styles are isolated by `data-ui="v26"` and media queries.
- No new runtime dependencies, background imagery, continuous animation or desktop backdrop blur were added. Reduced-motion styles disable transitions.

## Dock revision — 29 October 2026

- Replaced the stretched rail and duplicate score button with a centered dock, an outlined accent-colored brand mark, grouped navigation and a high-contrast current-page button. The approved reference refinement enlarges the rail to 80px, primary controls to 48px on taller screens and navigation icons to 22px.
- Checked all ten pages across three viewport sizes at the browser's existing zoom. Measured content widths were 713, 1295 and 1745 CSS pixels. Every dock fit vertically, exactly one current page was marked, and no horizontal overflow was found.
- Tab/Enter navigation, Insights score tooltip and Escape dismissal passed. The dock is absent on mobile and the existing bottom navigation is retained.
- Five additional height checks, from 491 to 818 CSS pixels, confirmed that the enlarged buttons remain inside the dock. Shorter windows adapt the control height.
- `npm run build` and `git diff --check` passed. Assets: 744.64kB JavaScript (218.08kB gzip), 177.50kB CSS (31.24kB gzip). The existing large-chunk warning remains.
- Updated screenshots and layout results are in the local task artifact's `try-tracker-2.6/dock-redesign` folder. The gallery below records the initial design.
- The reference size is shown in `reference-sized.jpg`; `reference-size-checks.json` records its checks.
- Increased navigation spacing from 3px to 10px on taller screens, with 16px between the main groups and 10px between settings/profile. Medium-height windows retain 8px navigation gaps; shorter windows adapt the controls and spacing to keep navigation reachable.
- Rechecked three desktop sizes, three short-window sizes and mobile. No horizontal overflow was found; all ten controls fit without dock scrolling at measured heights of 491px and above. At 454px, keyboard navigation scrolls the profile control fully into view. Build and diff checks passed. `spaced-dock.jpg` and `spacing-checks.json` record this spacing revision.
- All eleven dock buttons now share the brand button's square proportions, rounded corners, tinted surface and accent outline. The current page retains its high-contrast fill. A shared control-size variable keeps the logo, navigation, settings and profile square and equal-sized at every desktop height; the profile icon no longer has a separate circular frame. Seven viewport checks confirmed consistent dimensions/corners, no horizontal overflow and the existing mobile navigation. `square-dock.jpg` and `square-button-checks.json` show this refinement; production build and diff checks passed.
- Removed the redundant arrow/logo shortcut and its unused styles. The dock now starts with Today, contains ten page controls and sizes itself without an empty top slot. Verified in the running preview; production build and diff checks passed. Current screenshot: `no-logo-dock.jpg`.
- Moved profile/settings from the dock to the existing header controls, with 40px rounded-square buttons and current-page indicators. The dock now contains only the eight workspace pages. Profile opens by click; Tab moves from profile to settings, and Enter opens settings. Six viewport checks (including the 701px desktop boundary, a short window and mobile) confirmed the header controls stay aligned without overlap or horizontal overflow. Current screenshot/results: `header-account-controls.jpg` and `header-account-checks.json`. Production build and diff checks passed.

## Header exploration — 29 October 2026

- Added `DesktopTopbar` for the desktop preview branch. It reuses the existing language preference, navigation, save status and profile-image crop. Classic and mobile retain their existing header branch.
- Checked all ten page labels at two desktop widths (1295 and 701 CSS pixels), with no header overlap, clipped controls or horizontal overflow. Additional checks covered 1366×768, 1920×1080, a short window, mobile, light theme and English. The user's Thai language and system theme were restored after checking.
- Profile click, Tab from profile to settings, Enter to open settings, and the header's language toggle passed. Current-page indicators follow navigation.
- `npm test`: 87 passed. Production build and diff checks passed. Assets: 746.15kB JavaScript (218.35kB gzip), 179.18kB CSS (31.54kB gzip); the existing large-chunk warning remains.
- Current screenshots and measurements are in the local `try-tracker-2.6/topbar-redesign` artifact folder.
- Spacing refinement: five desktop/short-window measurements confirmed 24px outer edges and gutters (within subpixel rounding), matching dock insets and no overflow. All ten pages passed at the 701px desktop boundary; mobile retains its original layout. Build and diff checks passed. Latest proof: `even-spacing.jpg` and `spacing-verification.json`.

## Focus workspace — 30 October 2026

- The focus-time card now has a Choose focus category button directly below the clock. It opens a scrollable category dialog, with one-click start, today's time per category, edit/delete controls and an Add category action. The timer content is capped at 640px and centered inside the card; history stays below.
- Removed explicit grid-item positions that previously created an unintended second column at narrow desktop widths. Replaced the large timer ring with a static rectangular timer surface, tabular clock digits and aligned pause/stop controls.
- Classic and mobile use fragments instead of the new preview containers, retaining their existing DOM layout and timer presentation. Desktop category selection starts the chosen category; selecting the current category closes the dialog while preserving its running/paused state. Timer, session storage and sync logic are unchanged.
- The category dialog fits 1366×768, 1440×900, 1920×1080, 786×700 and an 800×480 short window, with its footer reachable and no horizontal overflow. At 390×844, the dialog closes and the original mobile category panel remains; the classic URL also retains its separate category panel. Thai/dark and English/light were checked, and the main preview retains the user's Thai/system preferences.
- Isolated demo checks covered keyboard start, pause at 21 seconds, page navigation while paused, resume, stop/save and Pomodoro countdown display. Test writes used localhost port 5191 with Supabase disabled; the user's origin at 5187 was not used for timer writes. Automatic break completion was not re-tested.
- Picker checks covered keyboard opening/selection, Tab/Shift+Tab trapping, Escape and focus restoration, start/save, and reselecting a paused category without resetting its 25-second clock. Add/edit/delete dialog handoffs were checked and cancelled, with exactly one dialog remaining at each step.
- `npm test`: 87 passed. Production build and diff checks passed; the existing large-chunk warning remains. Latest screenshots and measurements are in the task's `try-tracker-2.6/focus-picker` artifact folder. `focus-redesign` records the earlier separate and combined category layouts.

## Habit date selector — 30 October 2026

- Mobile scrolling refinement: date targets are at least 48px wide, the strip uses native horizontal scrolling with proximity snapping, and touch-capable devices keep the scrollable strip above the 700px breakpoint (including phone landscape). Resizing recenters the selected date without changing it. Desktop mouse layouts retain seven fixed dates.
- Checked responsive widths 320, 390 and 700px plus 1440px desktop. Dragging browses dates without selecting one; a subsequent tap selects and recenters it. Week arrows load earlier dates across month boundaries; keyboard arrows update selection/focus and Today restores the current date. No habit records were changed. Native touch gestures on physical iOS/Android hardware were not available in this browser session; the verified drag path uses a mouse, with browser-native touch scrolling enabled by CSS. Proof is in `try-tracker-2.6/mobile-date-scroll`.
- Combined the month/year, visible date range, seven-day selector, native date input and Today action into one preview-only card. The latest refinement adds a calendar icon and an inset mini-calendar capped at 560px, centered on wide desktops; narrower desktops place it below the heading and date controls.
- The selected date uses a 40×36px square around its number, the user's accent fill, a contrasting numeral and a static inset highlight/shadow. Its weekday uses the main text color. Week arrows share the inset calendar surface. Future dates remain disabled, with the existing week navigation, date selection and mobile scrolling behavior retained.
- Checked 1366×768, 1440×900, 1920×1080, a narrow desktop and 390×844 at the browser's existing zoom. No horizontal page overflow was found; desktop shows seven dates and one selected date, while mobile retains its original scrolling selector.
- Mouse day selection, previous/next week, keyboard activation, native date input keyboard changes across a month boundary and Today passed. Thai/system theme and English/light theme were checked; Thai/system preferences were restored. No habit records were changed.
- `npm test`: 87 passed. Production build and diff checks passed; the existing large JavaScript chunk warning remains. Latest screenshots and measurements are in `try-tracker-2.6/mini-calendar` in the local task artifacts; `date-picker-redesign` records the earlier exploration.
- The subsequent selected-tile refinement changes only CSS for the selected date and weekday. Keyboard Enter/focus, Today, light and system/dark themes passed; the measured card and week-frame positions and dimensions are unchanged. The user's system theme was restored. Its latest proof is in `try-tracker-2.6/date-tile`; production build and diff checks passed.

## Note folder button — 30 October 2026

- Replaced the note editor's native folder select with the existing themed `NotesSelect` button/listbox, using the same control on desktop and mobile. The folder control and pin control align at their bottom edges, and the dropdown fits the remaining modal-body height in short windows.
- Isolated demo checks at port 5191 covered 30 folders, long folder names, create/edit/save with folder and pin changes, keyboard arrows/Home/End/Enter, Escape closing only the dropdown, Tab to the pin checkbox, and outside-click dismissal. Checked 1366×768, 800×480 and 390×844; dropdown content scrolls without horizontal overflow. Test notes were saved only on the isolated origin. Screenshots are in `try-tracker-2.6/note-folder-button`.
- `npm test`: 87 passed. Production build and diff checks passed; the existing large-chunk warning remains.

## Initial preview verification — 29 October 2026

- `npm test`: **87 passed**, including all 85 existing tests and two accent readability tests.
- `npm run build`: **passed**. The existing warning about a JavaScript chunk larger than 500kB remains. Initial preview assets: 744.60kB JavaScript (218.05kB gzip), 177.29kB CSS (31.20kB gzip).
- `git diff --check`: passed.
- Ten pages checked at 1366×768, 1440×900 and 1920×1080, plus widths 701, 900, 1023, 1024, 1279 and 1280. No unexpected horizontal page overflow was found.
- Light theme/English checked across all ten pages at widths 1440, 701 and 1024. Dark theme/Thai, system theme and white/black custom accents were also checked.
- Empty workspace states checked across all ten pages at widths 1440 and 701. Stress data included 120 long task titles, eight habits and 30 long notes, checked at widths 701, 1440 and 1920.
- At 390×844, preview and classic Today screenshots and layout measurements matched exactly. Mobile navigation was exercised across eight workspace pages, profile and settings. The 700px boundary retains mobile UI.
- Mouse/keyboard dock navigation, score shortcut, tooltip Escape, modal focus trapping, modal Escape and focus restoration passed. The compact dock fits a 701×480 viewport.
- Demo-only UI checks covered task create/edit/due date/search/completion/filtering; note creation/pinning; folder creation; calendar event creation; focus start/pause/resume/navigation/stop/save; task trash/restore.

All write tests used an isolated browser origin at port 5190 with Supabase disabled. The temporary test server, instrumentation and test environment file were removed afterward. Real account authentication, notification delivery and cross-device sync were not re-tested for this presentation change.

## Premium page creation buttons — 1 November 2026

- Added a shared preview-only creation button for Today, Habits, Tasks, Focus, Schedule, Calendar and Notes. The 48px action uses an inset icon tile, the selected accent, a fine edge, a static highlight and a soft shadow. Notes uses a quieter secondary Create folder action beside Write note. Existing callbacks and disabled states are preserved.
- Hover, keyboard focus, pressed and reduced-motion states are included. The mobile bottom add action shares the accent treatment and remains 48×48px; desktop-only actions stay hidden on mobile. The classic URL retains its original button markup and appearance.
- Checked all seven pages in Thai/dark at 1366×768 and 390×844, plus Notes at a narrow desktop width of 702px. No horizontal page overflow or clipped button labels was found. Keyboard activation opened the correct creation dialog on every page on desktop and mobile; all dialogs were cancelled without saving records.
- `npm test`: 87 passed. Production build and diff checks passed; the existing large JavaScript chunk warning remains. Screenshots are in `try-tracker-2.6/page-add-buttons` in the local task artifacts. Light theme, English and custom accent variations were not re-tested for this button refinement.

## Premium creation dialogs — 1 November 2026

- Added a shared creation-dialog treatment to tasks, habits, focus categories, weekly schedule activities, calendar events, notes and note folders. Headers use a contextual icon and translated description; controls, focus states, surfaces and footer actions share one style. The presentation is scoped to the 2.6 preview, including mobile. The classic route keeps its original form layout and native priority select.
- Task creation/editing now puts tag and due date on one desktop row, presents priority as a native three-choice radio group and gives subtasks an optional inset section. The existing submission, validation, subtask reconciliation and date controls are retained. No dependencies, API or backup changes were made. Background effects are static; the creation overlay has no blur.
- Checked all seven dialog types in Thai/dark on desktop (1280×720 and a task sample at 1366×768) and at 390×844; English/light was checked for tasks, habits, categories, schedule, calendar and notes. Short-window checks for tasks, calendar and notes at a measured 727×436 kept footers reachable. No horizontal dialog overflow was found. The browser's existing zoom affected some measured desktop viewport sizes.
- Isolated local demo checks on port 5191 covered required task validation, creation/editing with a tag, high priority, a keyboard-selected due date and two subtasks, native radio arrow-key selection, a 30-folder note picker with a long label, dropdown Escape, dialog Escape, Tab wrapping and focus restoration. Only the separate test origin received task/preference writes; the normal 5187 workspace was not used for saved test data.
- Note title/body controls retain matching font sizes (16px on mobile). Long forms scroll inside the dialog while footer actions stay reachable. Screenshots and layout measurements are in `try-tracker-2.6/creation-dialogs` in the local task artifacts. Physical mobile keyboards, real account sync and notification delivery were not re-tested for this presentation change.
- `npm test`: 87 passed. Production build and diff checks passed; the existing large JavaScript chunk warning remains. The temporary QA server and launcher were removed after verification.

## Habit card fit — 1 November 2026

- Removed the Today history chart's 420px width cap so it fills the card's inner width. Desktop preview cards use equal 20px padding, a 16px history/footer gap and month-label columns aligned with the day grid. The existing 20-week history, square cells, colors and actions are preserved; classic and mobile styling are unchanged.
- Checked 1366×768, 900×900 and 390×844: all three cards' charts stay inside their cards, left/right insets match and day cells remain square, with no horizontal page overflow. Production build and diff checks passed. Proof and measurements are in `try-tracker-2.6/habit-card-fit` in the local task artifacts. No habit records were changed.

## Inline desktop habit dates — 1 November 2026

- At viewport widths of 900px and above, the month/range, seven-day selector and date/Today controls share one aligned row. Reduced the header icon, spacing and date-input width so the layout fits smaller desktop windows, bringing the card height to about 107px. Narrower windows retain the existing stacked arrangement, and mobile retains its scrolling date strip.
- Checked 900, 1024, 1366 and 1440px widths: all three groups share a vertical center, all seven dates remain visible and there is no horizontal page overflow. The 899px fallback and 390px mobile strip also fit. Production build and diff checks passed. Proof and measurements are in `try-tracker-2.6/date-inline` in the local task artifacts. Date selection and saved habit data were unchanged.

## Line chart statistics — 1 November 2026

- Added a daily line chart directly below the compact summary cards in the 2.6 preview. Habit completion, completed tasks and focus minutes share one chart with metric switches and the existing 7/30-day range. The previous habit bar chart is replaced in the preview; allocation values retain their labels and totals without bars. The classic route keeps its existing charts.
- Daily values come from the same records as the period summary. Days without scheduled habits remain gaps, completed tasks use completion dates with the existing legacy fallback, and focus values aggregate actual saved seconds. The discipline score remains a period summary because historical score snapshots are not stored. No chart library, records, API or storage format was added.
- Checked Thai/dark on desktop at 1366×900 and mobile at 390×844 and 320×844. Verified all three metrics, both periods, point selection, previous/next day controls, and Arrow/Home/End/Escape keyboard behavior. Corrected focus movement between the plot and day controls so arrows continue from the selected day. No horizontal page or metric-tab overflow was found. Screenshots are in `try-tracker-2.6/insights-line` in the local task artifacts.
- `npm test`: 90 passed, including three daily-series tests covering missing versus zero data, completion-date counting and focus aggregation. Production build and diff checks passed; the existing large JavaScript chunk warning remains. Light/English, physical mobile devices and field performance were not re-tested for this chart change. Saved workspace data and the existing timer were left unchanged.

## Reference-inspired statistics dashboard — 1 November 2026

- Rebuilt the preview statistics layout around the supplied analytics reference: a large cyan/green area-line chart, a violet discipline-score ring, a compact best-day card and three selectable metric cards with their own sparklines. Light mode uses white cards on a pale gray surface; dark mode retains the graphite palette. The classic URL keeps its original summary and charts.
- Curved SVG segments pass through the actual daily observations, with control points bounded by adjacent values to prevent false peaks. Cyan shows the selected period, and dashed green shows the immediately preceding equal-length period on the same scale. Tooltips identify both dates and values. Habit differences use percentage points; missing previous habit data displays a message instead of a fabricated improvement. Score remains a period snapshot.
- Checked all three metrics, both 7/30-day ranges, point selection, previous/next controls, keyboard arrows/Home/End and Escape. Keeping the selected day separate from tooltip visibility prevents the day controls from jumping when focus leaves the plot. The original workspace was used for read-only interaction checks; theme/language and empty-state checks used a temporary component harness without storage or account access.
- Thai/dark checks covered requested desktop viewports 1366×768, 1440×900 and 1920×1080, narrow widths 701 and 1024, and mobile widths 320 and 390. English/light and all three empty states were checked in the isolated harness. No horizontal page, metric-card or selector overflow was found. Browser zoom affected the measured 701px sample (702px). Screenshots and layout measurements are in `try-tracker-2.6/insights-redesign` in the local task artifacts.
- `npm test`: 90 passed. Production build and diff checks passed; the existing large JavaScript chunk warning remains. No dependencies, saved records, API or backup format were changed. Physical-device performance and real account sync were not re-tested for this presentation update. The temporary harness was removed after verification.

## Creation footer without Cancel — 1 November 2026

- Removed the Cancel action from the preview's shared task, habit, focus-category and schedule-activity editor footers, including their edit forms. Calendar event creation/editing follows the same pattern. Footers retain their existing Save/Add submit action, while header Close, Escape and backdrop dismissal remain available. Other dialogs and the classic route retain their actions.
- Checked all five creation forms at 1366×768 and 390×844: no Cancel action is rendered, the submit button remains, and Escape closes each dialog. Header Close and task-dialog keyboard Tab wrapping also passed. A classic task dialog still displays Cancel and Save. No records were saved during verification. Screenshots and checks are in `try-tracker-2.6/no-cancel` in the local task artifacts.
- Production build and diff checks passed. No new tests were added for this presentation-only change; the existing large JavaScript chunk warning remains.

## Seven-day overview on Today — 1 November 2026

- Replaced the preview Today's four summary cards with the existing Performance overview chart. A shared weekly wrapper uses the seven days ending today and the immediately preceding seven days, with the same habit/task/focus switches, smooth line areas, daily details and keyboard controls as Insights. The rest of Today remains in place. The classic route retains all four cards.
- The weekly calculation is memoized against workspace data and the local date, independent of the Insights range. The View all statistics action opens Insights at seven days; returning from a 30-day Insights view still shows exactly seven points on Today. The chart uses the same saved records as Insights, without API or storage changes.
- Checked all three metrics, point selection, keyboard movement, previous-day controls, the full-statistics shortcut and range independence. Desktop at 1366×768, narrow desktop at requested 701px (measured 702px), and mobile at 390×844 showed no horizontal overflow. A classic-page check retained four summary cards and no weekly chart. No test records were saved. Screenshots are in `try-tracker-2.6/home-weekly` in the local task artifacts.
- `npm test`: 90 passed. Production build and diff checks passed; the existing large JavaScript chunk warning remains. Light/English, empty workspaces and physical-device performance were not re-tested for this relocation of the shared chart.

## Mobile swipe dock — 1 November 2026

- Replaced the preview's mobile bottom navigation with the supplied vertical icon dock, revealed by swiping right from the leftmost 24px of the screen. The visible edge-arrow handle was removed after feedback. The reference sizing is 94px wide with 50px controls and 12px gaps; short screens use 44px controls and scroll internally if needed. A keyboard/screen-reader trigger is visually hidden until keyboard focus, so ordinary touchscreen use has no button at the edge.
- Horizontal dragging updates one scoped CSS progress value per animation frame. Release settles using distance and flick velocity; vertical/ambiguous movement remains available to page scrolling. The rail and scrim animate only transform and opacity, with 320ms opening and 240ms closing transitions. Reduced motion disables those transitions; no blur or page-scaling effect was introduced. Swipe left, backdrop dismissal, Escape and menu selection close the dock.
- Added modal focus handling, keyboard arrows/Home/End, labels, active-page state and task badges. Background siblings become inert while open and regain their original state on close/unmount. The page creation action remains available as a floating button, with spacing for the existing timer. Desktop navigation and classic mobile navigation keep their existing presentation.
- Browser input drags verified opening from the left edge, closing by swiping left, and a short drag returning closed. Checked keyboard focus/Tab wrapping/Escape, backdrop dismissal, all eight destinations, creation-dialog opening without saving, and cleanup when resizing to desktop. Tested 390×844, 320×568 and 390×480; no horizontal overflow was found. The standard rail measured 94px wide and approximately 546px tall. Desktop at 1366×768 restored the original dock with no body scroll lock or inert content; the classic route retained its five-button bottom bar.
- `npm test`: 95 passed, including five new gesture tests for directional intent, vertical-scroll rejection, bounded progress, slow drags and short flicks. Production build and diff checks passed; the existing large JavaScript chunk warning remains. Screenshots and checks are in `try-tracker-2.6/mobile-edge-dock` in the local task artifacts. Tests used browser mouse/pointer input; physical iOS/Android edge gestures, light/English and a system reduced-motion setting were not re-tested. No workspace records or preferences were saved during verification.

## Mobile date/focus parity and compact dock — 1 November 2026

- Extended the preview date card to phones: month/range, date input and Today action sit in one surface above the scrolling date strip. At 360px and below the controls wrap onto their own row. The existing scrolling and date-selection logic is retained.
- Preview mobile Focus now shares the desktop rectangular timer surface, in-timer category picker and focus-history panel. Stopwatch/Pomodoro controls, category management and saved sessions retain their existing callbacks. Added phone-specific presentation in `mobile26.css`; desktop styles stay in their existing breakpoint.
- Reduced the mobile swipe dock to 76px wide with 40px controls, 10px gaps and tighter padding, addressing the oversized phone rendering in the supplied comparison. Short windows retain tighter spacing. The invisible edge gesture and closing animation remain available.
- Checked Thai/dark at 390×844 and 320×844 with no horizontal overflow; verified date keyboard selection/Today, category-picker opening/Escape and Pomodoro duration controls without starting or saving a session. Desktop at 1366×768 retains the 68px desktop dock and original date layout. Tests: 95 passed; production build and diff checks passed (existing large-chunk warning remains). Proof is in `try-tracker-2.6/phone-parity`. Physical phones, English/light and actual timer completion were not re-tested for these layout changes.

## Dock square proportions — 1 November 2026

- Tightened the mobile dock surface from 76px to 62px wide around the existing 40px controls. The resulting left/right inset is 11px including the border, matching the compact frame-to-button proportions of the supplied desktop reference. Explicit equal min/max dimensions and a 1:1 aspect ratio prevent controls from stretching.
- Checked all eight buttons at 390×844 and 320×568: each measured 40×40px with equal 11px side insets and no horizontal overflow. Production build and diff checks passed. Screenshot: `try-tracker-2.6/dock-square/mobile.jpg`. This CSS refinement did not change gestures or saved data.

- Follow-up corner refinement: the 62px mobile rail now uses a 22px corner radius, proportional to the desktop reference. Removed the short-screen 26px override that made the silhouette differ. Computed radius is 22px at both 390×844 and 390×568; build and diff checks passed. Proof: `try-tracker-2.6/dock-square/radius-final.jpg`.

## Performance sample

Short local development-browser samples used identical demo data and scripted actions. These are diagnostic samples, not field INP measurements or guarantees for other hardware.

| Sample | Classic | Preview |
| --- | ---: | ---: |
| Navigation/search/filter sample duration | 6.59s | 6.61s |
| Observed event maximum | 120ms | 120ms |
| Animation-frame interval, 95th percentile | 7.1ms | 7.1ms |
| Long-task maximum | 90ms | 84ms |
| 120-task scrolling frame maximum | 160ms | 146ms |

The dock produces additional pointer events, so aggregate event percentile/count values should not be interpreted as a direct speed comparison. The bounded samples did not show a performance regression. The app's pre-existing clock/render behavior and bundle structure were retained.

Browser layout results, raw samples and 63 screenshots are stored in the task's local `try-tracker-2.6` artifact directory, with an `index.html` review gallery and `browser-report.json`.
