/** Shared component defaults. Absent sides deliberately keep the component's CSS. */
const registry = [
  { id: 'button', label: 'Button', category: 'interaction', selector: '.ui-button' },
  { id: 'field', label: 'Field', category: 'forms', selector: '.ui-field', description: '레이블·입력·설명을 함께 감싸는 영역' },
  { id: 'input', label: 'Input', category: 'forms', selector: '.ui-input' },
  { id: 'textarea', label: 'Textarea', category: 'forms', selector: '.ui-textarea' },
  { id: 'checkbox', label: 'Checkbox', category: 'forms', selector: '.ui-checkbox-label', description: '체크박스와 레이블을 함께 감싸는 영역' },
  { id: 'select', label: 'Select', category: 'forms', selector: '.ui-select', description: '선택한 값을 표시하는 입력 영역' },
  { id: 'dialog', label: 'Dialog', category: 'interaction', selector: '.ui-dialog', description: '열린 대화상자의 표면' },
  { id: 'menu', label: 'Dropdown Menu', category: 'interaction', selector: '.ui-menu', description: '열린 메뉴의 표면' },
  { id: 'tabs', label: 'Tabs', category: 'layout', selector: '.ui-tabs' },
  { id: 'card', label: 'Card', category: 'layout', selector: '.ui-card' },
  { id: 'switch', label: 'Switch', category: 'forms', selector: '.ui-switch-label', description: '스위치와 레이블을 함께 감싸는 영역' },
  { id: 'radio-group', label: 'Radio Group', category: 'forms', selector: '.ui-radio-group' },
  { id: 'slider', label: 'Slider', category: 'forms', selector: '.ui-slider' },
  { id: 'accordion', label: 'Accordion', category: 'interaction', selector: '.ui-accordion' },
  { id: 'popover', label: 'Popover', category: 'interaction', selector: '.ui-popover', description: '열린 팝오버의 표면' },
  { id: 'tooltip', label: 'Tooltip', category: 'interaction', selector: '.ui-tooltip', description: '도움말의 표면' },
  { id: 'badge', label: 'Badge', category: 'feedback', selector: '.ui-badge' },
  { id: 'alert', label: 'Alert', category: 'feedback', selector: '.ui-alert' },
  { id: 'avatar', label: 'Avatar', category: 'layout', selector: '.ui-avatar' },
  { id: 'progress', label: 'Progress', category: 'feedback', selector: '.ui-progress' },
  { id: 'separator', label: 'Separator', category: 'layout', selector: '.ui-separator' },
  { id: 'skeleton', label: 'Skeleton', category: 'feedback', selector: '.ui-skeleton' },
  { id: 'toast', label: 'Toast', category: 'feedback', selector: '.ui-toast' },
  { id: 'combobox', label: 'Combobox', category: 'forms', selector: '.ui-combobox' },
  { id: 'alert-dialog', label: 'Alert Dialog', category: 'interaction', selector: '.ui-alert-dialog', description: '확인 대화상자의 표면' },
  { id: 'sheet', label: 'Sheet', category: 'interaction', selector: '.ui-sheet', description: '열린 사이드 패널의 표면' },
  { id: 'empty', label: 'Empty', category: 'feedback', selector: '.ui-empty' },
  { id: 'table', label: 'Table', category: 'layout', selector: '.ui-table-scroll', description: '표를 감싸는 스크롤 영역' },
  { id: 'pagination', label: 'Pagination', category: 'layout', selector: '.ui-pagination' },
  { id: 'calendar', label: 'Calendar', category: 'forms', selector: '.ui-calendar' },
  { id: 'date-picker', label: 'Date Picker', category: 'forms', selector: '.ui-date-picker' },
  { id: 'command', label: 'Command', category: 'interaction', selector: '.ui-command', description: '열린 커맨드 창의 표면' },
  { id: 'toggle-group', label: 'Toggle Group', category: 'forms', selector: '.ui-toggle-group' },
  { id: 'aspect-ratio', label: 'Aspect Ratio', category: 'layout', selector: '.ui-aspect-ratio' },
  { id: 'button-group', label: 'Button Group', category: 'interaction', selector: '.ui-button-group' },
  { id: 'direction', label: 'Direction', category: 'layout', selector: '', description: '방향 컨텍스트는 화면 요소를 만들지 않아 간격을 적용하지 않습니다.' },
  { id: 'input-group', label: 'Input Group', category: 'forms', selector: '.ui-input-group' },
  { id: 'input-otp', label: 'Input OTP', category: 'forms', selector: '.ui-input-otp' },
  { id: 'item', label: 'Item', category: 'layout', selector: '.ui-item' },
  { id: 'kbd', label: 'Kbd', category: 'layout', selector: '.ui-kbd' },
  { id: 'label', label: 'Label', category: 'forms', selector: '.ui-label' },
  { id: 'native-select', label: 'Native Select', category: 'forms', selector: '.ui-native-select' },
  { id: 'spinner', label: 'Spinner', category: 'feedback', selector: '.ui-spinner' },
  { id: 'toggle', label: 'Toggle', category: 'forms', selector: '.ui-toggle' },
  { id: 'breadcrumb', label: 'Breadcrumb', category: 'layout', selector: '.ui-breadcrumb' },
  { id: 'collapsible', label: 'Collapsible', category: 'interaction', selector: '.ui-collapsible' },
  { id: 'context-menu', label: 'Context Menu', category: 'interaction', selector: '.ui-context-menu-trigger', description: '우클릭 메뉴를 여는 영역' },
  { id: 'drawer', label: 'Drawer', category: 'interaction', selector: '.ui-drawer', description: '열린 드로어의 표면' },
  { id: 'hover-card', label: 'Hover Card', category: 'interaction', selector: '.ui-hover-card', description: '열린 미리보기 카드의 표면' },
  { id: 'menubar', label: 'Menubar', category: 'interaction', selector: '.ui-menubar' },
  { id: 'navigation-menu', label: 'Navigation Menu', category: 'layout', selector: '.ui-navigation-menu' },
  { id: 'sidebar', label: 'Sidebar', category: 'layout', selector: '.ui-sidebar, .ui-sidebar-mobile-panel', description: '데스크톱·모바일 탐색 패널의 표면' },
  { id: 'carousel', label: 'Carousel', category: 'layout', selector: '.ui-carousel' },
  { id: 'chart', label: 'Chart', category: 'feedback', selector: '.ui-chart' },
  { id: 'data-table', label: 'Data Table', category: 'layout', selector: '.ui-data-table' },
  { id: 'resizable', label: 'Resizable', category: 'layout', selector: '.ui-resizable-group' },
  { id: 'scroll-area', label: 'Scroll Area', category: 'layout', selector: '.ui-scroll-area' },
  { id: 'typography', label: 'Typography', category: 'layout', selector: '.ui-typography' },
  { id: 'attachment', label: 'Attachment', category: 'forms', selector: '.ui-attachment' },
  { id: 'bubble', label: 'Bubble', category: 'layout', selector: '.ui-bubble' },
  { id: 'code-block', label: 'Code Block', category: 'layout', selector: '.ui-code-block' },
  { id: 'marker', label: 'Marker', category: 'feedback', selector: '.ui-marker' },
  { id: 'message', label: 'Message', category: 'layout', selector: '.ui-message' },
  { id: 'message-scroller', label: 'Message Scroller', category: 'layout', selector: '.ui-message-scroller' },
  { id: 'questionnaire', label: 'Questionnaire', category: 'forms', selector: '.ui-questionnaire' },
  { id: 'trace', label: 'Trace', category: 'feedback', selector: '.ui-trace' },
  { id: 'number-input', label: 'Number Input', category: 'forms', selector: '.ui-number-input' },
  { id: 'password-input', label: 'Password Input', category: 'forms', selector: '.ui-password-input' },
  { id: 'multi-select', label: 'Multi Select', category: 'forms', selector: '.ui-multi-select-root' },
  { id: 'file-input', label: 'File Input', category: 'forms', selector: '.ui-file-input' },
  { id: 'stepper', label: 'Stepper', category: 'layout', selector: '.ui-stepper' },
  { id: 'ring-progress', label: 'Ring Progress', category: 'feedback', selector: '.ui-ring-progress' },
  { id: 'date-range-picker', label: 'Date Range Picker', category: 'forms', selector: '.ui-date-range-picker' },
  { id: 'time-picker', label: 'Time Picker', category: 'forms', selector: '.ui-time-picker' },
  { id: 'time-range-picker', label: 'Time Range Picker', category: 'forms', selector: '.ui-time-range-picker' },
] as const;

export type ComponentSpacingKey = typeof registry[number]['id'];
export type ComponentSpacingTarget = {
  id: ComponentSpacingKey;
  label: string;
  category: 'interaction' | 'forms' | 'layout' | 'feedback';
  selector: string;
  description?: string;
};
export const componentSpacingTargets: readonly ComponentSpacingTarget[] = registry;
export type SpacingSide = 'top' | 'right' | 'bottom' | 'left';
export type SpacingLength = { value: number; unit: 'space' | 'px' };
export type SpacingBox = 'padding' | 'margin';
type BoxOverrides = Partial<Record<SpacingSide, SpacingLength>>;
type ComponentOverrides = Partial<Record<SpacingBox, BoxOverrides>>;
export type ComponentSpacingOverrides = Partial<Record<ComponentSpacingKey, ComponentOverrides>>;

export const spacingSides = ['top', 'right', 'bottom', 'left'] as const;
const boxes = ['padding', 'margin'] as const;
const targetIds = new Set<string>(componentSpacingTargets.map((target) => target.id));
const own = (value: object, key: PropertyKey) => Object.prototype.hasOwnProperty.call(value, key);
const record = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

function parseLength(value: unknown): SpacingLength | undefined {
  if (!record(value) || !own(value, 'value') || !own(value, 'unit')) return;
  const amount = value.value;
  const unit = value.unit;
  if (typeof amount !== 'number' || !Number.isFinite(amount) || (unit !== 'space' && unit !== 'px')) return;
  const max = unit === 'space' ? 24 : 96;
  const step = unit === 'space' ? 0.25 : 0.5;
  return { value: Math.round(Math.min(max, Math.max(0, amount)) / step) * step, unit };
}

/** Accept only registry keys and own, finite numeric lengths; always return new objects. */
export function validateComponentSpacing(value: unknown, fallback: ComponentSpacingOverrides = {}): ComponentSpacingOverrides {
  const safeFallback = readOverrides(fallback);
  return readOverrides(value, safeFallback);
}

function readOverrides(value: unknown, fallback: ComponentSpacingOverrides = {}): ComponentSpacingOverrides {
  if (!record(value)) return cloneOverrides(fallback);
  const result: ComponentSpacingOverrides = {};
  for (const { id, selector } of componentSpacingTargets) {
    if (!selector || !own(value, id)) continue;
    const entry = value[id];
    const previous = fallback[id];
    if (!record(entry)) {
      if (previous) result[id] = cloneComponent(previous);
      continue;
    }
    const parsed: ComponentOverrides = {};
    for (const box of boxes) {
      if (!own(entry, box)) continue;
      const sides = entry[box];
      if (!record(sides)) {
        if (previous?.[box]) parsed[box] = cloneBox(previous[box]);
        continue;
      }
      const parsedSides: BoxOverrides = {};
      for (const side of spacingSides) {
        if (!own(sides, side)) continue;
        const length = parseLength(sides[side]) ?? parseLength(previous?.[box]?.[side]);
        if (length) parsedSides[side] = length;
      }
      if (Object.keys(parsedSides).length) parsed[box] = parsedSides;
    }
    if (Object.keys(parsed).length) result[id] = parsed;
  }
  return result;
}

function cloneBox(value: BoxOverrides): BoxOverrides {
  const result: BoxOverrides = {};
  for (const side of spacingSides) if (value[side]) result[side] = { ...value[side] };
  return result;
}

function cloneComponent(value: ComponentOverrides): ComponentOverrides {
  const result: ComponentOverrides = {};
  for (const box of boxes) if (value[box]) result[box] = cloneBox(value[box]);
  return result;
}

function cloneOverrides(value: ComponentSpacingOverrides): ComponentSpacingOverrides {
  const result: ComponentSpacingOverrides = {};
  for (const { id } of componentSpacingTargets) if (value[id]) result[id] = cloneComponent(value[id]);
  return result;
}

export function withComponentSpacing(
  tokens: { componentSpacing?: ComponentSpacingOverrides },
  key: ComponentSpacingKey,
  box: SpacingBox,
  side: SpacingSide,
  value: SpacingLength | null,
  linked = false,
): ComponentSpacingOverrides {
  const result = validateComponentSpacing(tokens.componentSpacing);
  if (!targetIds.has(key) || !componentSpacingTargets.find((target) => target.id === key)?.selector || !boxes.includes(box) || !spacingSides.includes(side)) return result;
  const length = value === null ? null : parseLength(value);
  if (length === undefined) return result;
  const entry = result[key] ?? {};
  const sides = entry[box] ?? {};
  for (const targetSide of linked ? spacingSides : [side]) {
    if (length === null) delete sides[targetSide];
    else sides[targetSide] = { ...length };
  }
  if (Object.keys(sides).length) entry[box] = sides;
  else delete entry[box];
  if (Object.keys(entry).length) result[key] = entry;
  else delete result[key];
  return result;
}

function variableName(key: ComponentSpacingKey, box: SpacingBox, side: SpacingSide): string {
  return `--ui-component-${key}-${box}-${side}`;
}

export function getComponentSpacingVariables(overrides: ComponentSpacingOverrides): Record<string, string> {
  const result: Record<string, string> = {};
  const safe = validateComponentSpacing(overrides);
  for (const { id } of componentSpacingTargets) {
    for (const box of boxes) for (const side of spacingSides) {
      const length = safe[id]?.[box]?.[side];
      if (length) result[variableName(id, box, side)] = length.unit === 'px' ? `${length.value}px` : `calc(var(--ui-space, 4px) * ${length.value})`;
    }
  }
  return result;
}

const autoHeightControls = new Set<ComponentSpacingKey>(['button', 'input', 'select', 'native-select', 'toggle']);

/** Rules use variables from getComponentSpacingVariables, so themes can override them locally. */
export function getComponentSpacingCss(overrides: ComponentSpacingOverrides, scopeSelector?: string): string {
  const safe = validateComponentSpacing(overrides);
  const prefix = scopeSelector ?? ':root[data-theme]';
  const exclusion = scopeSelector ? `:not(${scopeSelector} .ui-theme-scope *)` : ':not(.ui-theme-scope *)';
  const rules: string[] = [];
  for (const { id, selector } of componentSpacingTargets) {
    const entry = safe[id];
    if (!selector || !entry) continue;
    const selectors = selector.split(',').map((part) => `${prefix} ${part.trim()}${exclusion}`);
    const declarations: string[] = [];
    for (const box of boxes) for (const side of spacingSides) {
      if (entry[box]?.[side]) declarations.push(`  ${box}-${side}: var(${variableName(id, box, side)});`);
    }
    if ((entry.margin?.left?.value ?? 0) > 0 || (entry.margin?.right?.value ?? 0) > 0) {
      // An unconfigured side must not pick up a variable inherited from another theme scope.
      const left = entry.margin?.left ? `var(${variableName(id, 'margin', 'left')}, 0px)` : '0px';
      const right = entry.margin?.right ? `var(${variableName(id, 'margin', 'right')}, 0px)` : '0px';
      declarations.push(`  max-width: max(0px, calc(100% - ${left} - ${right}));`);
    }
    if (declarations.length) rules.push(`${selectors.join(',\n')} {\n${declarations.join('\n')}\n}`);
    const verticalMargins = (entry.margin?.top?.value ?? 0) > 0 || (entry.margin?.bottom?.value ?? 0) > 0;
    const verticalPadding = Boolean(entry.padding?.top || entry.padding?.bottom);
    if (verticalMargins || verticalPadding) {
      const top = entry.margin?.top ? `var(${variableName(id, 'margin', 'top')}, 0px)` : '0px';
      const bottom = entry.margin?.bottom ? `var(${variableName(id, 'margin', 'bottom')}, 0px)` : '0px';
      // Canvas positions stay fixed; the rendered surface must fit its margins inside that box.
      rules.push(`${selectors.map((part) => `${part}:is(.sim-component *)`).join(',\n')} {\n  min-height: 0;\n  max-height: max(0px, calc(100% - ${top} - ${bottom}));\n}`);
    }
    if (autoHeightControls.has(id) && verticalPadding) {
      rules.push(`${selectors.map((part) => `${part}:not(.sim-component *)`).join(',\n')} {\n  height: auto;\n  min-height: var(--ui-resolved-control-height, var(--ui-control-height, 40px));\n}`);
    }
  }
  return rules.join('\n\n');
}
