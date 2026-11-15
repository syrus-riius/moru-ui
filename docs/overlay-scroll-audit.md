# Overlay scroll stability

Opening an anchored popup must preserve the page's current scroll position. The popup may scroll
its own options or contents, but opening, selecting an item, and returning focus to the trigger must
not move the surrounding page.

## Root cause

The shared `OverlayPortal` used a zero-height, relatively positioned host at the end of the document.
Base UI positions anchored popups absolutely by default and transfers focus into their contents.
With that host in document flow, opening the quick-settings Popover moved the page from
`scrollY = 1094` to `1850.5`, while document height stayed at `2750`. This was a focus/portal-positioning
problem, rather than content being inserted into the page or a calendar-specific change in height.

The same shared host is used by Select, Combobox, Multi Select, menus, date/time pickers, and other
overlays, so the repair belongs in `OverlayPortal` rather than individual demo click handlers.

## Shared contract

- Anchor the original Base UI portal at the viewport's top edge with a fixed, full-width,
  zero-height host. Its positioned descendants remain outside document flow.
- Retain the original Base UI portal so its focus guards, backdrop, keyboard behavior, and focus
  restoration remain intact.
- Keep overflow visible. Do not apply a full-screen hit area or inherited `pointer-events: none`.
- Keep the existing isolated stacking context and nested layer calculation. Avoid transforms,
  filters, perspective, or containment on the host, which can rebase or clip nested fixed overlays.
- ThemeScope still supplies tokens through its existing body-level theme host.

`overlay-portal.test.tsx` checks this structural contract and nested stacking. Actual scrolling,
popup placement, Tab navigation, and Escape focus restoration require browser verification; server
markup tests cannot establish those behaviors.

## Verification

- On the component catalog, quick settings, dropdown menus, Calendar settings and Combobox
  preserve scroll position when reopened with the trigger already in view. Calendar arrow-key
  selection and Escape focus restoration also preserve the surrounding page.
- A local browser fixture measures document and nested-container scrolling at pointer/key dispatch,
  avoiding the browser automation's initial scroll-to-trigger adjustment. Popover, Select (36
  options), Combobox, Multi Select, Menu, DatePicker, DateRangePicker, TimePicker, TimeRangePicker,
  Modal and Drawer opening report zero scroll delta. Nested modal/drawer Select and inner-scroller
  Popover/Select also remain stable.
- Mobile-width dark-mode Popover stays within the 375px viewport; Popover and Select preserve
  scrolling. The same host contract applies with and without ThemeScope.
- Full unit suites and the production build pass. Browser measurements complement the structural
  regression tests; they are not a claim of automated coverage for every browser engine.
