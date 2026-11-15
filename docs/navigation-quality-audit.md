# Navigation quality audit — 2026-10-30

## Scope

Tabs, Menu, Menubar, NavigationMenu, Sidebar, ContextMenu, Breadcrumb, Pagination and Stepper. Actual shared web components were checked in `.qa/navigation-audit.html` and the gallery. The local test harness is not deployed.

## Changes

- Tabs supports disabled items and chooses the first enabled initial tab. It exposes Base UI orientation, activateOnFocus and loopFocus. Existing manual activation remains the default: arrows move focus; Enter/Space selects. Horizontal lists scroll, individual long labels wrap within the scrollport, vertical lists wrap, and focus rings remain visible inside the scroll area.
- Menu popups clamp to available viewport dimensions, wrap long labels and scroll long lists. Menu, Menubar, ContextMenu, nested menus and NavigationMenu use fixed positioning to avoid page scroll affecting relative portal coordinates. This fixes the reproduced 820px viewport case where a long menu started above the screen.
- Menu, Menubar, ContextMenu and uncontrolled NavigationMenu close when disabled and clear stale internal open state, so re-enabling does not reopen old popups. NavigationMenu also rejects unavailable controlled/default submenu values and blocks disabled parent links.
- Menu supports finalFocus with a stable anchor fallback when its trigger becomes disabled. Menubar and NavigationMenu recover to an available trigger or group when needed; external focus is preserved. ContextMenu keeps its programmatically focusable trigger as the return target.
- Menu action labels drive typeahead independently of icons and shortcut text. Long triggers, actions and shortcuts fit narrow screens.
- Sidebar uses the same 640px breakpoint for actual modal state and CSS. Resizing an open mobile sidebar to desktop closes it, unlocks scrolling and focuses the current desktop item. Disabling an open sidebar also closes it and restores stable focus. Long titles, labels and footer content scroll without horizontal overflow.
- Coarse-pointer targets are at least 44px for tabs, menu actions, sidebar controls, pagination and breadcrumb links/buttons. Borderless design tokens remain in effect.

## Browser checks

- Tabs: Home/End/left/right focus, Enter/Space manual activation, up/down vertical automatic activation, disabled activation blocking, tabpanel then input traversal, and automatic scrolling to the last long tab.
- Menu: open, disabled action handling, End reaching the visible last entry in a long scroll area, Escape return to trigger. Base UI may focus disabled menu/tab items for discoverability; activation stays blocked.
- Menubar: left/right movement skips unavailable top menus; down opens; right enters a submenu, left returns; Enter selects and Escape restores the appropriate trigger.
- NavigationMenu: opening, Tab into links, disabled links excluded from Tab order, keyboard selection and Escape return.
- ContextMenu: Shift+F10, arrow navigation, Escape return to the context region.
- Disabled while open: all four menu variants close, keep a stable focus target and remain closed after re-enabling.
- Sidebar: mobile → desktop closes/unlocks/focuses current item; returning to mobile stays closed; disabled while open closes/unlocks/focuses root; collapsed items retain their accessible names; a 320×360 long sidebar scrolls to its final entries.
- Breadcrumb: disabled/current entries do not become actionable; Pagination: keyboard selection, current page and boundary disabling; Stepper: disabled step skipping, keyboard step selection and correct active panel.
- Final layout matrix: 9 variants × light/dark × 320/820/1280px = 54 combinations passed document width and popup containment/overflow checks. Layout checks use zero transition duration in the harness. Normal animations and nested menu placement were also checked in the real gallery.

## Validation and limits

971 tests in 62 files and the production build pass, including 16 new regressions for tabs, menu availability and sidebar semantics. The web starter archive was regenerated from the updated source. The existing large-bundle build warning remains.

Viewport checks cover responsive browser layouts. Physical iOS/Android touch, virtual keyboards and VoiceOver/TalkBack are not verified by this audit. React Native components are outside this web scope.
