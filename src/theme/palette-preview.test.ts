import { describe, expect, it } from 'vitest'
import { defaultColorSchemeSettings } from './color-scheme'
import { paletteRoleKeys, type PaletteRecommendation } from './palette-recommendations'
import { createDarkTokens, defaultTokens, validateTokens } from './tokens'
import {
  applyThemeTokensState,
  reduceThemeSession,
  restoreThemeState,
  type ThemeSession,
} from './useTheme'

function initialSession(): ThemeSession {
  const light = validateTokens({
    ...defaultTokens,
    radius: 18,
    density: 'compact',
    appearance: { preset: 'glass' },
    componentSpacing: { button: { margin: { top: { unit: 'px', value: 3 } } } },
  })
  return {
    saved: {
      schemaVersion: 9,
      mode: 'light',
      presetId: 'midnight',
      themes: { light, dark: createDarkTokens(light) },
      colorSchemes: {
        light: { ...defaultColorSchemeSettings, seed: '#123456' },
        dark: { ...defaultColorSchemeSettings, seed: '#abcdef' },
      },
    },
    preview: null,
    lockedRoles: { light: [], dark: [] },
  }
}

function recommendation(primary = '#c5d86d'): PaletteRecommendation {
  return {
    id: 'tonal',
    name: '단색의 균형',
    description: '색의 역할을 비교하는 예제',
    colors: {
      primary,
      accent: '#f05d23',
      background: '#f7f7f2',
      surface: '#e4e6c3',
      text: '#261c15',
      muted: '#595143',
      border: '#aaa88c',
    },
  }
}

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze)
    Object.freeze(value)
  }
  return value
}

describe('palette preview transactions', () => {
  it('retains the exact saved theme during selection, replacement, and cancellation', () => {
    const initial = freeze(initialSession())
    const stored = JSON.stringify(initial.saved)
    const first = reduceThemeSession(initial, { type: 'preview', candidate: recommendation() })
    const second = reduceThemeSession(first, {
      type: 'preview',
      candidate: { ...recommendation('#789abc'), id: 'complementary' },
    })

    expect(first.saved).toBe(initial.saved)
    expect(second.saved).toBe(initial.saved)
    expect(JSON.stringify(second.saved)).toBe(stored)
    expect(second.preview?.colors.primary).toBe('#789abc')
    expect(second.preview?.mode).toBe('light')
    const cancelled = reduceThemeSession(second, { type: 'cancel-preview' })
    expect(cancelled.saved).toBe(initial.saved)
    expect(cancelled.preview).toBeNull()
  })

  it('commits only foundation colors and clears generator metadata for the selected mode', () => {
    const initial = freeze(initialSession())
    const candidate = freeze(recommendation())
    const preview = reduceThemeSession(initial, { type: 'preview', candidate })
    const committed = reduceThemeSession(preview, { type: 'save-preview' })

    expect(committed.preview).toBeNull()
    expect(committed.saved.presetId).toBe('custom')
    expect(committed.saved.themes.dark).toBe(initial.saved.themes.dark)
    expect(committed.saved.colorSchemes?.light).toBeUndefined()
    expect(committed.saved.colorSchemes?.dark).toBe(initial.saved.colorSchemes?.dark)
    expect(committed.saved.themes.light).toEqual({
      ...initial.saved.themes.light,
      ...candidate.colors,
    })
    expect(restoreThemeState(JSON.parse(JSON.stringify(committed.saved)))).toEqual(committed.saved)
  })

  it('commits to dark mode without changing the independent light palette', () => {
    const initial = initialSession()
    initial.saved.mode = 'dark'
    freeze(initial)
    const preview = reduceThemeSession(initial, { type: 'preview', candidate: recommendation() })
    const committed = reduceThemeSession(preview, { type: 'save-preview' })
    expect(committed.saved.themes.light).toBe(initial.saved.themes.light)
    expect(committed.saved.colorSchemes?.light).toBe(initial.saved.colorSchemes?.light)
    expect(committed.saved.colorSchemes?.dark).toBeUndefined()
    for (const key of paletteRoleKeys)
      expect(committed.saved.themes.dark[key]).toBe(recommendation().colors[key])
  })

  it('uses saved tokens for a manual edit, then ignores a queued stale save', () => {
    const initial = initialSession()
    const preview = reduceThemeSession(initial, { type: 'preview', candidate: recommendation() })
    const edited = reduceThemeSession(preview, {
      type: 'update',
      update: (saved) =>
        applyThemeTokensState(saved, (current) => ({ ...current, radius: current.radius + 1 })),
    })
    expect(edited.preview).toBeNull()
    expect(edited.saved.themes.light.primary).toBe(initial.saved.themes.light.primary)
    expect(edited.saved.themes.light.radius).toBe(initial.saved.themes.light.radius + 1)
    expect(reduceThemeSession(edited, { type: 'save-preview' })).toBe(edited)
  })

  it('drops a pending preview on mode changes and explicit theme replacement', () => {
    const initial = initialSession()
    const preview = reduceThemeSession(initial, { type: 'preview', candidate: recommendation() })
    const changed = reduceThemeSession(preview, {
      type: 'set-mode',
      mode: 'dark',
    })
    expect(changed.preview).toBeNull()
    expect(reduceThemeSession(changed, { type: 'save-preview' })).toBe(changed)
    const imported = reduceThemeSession(preview, { type: 'update', update: initial.saved })
    expect(imported).toEqual(initial)
  })

  it('saves the latest candidate when selections and save are queued together', () => {
    const actions = [
      { type: 'preview', candidate: recommendation('#112233') },
      { type: 'preview', candidate: recommendation('#445566') },
      { type: 'save-preview' },
    ] as const
    const committed = actions.reduce(reduceThemeSession, initialSession())
    expect(committed.saved.themes.light.primary).toBe('#445566')
    expect(committed.preview).toBeNull()
  })

  it('copies and normalizes only allowed color keys, rejecting an invalid candidate atomically', () => {
    const initial = initialSession()
    const candidate = recommendation('#ABC')
    Object.assign(candidate.colors, { success: '#ffffff', radius: 99 })
    const preview = reduceThemeSession(initial, { type: 'preview', candidate })
    candidate.colors.primary = '#123456'
    expect(preview.preview?.colors.primary).toBe('#aabbcc')
    expect(Object.keys(preview.preview!.colors).sort()).toEqual([...paletteRoleKeys].sort())
    const invalid = recommendation()
    invalid.colors.surface = 'url(invalid)'
    expect(reduceThemeSession(preview, { type: 'preview', candidate: invalid })).toBe(preview)
  })

  it('does not resurrect a discarded preview when cancel and save are queued together', () => {
    const initial = initialSession()
    const preview = reduceThemeSession(initial, { type: 'preview', candidate: recommendation() })
    const cancelled = reduceThemeSession(preview, { type: 'cancel-preview' })
    expect(reduceThemeSession(cancelled, { type: 'save-preview' })).toBe(cancelled)
    expect(cancelled.saved).toBe(initial.saved)
  })
})

describe('transient palette role locks', () => {
  it('toggles role metadata without changing persisted tokens or the current preview', () => {
    const initial = freeze(initialSession())
    const stored = JSON.stringify(initial.saved)
    const preview = reduceThemeSession(initial, { type: 'preview', candidate: recommendation() })
    const surface = reduceThemeSession(preview, { type: 'toggle-role-lock', role: 'surface' })
    const both = reduceThemeSession(surface, { type: 'toggle-role-lock', role: 'primary' })
    const released = reduceThemeSession(both, { type: 'toggle-role-lock', role: 'surface' })

    expect(both.lockedRoles.light).toEqual(['primary', 'surface'])
    expect(released.lockedRoles.light).toEqual(['primary'])
    expect(released.saved).toBe(initial.saved)
    expect(released.preview).toBe(preview.preview)
    expect(JSON.stringify(released.saved)).toBe(stored)
    expect(released.saved).not.toHaveProperty('lockedRoles')
  })

  it('keeps independent mode locks and only clears the current mode on explicit unlock', () => {
    const light = reduceThemeSession(initialSession(), {
      type: 'toggle-role-lock',
      role: 'primary',
    })
    const dark = reduceThemeSession(light, { type: 'set-mode', mode: 'dark' })
    const locked = reduceThemeSession(dark, { type: 'toggle-role-lock', role: 'background' })
    const switched = reduceThemeSession(locked, { type: 'set-mode', mode: 'light' })
    const cleared = reduceThemeSession(switched, { type: 'clear-role-locks' })

    expect(switched.lockedRoles).toEqual({ light: ['primary'], dark: ['background'] })
    expect(cleared.lockedRoles).toEqual({ light: [], dark: ['background'] })
    expect(cleared.saved).toBe(switched.saved)
    expect(reduceThemeSession(cleared, { type: 'clear-role-locks' })).toBe(cleared)
    expect(
      reduceThemeSession(cleared, { type: 'set-mode', mode: 'dark' }).lockedRoles.dark,
    ).toEqual(['background'])
  })

  it('protects the currently displayed locked colors against stale candidate snapshots', () => {
    const initial = initialSession()
    const first = reduceThemeSession(initial, { type: 'preview', candidate: recommendation() })
    const primary = reduceThemeSession(first, { type: 'toggle-role-lock', role: 'primary' })
    const locked = reduceThemeSession(primary, { type: 'toggle-role-lock', role: 'surface' })
    const nextCandidate = recommendation('#123456')
    nextCandidate.colors.surface = '#654321'
    nextCandidate.colors.accent = '#abcdef'
    const next = reduceThemeSession(freeze(locked), { type: 'preview', candidate: nextCandidate })
    const saved = reduceThemeSession(next, { type: 'save-preview' })

    expect(next.preview?.colors.primary).toBe(first.preview?.colors.primary)
    expect(next.preview?.colors.surface).toBe(first.preview?.colors.surface)
    expect(next.preview?.colors.accent).toBe('#abcdef')
    expect(next.saved).toBe(initial.saved)
    expect(saved.saved.themes.light.primary).toBe(first.preview?.colors.primary)
    expect(saved.saved.themes.light.surface).toBe(first.preview?.colors.surface)
    expect(saved.saved.themes.light.accent).toBe('#abcdef')
    expect(saved.lockedRoles).toBe(locked.lockedRoles)
  })

  it('restores saved colors on cancel while retaining locks for subsequent recommendations', () => {
    const initial = initialSession()
    const first = reduceThemeSession(initial, { type: 'preview', candidate: recommendation() })
    const locked = reduceThemeSession(first, { type: 'toggle-role-lock', role: 'primary' })
    const cancelled = reduceThemeSession(locked, { type: 'cancel-preview' })
    const next = reduceThemeSession(cancelled, {
      type: 'preview',
      candidate: recommendation('#123456'),
    })

    expect(cancelled.preview).toBeNull()
    expect(cancelled.saved).toBe(initial.saved)
    expect(cancelled.lockedRoles.light).toEqual(['primary'])
    expect(next.preview?.colors.primary).toBe(initial.saved.themes.light.primary)
    expect(next.preview?.colors.primary).not.toBe(first.preview?.colors.primary)
  })

  it('keeps color locks for structural edits, releasing only palettes affected by manual color edits', () => {
    const initial = initialSession()
    initial.lockedRoles = { light: ['primary'], dark: ['surface'] }
    freeze(initial)
    const shapeEdit = reduceThemeSession(initial, {
      type: 'update',
      update: (saved) => applyThemeTokensState(saved, (tokens) => ({ ...tokens, radius: 9 })),
    })
    const primaryEdit = reduceThemeSession(initial, {
      type: 'update',
      update: (saved) =>
        applyThemeTokensState(saved, (tokens) => ({ ...tokens, primary: '#123abc' })),
    })
    const accentEdit = reduceThemeSession(initial, {
      type: 'update',
      update: (saved) =>
        applyThemeTokensState(saved, (tokens) => ({ ...tokens, accent: '#123abc' })),
    })

    expect(shapeEdit.lockedRoles).toEqual(initial.lockedRoles)
    expect(primaryEdit.lockedRoles).toEqual({ light: [], dark: ['surface'] })
    expect(accentEdit.lockedRoles).toEqual({ light: [], dark: [] })
  })

  it('clears both mode locks for explicit reset, import, and preset replacements even if colors match', () => {
    const initial = initialSession()
    initial.lockedRoles = { light: ['primary'], dark: ['surface'] }
    const preview = reduceThemeSession(freeze(initial), {
      type: 'preview',
      candidate: recommendation(),
    })
    const replaced = reduceThemeSession(preview, {
      type: 'update',
      update: initial.saved,
      resetLocks: 'all',
    })

    expect(replaced.preview).toBeNull()
    expect(replaced.lockedRoles).toEqual({ light: [], dark: [] })
    expect(replaced.saved).toBe(initial.saved)
    expect(reduceThemeSession(replaced, { type: 'save-preview' })).toBe(replaced)
  })
})

describe('on-primary text preview', () => {
  it('previews an explicit text color without saving it, then persists it with the palette', () => {
    const initial = freeze(initialSession())
    const stored = JSON.stringify(initial.saved)
    const preview = reduceThemeSession(initial, {
      type: 'preview',
      candidate: { ...recommendation('#684bcc'), primaryForeground: '#FFF' },
    })

    expect(preview.preview?.primaryForeground).toBe('#ffffff')
    expect(preview.saved).toBe(initial.saved)
    expect(JSON.stringify(preview.saved)).toBe(stored)
    const committed = reduceThemeSession(preview, { type: 'save-preview' })
    expect(committed.saved.themes.light.primaryForeground).toBe('#ffffff')
    expect(committed.saved.themes.light.text).toBe(recommendation().colors.text)
    expect(committed.saved.themes.light.success).toBe(initial.saved.themes.light.success)
    expect(committed.saved.themes.light.typography).toEqual(initial.saved.themes.light.typography)
    expect(committed.saved.themes.dark).toBe(initial.saved.themes.dark)
    expect(restoreThemeState(JSON.parse(JSON.stringify(committed.saved)))).toEqual(committed.saved)
  })

  it('retains explicit foreground through new wheel or random candidates and restores saved text on cancel', () => {
    const initial = initialSession()
    initial.saved.themes.light.primaryForeground = '#eeeeee'
    freeze(initial)
    const inherited = reduceThemeSession(initial, { type: 'preview', candidate: recommendation() })
    const edited = reduceThemeSession(inherited, {
      type: 'preview',
      candidate: { ...recommendation(), primaryForeground: '#ffffff' },
    })
    const rotated = reduceThemeSession(edited, {
      type: 'preview',
      candidate: recommendation('#234567'),
    })
    expect(inherited.preview?.primaryForeground).toBe('#eeeeee')
    expect(rotated.preview?.primaryForeground).toBe('#ffffff')

    const cancelled = reduceThemeSession(rotated, { type: 'cancel-preview' })
    expect(cancelled.preview).toBeNull()
    expect(cancelled.saved.themes.light.primaryForeground).toBe('#eeeeee')
    expect(cancelled.saved).toBe(initial.saved)
    expect(reduceThemeSession(cancelled, { type: 'save-preview' })).toBe(cancelled)
  })

  it('allows an explicit automatic reset to replace a saved or previewed text override', () => {
    const initial = initialSession()
    initial.saved.themes.light.primaryForeground = '#ffffff'
    const reset = reduceThemeSession(freeze(initial), {
      type: 'preview',
      candidate: { ...recommendation(), primaryForeground: 'auto' },
    })
    const next = reduceThemeSession(reset, {
      type: 'preview',
      candidate: recommendation('#fedcba'),
    })
    const committed = reduceThemeSession(next, { type: 'save-preview' })
    expect(next.preview?.primaryForeground).toBe('auto')
    expect(committed.saved.themes.light.primaryForeground).toBe('auto')
    expect(restoreThemeState(JSON.parse(JSON.stringify(committed.saved)))).toEqual(committed.saved)
  })

  it('keeps role locks while editing foreground and rejects invalid text colors atomically', () => {
    const initial = initialSession()
    initial.lockedRoles.light = ['primary', 'surface']
    freeze(initial)
    const edited = reduceThemeSession(initial, {
      type: 'preview',
      candidate: { ...recommendation(), primaryForeground: '#ffffff' },
    })
    expect(edited.preview?.colors.primary).toBe(initial.saved.themes.light.primary)
    expect(edited.preview?.colors.surface).toBe(initial.saved.themes.light.surface)
    expect(edited.preview?.primaryForeground).toBe('#ffffff')
    expect(edited.lockedRoles).toBe(initial.lockedRoles)
    for (const invalid of ['url(invalid)', 'white', '', 'auto; color:red']) {
      expect(
        reduceThemeSession(edited, {
          type: 'preview',
          candidate: { ...recommendation(), primaryForeground: invalid },
        }),
      ).toBe(edited)
    }
  })

  it('discards a text preview on mode change and derives the next preview from the new mode', () => {
    const initial = initialSession()
    initial.saved.themes.light.primaryForeground = '#ffffff'
    initial.saved.themes.dark.primaryForeground = '#111111'
    const preview = reduceThemeSession(freeze(initial), {
      type: 'preview',
      candidate: { ...recommendation(), primaryForeground: '#eeeeee' },
    })
    const switched = reduceThemeSession(preview, { type: 'set-mode', mode: 'dark' })
    expect(switched.preview).toBeNull()
    expect(reduceThemeSession(switched, { type: 'save-preview' })).toBe(switched)
    const dark = reduceThemeSession(switched, { type: 'preview', candidate: recommendation() })
    expect(dark.preview?.primaryForeground).toBe('#111111')
    const committed = reduceThemeSession(dark, { type: 'save-preview' })
    expect(committed.saved.themes.light).toBe(initial.saved.themes.light)
    expect(committed.saved.themes.dark.primaryForeground).toBe('#111111')
  })

  it('marks a direct text override as custom while leaving harmony role locks intact', () => {
    const initial = initialSession()
    initial.lockedRoles.light = ['primary']
    const updated = reduceThemeSession(freeze(initial), {
      type: 'update',
      update: (saved) =>
        applyThemeTokensState(saved, (tokens) => ({ ...tokens, primaryForeground: '#ffffff' })),
    })
    expect(updated.saved.presetId).toBe('custom')
    expect(updated.saved.themes.light.primaryForeground).toBe('#ffffff')
    expect(updated.lockedRoles).toEqual(initial.lockedRoles)
    expect(updated.saved.themes.dark.primaryForeground).toBe(
      initial.saved.themes.dark.primaryForeground,
    )
  })
})
