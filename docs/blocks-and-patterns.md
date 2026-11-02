# Blocks and patterns — 2026-10-30

## Pages and reusable source

`#blocks` provides four compositions of existing Moru UI components: login, OTP verification, search filters and workspace settings. Deep links use `#blocks/login`, `#blocks/otp`, `#blocks/search-filters` and `#blocks/settings`. The sidebar and command menu expose the library.

The page offers category filters, one interactive preview, mobile/web dimensions, reset, a keyboard-operable code tab, clipboard feedback and simulator insertion. Mobile starts with a mobile preview; web uses an actual 880px scrollable frame, not a scaled mobile image. The global token editor applies to the live components. The preview frame establishes a positioned containing block so hidden named form controls cannot expand the page outside its scroll region.

Each reusable `src/components/blocks/*Block.tsx` is self-contained and depends only on React and existing Moru UI components. `getBlockSource` reads the real source and rewrites imports for a paste into `src/BlockName.tsx` in the web starter. The starter also includes all four original block files in `src/components/blocks`. Gallery metadata is separate from raw source so the example hub does not eagerly load code snippets.

## Interactions

- Login validates email and an eight-character password, shows local processing/completion feedback and clears the password. It does not send or persist credentials.
- OTP validates six digits and the demo code `123456`, shows errors and completion, and clears/refocuses on resend. It does not send email.
- Search combines text, project status and the assignee checkbox; zero results can reset to all projects.
- Settings tracks dirty values, validates workspace name/email, supports cancellation and local save feedback.

## Example hub

`#examples` opens a full-window hub with a six-flow workspace launcher and direct links to all four patterns. The workspace returns to the hub, keeps launched schedule/setup components mounted so draft data survives a hub round trip, and restores main-content focus and top scroll on these transitions. Example sidebar CSS uses the same 640px threshold as the shared Sidebar modal.

## Simulator transfer

`requestBlockInsertion` passes only a block ID and chosen device through a one-shot in-memory request. The simulator appends a new auto-layout screen, preserves existing screens/start screen/style and records the insertion as one undo transaction. Existing 20-screen limits apply. Imported values start from design defaults; preview-entered passwords and OTP values are never transferred.

Blocks expand into editable primitives and containers. The OTP primitive uses the real Moru InputOTP and round-trips through schemaVersion 1 documents. Required-field validation now applies to validated actions as well as navigation. The imported screen can run immediately without replacing the original project start screen.

The preview provides the domain-specific filtering, dirty-state and demo verification logic. Simulator transfer provides an editable screen composition, basic input validation and prototype actions; users connect subsequent screens/actions in the simulator.

## Validation

- 996 tests across 65 files pass, including 25 new block and simulator regressions.
- TypeScript, production build and web-starter source/hash checks pass.
- Actual clipboard output for all four blocks was pasted into the generated starter and compiled successfully, alongside the included reusable source.
- Browser checks cover login error/processing, OTP wrong/correct code and resend focus, combined search/empty reset, settings interaction, deep links, hub/workspace draft and focus preservation.
- All four block transfers append and undo successfully. OTP transfer was edited, resized to web, run with required errors, then completed with six digits. Original saved screens were preserved.
- 48 layout combinations (4 blocks × mobile/web preview × 320/820/1440px × light/dark) pass document and block-content overflow checks. The 680px example navigation regression was reproduced and fixed.

The forms are local UI examples; production authentication, email and persistence are supplied by the host application. Physical devices and assistive technology were not part of these browser checks.
