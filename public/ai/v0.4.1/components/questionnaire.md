# Questionnaire

Step-by-step questions composed from Moru input and selection controls.

Version: 0.4.1. Source hash: 2fd87d38eaaf0375eb097047b65a7d17f1067292b1a98efdbfd46ccdaa31ff28.

## Discovery

- Registry ID: `questionnaire`
- Import: `@/components/ui/moru/questionnaire`
- Runtime exports: `Questionnaire`
- Registry dependencies: [button](/ai/v0.4.1/components/button.md), [checkbox](/ai/v0.4.1/components/checkbox.md), [core](/ai/v0.4.1/core.md), [input](/ai/v0.4.1/components/input.md), [radio-group](/ai/v0.4.1/components/radio-group.md)
- Install source: [questionnaire.json](https://moru-ui-lab.riius.chatgpt.site/r/v0.4.1/questionnaire.json)
- Setup and import-path differences: [start](/ai/v0.4.1/start.md)
- Source: [src/components/ui/questionnaire.tsx](https://github.com/syrus-riius/moru-ui/blob/main/src/components/ui/questionnaire.tsx)

## Source-derived API

These are declarations from the installed source, not a replacement implementation. Inherited React/Base UI types stay inherited; resolve them from the installed dependency instead of assuming another library’s props.

Referenced imported types/values:

- `QuestionnaireAnswers, QuestionnaireQuestion` from `./questionnaire-utils`

```ts
interface QuestionnaireProps {
  questions: QuestionnaireQuestion[]
  value?: QuestionnaireAnswers
  defaultValue?: QuestionnaireAnswers
  onValueChange?: (answers: QuestionnaireAnswers) => void
  onComplete?: (answers: QuestionnaireAnswers) => void | Promise<void>
  submitLabel?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  'aria-label'?: string
}

export type {
  QuestionnaireAnswer,
  QuestionnaireAnswers,
  QuestionnaireOption,
  QuestionnaireQuestion,
} from './questionnaire-utils'
```

Exported function declaration excerpts (return types may be inferred in source):

```ts
function Questionnaire({
  questions,
  value,
  defaultValue = {},
  onValueChange,
  onComplete,
  submitLabel: submitLabelProp,
  disabled,
  size = 'md',
  className,
  'aria-label': labelProp,
}: QuestionnaireProps);
```

## Declared defaults

Extracted from exported component parameter/props destructuring. Identifier values refer to the installed source; omitted props are not necessarily unsupported.

- `Questionnaire.defaultValue`: `{}`
- `Questionnaire.size`: `'md'`
