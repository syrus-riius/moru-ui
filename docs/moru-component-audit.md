# Moru UI: component and product quality audit

Reviewed: 2026-10-27. Scope: React web library, its examples, design tokens, and the shared Expo preview. This is a product audit, not a claim of full WCAG conformance or SwiftUI parity.

## Reference comparison

The [shadcn/ui general component index](https://ui.shadcn.com/docs/components) has 66 reviewed names. Moru has a corresponding gallery entry for each name. Matching names does not imply matching every prop, state, edge case, integration, or AI Elements component. shadcn's useful reference is source ownership, composable examples, keyboard behavior, and [semantic theming](https://ui.shadcn.com/docs/theming).

[Mantine](https://mantine.dev/) is a broader reference for practical form controls, hooks and consistent component APIs. Its larger catalog is not an instruction to duplicate every specialized control. The current audit prioritized missing everyday inputs and reusable workflow patterns over components that duplicate Moru's existing Trace, Questionnaire, Progress or Combobox.

| Area | Audit finding | Applied change |
| --- | --- | --- |
| Numeric fields | Text inputs alone do not cover nullable numbers, units, bounds or stepping | Number Input: Base UI NumberField, locale-aware formatting, nullable value, bounds, precision and keyboard stepping |
| Passwords | Generic input has no standard reveal control | Password Input: native input semantics, explicit reveal state, autofill and Field integration |
| Multiple selection | Single Combobox cannot represent multiple submitted values | Multi Select: searchable choices, keyboard chips, limit feedback, stable form values and reset support |
| File selection | Attachment describes a file but does not select one | File Input: real local file selection, accept/size/count validation, label/error connection, clearing and reset |
| Form sequences | Questionnaire's fixed questions do not replace arbitrary forms | Stepper: current/completed/error states and validated next/previous flow |
| Capacity and goals | Linear progress alone cannot express segmented capacity compactly | Ring Progress: bounded geometry and text values/legend alongside visual sections |
| Date forms | DatePicker selected dates were not submitted by a native form | Date-only `YYYY-MM-DD`, name/form/required/readOnly, native range validation, focusable error, reset and a submission demo |
| Adoption | A hosted showcase is insufficient for integrating into another app | Downloadable web starter containing the actual UI/theme sources, runnable example, source checksums and build verification |

Official behavior references: [NumberInput](https://mantine.dev/core/number-input/), [PasswordInput](https://mantine.dev/core/password-input/), [MultiSelect](https://mantine.dev/core/multi-select/), [FileInput](https://mantine.dev/core/file-input/), [Stepper](https://mantine.dev/core/stepper/), [RingProgress](https://mantine.dev/core/ring-progress/).

## Typography and layout

See [design-foundations-audit.md](./design-foundations-audit.md) for detailed sources and limits. The baseline is a productivity interface: 14px body, 13px labels, neutral body/label tracking, role-specific heading typography, and progressively larger field/form/section gaps. Long prose gets a larger reading style and bounded measure. These are design choices informed by Carbon; WCAG does not mandate a universal minimum font size or an 8px grid.

The design-token page now includes a live quality workbench. It computes the displayed text/control color pairs, reports spacing hierarchy, and lets a user compare a 320px layout, doubled role text sizes, and text-spacing overrides. The spacing test applies the four WCAG 1.4.12 values together to an actual form. That criterion concerns preserving content/function under user overrides; those values are not compulsory default letter spacing.

Input boundaries use a derived `controlBorder` distinct from quiet decorative separators. New numeric/multi/file/date inputs use the same token. Native TextField, unchecked controls and Switch off state receive its shared export too. Existing saved user themes remain intact; users can deliberately apply the new typography profile in the quality workbench.

## What still needs deliberate work

| Priority | Work | Completion evidence required |
| --- | --- | --- |
| High | Real assistive technology and device testing | VoiceOver/TalkBack, Safari/iOS and Android device flows, hardware keyboard, large system text, nested overlays, IME composition |
| High | Published consumption contract | MIT license, public source repository, contribution guide and web CI prepared. Selective registry, broader runtime compatibility and release/migration policy remain planned. |
| High | Automated browser regression suite | Persist end-to-end cases for actual forms, keyboard-only overlays, RTL, reduced motion, forced colors and representative responsive screenshots |
| Medium | Advanced date/time and large datasets | Date range/time/time zone contracts, virtualized large selections, tree selection, data-grid editing and server pagination with examples |
| Medium | Rich input and product integrations | Tags/free-entry rules, rich text editing, file upload/retry/cancel backend adapters, async search and documented validation integration |
| Medium | Internationalization | Separate translated UI messages from component mechanics, locale formatting, RTL logical spacing, long-label and mixed-script coverage |

No background upload, authentication, invitation, or file service is added by these examples. The project-creation flow adds a local example record and deliberately does not save the example access key or actual file bytes to that record. The source starter is a source project; it is not represented as a published npm package.

## Verification record

The root test suite covers token contracts, catalog/category coverage, numeric formatting and semantics, selection/reset behavior, date serialization/validation, file accept/size/count, step policy, and ring normalization. Browser checks additionally exercise the actual rendered code. Build and device verification are reported separately so successful Expo exports are not confused with physical-device testing.
