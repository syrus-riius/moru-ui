# Overlay quality audit — 2026-10-30

## Scope

Dialog, AlertDialog, Popover, Drawer, and Sheet (left/right/bottom), using the actual shared Moru web components. Browser checks use `.qa/overlay-audit.html` and the component gallery; the harness is not published.

## Fixed

- Drawer: an incomplete pointer drag no longer consumes the following Enter/Space or assistive activation. Closing a controlled drawer clears the drag offset and gesture state.
- Dialog: long unbroken titles and action labels wrap within the viewport. Focused popup uses the theme focus token; touch close target is at least 44px.
- Drawer and Sheet: the whole panel scrolls, so a long header cannot squeeze the body to zero or hide the footer. Sheet retains a bottom-aligned footer for short forms. Long forms scroll their header and footer along with the content.
- AlertDialog: initial loading focuses the popup instead of its disabled cancel button. Starting an async confirmation moves focus to the popup before disabling both actions can leave focus on the document body. Errors remain announced and retry/cancel remain reachable.
- Dialog/Popover expose initialFocus and finalFocus; AlertDialog exposes finalFocus. Existing default focus behavior is preserved.
- OverlayPortal gives Base UI portal hosts a stacking context and propagates the parent layer through React context. Nested modals, menus, and selectors render above their parent even across ThemeScope portal hosts. Existing Base UI focus guards, backdrops, and portal containers remain in use.

## Browser verification

- Enter opening, forward/reverse Tab cycles, disabled control skipping, Escape dismissal and opener focus restoration for modal variants.
- Popover Tab exit reaches the next page control; Shift+Tab reaches the opener; Escape returns to the opener; clicking outside preserves the clicked target.
- Explicit initial focus and final focus; final focus still reaches a stable target when the opener is removed while open.
- Initial busy confirmation, loading transition, failure announcement, then keyboard cancel/retry.
- Incomplete 18px drawer pull stays open, then Enter closes; Space closes the real gallery drawer.
- Long title/description, 15 extra inputs and long footer labels at 320×360: no horizontal overflow; Tab reaches the visible footer in Dialog, Drawer and Sheet. Long Popover content scrolls to its last action.
- 56 layout combinations: 7 variants × light/dark × 320/390/820/1280px. Containment, horizontal overflow, focused element containment and appropriate body scroll locking pass. Layout measurements disable transition duration in the test harness; ordinary-motion behavior is checked separately in the gallery.
- Popover → Dialog → Select: child layers appear above parents, arrow/Enter selection works, Escape restores focus to the parent opener. The same composition inherits the opposite ThemeScope mode correctly.
- Real gallery Dialog, Popover, Sheet, Drawer, menu and scrolled Tooltip smoke checks.

## Automated validation

- 955 tests across 59 files pass, including 4 new drawer-activation regressions and 5 portal-layer regressions.
- TypeScript and production build pass. Web starter archive rebuilt from the updated shared components.
- Existing Vite large-chunk warning remains; this audit does not change bundling strategy.

## Limits

Browser viewport checks do not replace physical iOS/Android testing, virtual keyboard/safe-area testing, or VoiceOver/TalkBack verification. The React Native implementation is outside this web overlay audit.
