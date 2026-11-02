import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { components } from '../components/component-catalog';
import {
  componentSpacingTargets, getComponentSpacingCss, getComponentSpacingVariables,
  validateComponentSpacing, withComponentSpacing, type ComponentSpacingKey,
  type ComponentSpacingOverrides, type SpacingLength,
} from './component-spacing';

function freeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

describe('shared component spacing registry', () => {
  it('covers every gallery component once and uses existing component classes', () => {
    const ids = componentSpacingTargets.map((target) => target.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(components.map((component) => component.id).sort());
    const directory = new URL('../components/ui/', import.meta.url);
    const source = readdirSync(directory).filter((name) => name.endsWith('.tsx') && !name.endsWith('.test.tsx')).map((name) => readFileSync(new URL(name, directory), 'utf8')).join('\n');
    for (const target of componentSpacingTargets) {
      if (target.id === 'direction') {
        expect(target.selector).toBe('');
        expect(target.description).toContain('화면 요소를 만들지 않아');
      } else {
        for (const selector of target.selector.split(',')) {
          expect(selector.trim()).toMatch(/^\.ui-[a-z-]+$/);
          expect(source.includes(selector.trim().slice(1)), `${target.id} needs an existing spacing selector: ${selector}`).toBe(true);
        }
      }
    }
  });

  it('keeps original component CSS untouched until a side has been configured', () => {
    expect(validateComponentSpacing(undefined)).toEqual({});
    expect(validateComponentSpacing({})).toEqual({});
    expect(getComponentSpacingVariables({})).toEqual({});
    expect(getComponentSpacingCss({})).toBe('');
    expect(withComponentSpacing({}, 'direction', 'padding', 'top', { value: 2, unit: 'space' })).toEqual({});
  });
});

describe('component spacing validation', () => {
  it('bounds and rounds lengths while discarding unsafe values and unsupported keys', () => {
    const input = JSON.parse('{"button":{"padding":{"top":{"value":1000,"unit":"space"},"right":{"value":-3,"unit":"px"},"bottom":{"value":1.37,"unit":"space"},"left":{"value":12.26,"unit":"px"}},"margin":{"top":{"value":"4","unit":"px"},"inlineStart":{"value":4,"unit":"px"}},"constructor":{"polluted":true}},"unknown":{"padding":{"top":{"value":4,"unit":"px"}}},"__proto__":{"polluted":true}}');
    expect(validateComponentSpacing(input)).toEqual({ button: { padding: {
      top: { value: 24, unit: 'space' }, right: { value: 0, unit: 'px' },
      bottom: { value: 1.25, unit: 'space' }, left: { value: 12.5, unit: 'px' },
    } } });
    expect(validateComponentSpacing({ input: { padding: { top: { value: Infinity, unit: 'px' }, right: { value: NaN, unit: 'space' }, bottom: { value: 2, unit: 'rem' } } } })).toEqual({});
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it('reads own known keys only at every level', () => {
    expect(validateComponentSpacing(Object.create({ button: { padding: { top: { value: 2, unit: 'space' } } } }))).toEqual({});
    expect(validateComponentSpacing({ button: Object.create({ padding: { top: { value: 2, unit: 'space' } } }) })).toEqual({});
    expect(validateComponentSpacing({ button: { padding: Object.create({ top: { value: 2, unit: 'space' } }) } })).toEqual({});
    expect(validateComponentSpacing({ button: { padding: { top: Object.create({ value: 2, unit: 'space' }) } } })).toEqual({});
    expect(validateComponentSpacing({ direction: { padding: { top: { value: 2, unit: 'px' } } } })).toEqual({});
  });

  it('uses valid fallback values for malformed imported entries without restoring omitted settings', () => {
    const fallback = freeze<ComponentSpacingOverrides>({ button: { padding: { top: { value: 2, unit: 'space' }, left: { value: 8, unit: 'px' } } } });
    for (const value of [undefined, null, [], false, 'bad']) {
      const restored = validateComponentSpacing(value, fallback);
      expect(restored).toEqual(fallback);
      expect(restored).not.toBe(fallback);
      expect(restored.button?.padding?.top).not.toBe(fallback.button?.padding?.top);
    }
    expect(validateComponentSpacing({}, fallback)).toEqual({});
    expect(validateComponentSpacing({ button: { padding: { top: { value: Infinity, unit: 'space' } } } }, fallback)).toEqual({ button: { padding: { top: { value: 2, unit: 'space' } } } });
    expect(validateComponentSpacing({ button: { padding: [] } }, fallback)).toEqual(fallback);
    expect(validateComponentSpacing({ button: null }, fallback)).toEqual(fallback);
    expect(validateComponentSpacing({ button: {} }, fallback)).toEqual({});
  });

  it('returns fully independent objects after validation and linked edits', () => {
    const original = freeze<ComponentSpacingOverrides>({ card: { padding: { top: { value: 2, unit: 'space' } }, margin: { left: { value: 4, unit: 'px' } } } });
    const tokens = freeze({ componentSpacing: original });
    const edited = withComponentSpacing(tokens, 'button', 'padding', 'top', { value: 1.5, unit: 'space' }, true);
    expect(original).toEqual({ card: { padding: { top: { value: 2, unit: 'space' } }, margin: { left: { value: 4, unit: 'px' } } } });
    expect(edited.card).toEqual(original.card);
    expect(edited.card).not.toBe(original.card);
    expect(edited.card?.padding?.top).not.toBe(original.card?.padding?.top);
    expect(edited.button?.padding).toEqual(Object.fromEntries(['top', 'right', 'bottom', 'left'].map((side) => [side, { value: 1.5, unit: 'space' }])));
    edited.button!.padding!.top!.value = 3;
    expect(edited.button!.padding!.bottom!.value).toBe(1.5);
    const unlinked = withComponentSpacing({ componentSpacing: edited }, 'button', 'padding', 'left', null);
    expect(unlinked.button?.padding?.left).toBeUndefined();
    expect(unlinked.button?.padding?.top).toEqual({ value: 3, unit: 'space' });
    const reset = withComponentSpacing({ componentSpacing: unlinked }, 'button', 'padding', 'top', null, true);
    expect(reset.button).toBeUndefined();
    expect(reset.card).toEqual(original.card);
  });

  it('ignores invalid helper input atomically', () => {
    const componentSpacing: ComponentSpacingOverrides = { button: { padding: { top: { value: 2, unit: 'space' } } } };
    expect(withComponentSpacing({ componentSpacing }, 'button', 'padding', 'top', { value: NaN, unit: 'px' }, true)).toEqual(componentSpacing);
    expect(withComponentSpacing({ componentSpacing }, '__proto__' as ComponentSpacingKey, 'padding', 'top', { value: 1, unit: 'px' })).toEqual(componentSpacing);
    expect(withComponentSpacing({ componentSpacing }, 'button', 'padding', 'top', { value: 2, unit: 'rem' } as unknown as SpacingLength)).toEqual(componentSpacing);
  });
});

describe('component spacing CSS', () => {
  it('resolves unit-based and fixed lengths and emits only configured properties', () => {
    const spacing: ComponentSpacingOverrides = { button: { padding: { left: { value: 2.5, unit: 'space' } } }, card: { margin: { top: { value: 12.5, unit: 'px' } } } };
    expect(getComponentSpacingVariables(spacing)).toEqual({ '--ui-component-button-padding-left': 'calc(var(--ui-space, 4px) * 2.5)', '--ui-component-card-margin-top': '12.5px' });
    const css = getComponentSpacingCss(spacing);
    expect(css).toContain('padding-left: var(--ui-component-button-padding-left);');
    expect(css).toContain('margin-top: var(--ui-component-card-margin-top);');
    expect(css).not.toContain('padding-top:');
    expect(css).not.toContain('padding-right:');
    expect(css).not.toContain('height: auto;');
    expect(css).not.toContain('!important');
    expect(css).not.toContain('NaN');
    expect(css).not.toContain('undefined');
  });

  it('isolates global defaults from comparison themes and limits rules to UI primitives', () => {
    const css = getComponentSpacingCss({ input: { padding: { top: { value: 0, unit: 'space' } } } });
    expect(css).toContain(':root[data-theme] .ui-input:not(.ui-theme-scope *)');
    expect(css).toContain(':not(.sim-component *)');
    expect(css).toContain('height: auto;');
    expect(css).toContain('min-height: var(--ui-resolved-control-height, var(--ui-control-height, 40px));');
    expect(css).not.toMatch(/(?:^|\n)button[ ,{]/);
    expect(getComponentSpacingCss({ button: { margin: { top: { value: 8, unit: 'px' } } } })).not.toContain('height: auto;');
  });

  it('uses explicit local scopes and keeps nested comparison themes independent', () => {
    const scope = '[data-moru-spacing-scope="test"]';
    const css = getComponentSpacingCss({ dialog: { padding: { top: { value: 4, unit: 'space' } } }, sidebar: { padding: { left: { value: 2, unit: 'space' } } } }, scope);
    expect(css).toContain(`${scope} .ui-dialog:not(${scope} .ui-theme-scope *)`);
    expect(css).toContain(`${scope} .ui-sidebar:not(${scope} .ui-theme-scope *)`);
    expect(css).toContain(`${scope} .ui-sidebar-mobile-panel:not(${scope} .ui-theme-scope *)`);
    expect(css).not.toContain(':root');
  });

  it('keeps width-constrained components inside their container when horizontal margins change', () => {
    const css = getComponentSpacingCss({ input: { margin: { left: { value: 8, unit: 'px' }, right: { value: 2, unit: 'space' } } } });
    expect(css).toContain('max-width: max(0px, calc(100% - var(--ui-component-input-margin-left, 0px) - var(--ui-component-input-margin-right, 0px)));');
    const leftOnly = getComponentSpacingCss({ input: { margin: { left: { value: 8, unit: 'px' } } } }, '[data-moru-spacing-scope="local"]');
    expect(leftOnly).toContain('calc(100% - var(--ui-component-input-margin-left, 0px) - 0px)');
    expect(leftOnly).not.toContain('--ui-component-input-margin-right');
    expect(getComponentSpacingCss({ input: { margin: { left: { value: 0, unit: 'px' } } } })).not.toContain('max-width:');
  });

  it('fits vertical margins inside fixed simulator nodes without changing normal document flow', () => {
    const css = getComponentSpacingCss({ button: { margin: { top: { value: 8, unit: 'px' }, bottom: { value: 8, unit: 'px' } } }, card: { margin: { top: { value: 8, unit: 'px' } } } });
    const rules = css.split('\n\n');
    const simulatorRules = rules.filter((rule) => rule.includes(':is(.sim-component *)'));
    expect(simulatorRules).toHaveLength(2);
    expect(simulatorRules[0]).toContain('.ui-button:not(.ui-theme-scope *):is(.sim-component *)');
    expect(simulatorRules[0]).toContain('max-height: max(0px, calc(100% - var(--ui-component-button-margin-top, 0px) - var(--ui-component-button-margin-bottom, 0px)));');
    expect(simulatorRules[1]).toContain('calc(100% - var(--ui-component-card-margin-top, 0px) - 0px)');
    for (const rule of rules.filter((rule) => !rule.includes(':is(.sim-component *)'))) expect(rule).not.toContain('height:');
    expect(css).not.toContain('height: auto;');
    expect(getComponentSpacingCss({ button: { margin: { top: { value: 0, unit: 'px' } } } })).not.toContain('max-height:');
    expect(getComponentSpacingCss({})).toBe('');
  });

  it('lets configured vertical padding fit simulator nodes without imposing the normal control minimum height', () => {
    const css = getComponentSpacingCss({ input: { padding: { top: { value: 8, unit: 'px' }, bottom: { value: 8, unit: 'px' } } } }, '[data-moru-spacing-scope="canvas"]');
    const simulatorRule = css.split('\n\n').find((rule) => rule.includes(':is(.sim-component *)'))!;
    expect(simulatorRule).toContain('min-height: 0;');
    expect(simulatorRule).toContain('max-height: max(0px, calc(100% - 0px - 0px));');
    expect(simulatorRule).not.toContain('height: auto;');
    expect(simulatorRule).not.toContain('--ui-resolved-control-height');
    expect(css).toContain(':not(.sim-component *) {\n  height: auto;');
  });
});
