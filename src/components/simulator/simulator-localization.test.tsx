import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MoruLocaleProvider, messagesFor } from '../../i18n'
import { simulatorMessages } from '../../i18n/messages/simulator'
import { appMessages } from '../../i18n/messages/app'
import { createSimNode } from './simulator-model'
import { SimulatorNodeView } from './SimulatorNodeView'

describe('simulator locale changes', () => {
  it('keeps a label-based fallback tab selection stable across languages', () => {
    const node = createSimNode('tabs', 'localized-tabs')
    node.props.options = []
    node.props.value = '활동'
    for (const locale of ['en', 'ja', 'zh-CN'] as const) {
      const messages = messagesFor({ ...appMessages, ...simulatorMessages }, locale)
      const html = renderToStaticMarkup(
        <MoruLocaleProvider locale={locale} messages={messages}>
          <SimulatorNodeView node={node} interactive />
        </MoruLocaleProvider>,
      )
      const selectedTab = html.match(
        /<button\b[^>]*aria-selected="true"[^>]*>[\s\S]*?<\/button>/,
      )?.[0]
      expect(selectedTab).toContain(messages['활동'])
      expect(node.props.value).toBe('활동')
      expect(node.props.options).toEqual([])
    }
  })
})
