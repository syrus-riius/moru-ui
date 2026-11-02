import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeScope } from '../components/ui/theme-scope';
import type { ComponentSpacingOverrides } from './component-spacing';
import {
  applyDensity, applyFontFamily, createComparisonTokens, createDarkTokens, cssForTokens,
  defaultTokens, getCssVariables, validateTokens, withDensityMetric,
} from './tokens';
import { parseThemeState, restoreThemeState } from './useTheme';

// Static rendering can inspect the popup host when portals return their child.
vi.mock('react-dom', () => ({ createPortal: (children: ReactNode) => children }));
afterEach(() => vi.unstubAllGlobals());

const spacing: ComponentSpacingOverrides = {
  button: { padding: { left: { value: 5, unit: 'space' }, right: { value: 5, unit: 'space' } } },
  card: { margin: { bottom: { value: 18, unit: 'px' } } },
};

function customTokens() {
  return withDensityMetric(validateTokens({
    ...defaultTokens, primary: '#324660', radius: 13, componentSpacing: spacing,
    typography: { body: { size: 17, weight: 450 } },
  }), 'formGap', 28);
}

describe('component spacing theme persistence', () => {
  it('preserves spacing through font, density, color-mode, and comparison changes without sharing mutable values', () => {
    const source = customTokens();
    const variants = [
      validateTokens(source), applyDensity(source, 'compact'), applyFontFamily(source, 'noto-sans'),
      createDarkTokens(source), createComparisonTokens(source, 'noto-sans', 'comfortable'),
    ];
    for (const variant of variants) {
      expect(variant.componentSpacing).toEqual(spacing);
      expect(variant.componentSpacing.button!.padding!.left).not.toBe(source.componentSpacing.button!.padding!.left);
      variant.componentSpacing.button!.padding!.left!.value = 7;
    }
    expect(source.componentSpacing).toEqual(spacing);
    expect(defaultTokens.componentSpacing).toEqual({});
    expect(validateTokens({ radius: 20 }, source).componentSpacing).toEqual(spacing);
    expect(validateTokens({ componentSpacing: {} }, source).componentSpacing).toEqual({});
  });

  it('shares one spacing system across light and dark modes and round-trips schema 8', () => {
    const light = customTokens();
    const dark = validateTokens({ ...createDarkTokens(light), primary: '#b0c7e0', componentSpacing: {} });
    const parsed = parseThemeState({ schemaVersion: 7, mode: 'dark', presetId: 'custom', themes: { light, dark } })!;
    expect(parsed.schemaVersion).toBe(9);
    expect(parsed.themes.dark.primary).toBe('#b0c7e0');
    expect(parsed.themes.dark.componentSpacing).toEqual(spacing);
    expect(parsed.themes.dark.componentSpacing.card).not.toBe(parsed.themes.light.componentSpacing.card);
    expect(restoreThemeState(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
    parsed.themes.dark.componentSpacing.card!.margin!.bottom!.value = 30;
    expect(parsed.themes.light.componentSpacing.card!.margin!.bottom!.value).toBe(18);
  });

  it.each([5, 6])('upgrades saved v%s themes without resetting earlier user edits', (schemaVersion) => {
    const light = customTokens();
    const dark = validateTokens({ ...createDarkTokens(light), primary: '#b0c7e0' });
    const legacyLight: Partial<typeof light> = { ...light };
    const legacyDark: Partial<typeof dark> = { ...dark };
    delete legacyLight.componentSpacing;
    delete legacyDark.componentSpacing;
    const saved = { schemaVersion, mode: 'dark', presetId: 'custom', themes: { light: legacyLight, dark: legacyDark } };
    const restored = restoreThemeState(saved);
    expect(restored).toMatchObject({
      schemaVersion: 9, mode: 'dark', presetId: 'custom',
      themes: {
        light: { primary: '#324660', radius: 13, densityOverrides: light.densityOverrides, componentSpacing: {}, typography: light.typography },
        dark: { primary: '#b0c7e0', radius: 13, densityOverrides: light.densityOverrides, componentSpacing: {}, typography: light.typography },
      },
    });
    expect(saved.themes.light).not.toHaveProperty('componentSpacing');
  });
});

describe('component spacing CSS reuse and theme isolation', () => {
  it('exports both reusable variables and component rules, keeping system units density-dependent', () => {
    const source = customTokens();
    const compact = getCssVariables(applyDensity(source, 'compact'), 'light');
    const comfortable = getCssVariables(applyDensity(source, 'comfortable'), 'light');
    expect(compact['--ui-space']).not.toBe(comfortable['--ui-space']);
    expect(compact['--ui-component-button-padding-left']).toBe('calc(var(--ui-space, 4px) * 5)');
    expect(comfortable['--ui-component-button-padding-left']).toBe(compact['--ui-component-button-padding-left']);
    const css = cssForTokens(source, 'dark');
    expect(css).toContain(':root[data-theme="dark"]');
    expect(css).toContain('--ui-component-card-margin-bottom: 18px;');
    expect(css).toContain(':root[data-theme] .ui-button:not(.ui-theme-scope *)');
    expect(css).toContain('padding-left: var(--ui-component-button-padding-left);');
    expect(css).toContain('margin-bottom: var(--ui-component-card-margin-bottom);');
    expect(cssForTokens(defaultTokens, 'light')).not.toContain('--ui-component-');
  });

  it('renders distinct scope rules and values for side-by-side themes on the server', () => {
    const source = customTokens();
    const markup = renderToStaticMarkup(<>
      <ThemeScope tokens={source} mode="light"><button className="ui-button">First</button></ThemeScope>
      <ThemeScope tokens={defaultTokens} mode="dark"><button className="ui-button">Second</button></ThemeScope>
    </>);
    const scopeIds = [...markup.matchAll(/<div[^>]*data-moru-spacing-scope="([^"]+)"/g)].map((match) => match[1]);
    expect(scopeIds).toHaveLength(2);
    expect(new Set(scopeIds).size).toBe(2);
    expect(markup).toContain(`[data-moru-spacing-scope="${scopeIds[0]}"] .ui-button`);
    expect(markup).not.toContain(`[data-moru-spacing-scope="${scopeIds[1]}"] .ui-button`);
    expect(markup).toContain('--ui-component-button-padding-left:calc(var(--ui-space, 4px) * 5)');
    expect(markup.match(/<style>/g)).toHaveLength(1);
    expect(markup).not.toContain(':root[data-theme]');
  });

  it('uses the same spacing scope and variables on the popup host', () => {
    vi.stubGlobal('document', { body: {} });
    const markup = renderToStaticMarkup(<ThemeScope tokens={customTokens()} mode="dark"><button className="ui-button">Open</button></ThemeScope>);
    const scopeIds = [...markup.matchAll(/<div[^>]*data-moru-spacing-scope="([^"]+)"/g)].map((match) => match[1]);
    expect(scopeIds).toHaveLength(2);
    expect(scopeIds[0]).toBe(scopeIds[1]);
    expect(markup).toContain('class="ui-theme-scope ui-theme-portal"');
    expect(markup.match(/--ui-component-card-margin-bottom:18px/g)).toHaveLength(2);
  });
});
