# Screen blocks — 2026-11-12

## Screen-first library

`#blocks` opens the dashboard by default and offers four complete screen starting points:

- `#blocks/dashboard`: team metrics, weekly/monthly activity, project search and filters, project details and creation.
- `#blocks/login`: returning-user sign-in with validation and local completion feedback.
- `#blocks/signup`: account details, email verification and completion in one flow.
- `#blocks/settings`: workspace information, visibility, notifications and save/cancel.

The category menu groups screens as work, authentication and settings. Selector cards describe the tasks in each screen. The examples hub uses the same metadata and links. Old `#blocks/otp` bookmarks open signup; `#blocks/search-filters` opens the dashboard. OTPBlock and SearchFiltersBlock remain reusable supporting patterns and keep their registry installation URLs.

## Preview and reusable source

Each screen uses real Moru components and shared design tokens. The gallery retains mobile/web preview, reset, keyboard-operable code tabs, clipboard feedback and simulator insertion. Mobile starts with a mobile preview; web uses an actual 880px scrollable frame.

The source viewer reads the actual block implementation. It rewrites UI and supporting-block imports so the copied file can live at `src/BlockName.tsx` in the downloadable web starter. The starter includes all six block sources, including the OTP and search-filter helpers. Registry users can install `dashboard`, `signup`, `login` or `settings` with their dependencies resolved automatically.

The signup and login flows are local interaction examples. They do not create accounts, send emails or persist credentials. Verification uses the disclosed demo code `123456`. Signup retains a draft when going back to account details and clears the password after completion. Production authentication and verification belong to the host application.

The dashboard maintains local example project records, derives its metrics from those records and composes SearchFiltersBlock for text/status/owner filtering. Its project creation and task-completion actions update the example. The host application supplies persistence if needed.

## Simulator transfer

`requestBlockInsertion` transfers only a design ID and device choice. It never copies preview-entered account details, passwords or verification codes. Existing project screens, start screen and style are preserved, and insertion is recorded as one undo transaction with the existing screen limit.

Imported screens expand into editable primitives and responsive auto-layout containers. They provide a prototype of the screen; service authentication and the dashboard's data/filter logic are exercised in the live block preview. Connect subsequent screens and actions in the simulator. Legacy OTP/search-filter insertion IDs remain compatible.

## Verification scope

Route tests cover new screens, legacy bookmarks and unknown routes. Block tests cover signup validation and portable source imports; simulator tests cover preservation, serialization and responsive insertion. Browser checks and build results for a release are recorded in its task report. Physical-device and assistive-technology testing are separate from browser checks.
